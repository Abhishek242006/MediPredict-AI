import csv
from datetime import datetime
import io
import json
from pathlib import Path
import pickle
import sqlite3
from flask import (
    Flask, abort, jsonify, make_response, redirect,
    render_template, request, url_for
)
import numpy as np
import pandas as pd

from disease_data import (
    DISEASE_INFO, SYMPTOM_CATEGORIES, SYMPTOM_ICONS,
    SYMPTOM_LABELS, SYMPTOM_PRESETS, SYMPTOMS, evaluate_triage_risk
)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "disease_model.pkl"
METADATA_PATH = BASE_DIR / "models" / "model_metadata.json"
DB_PATH = BASE_DIR / "predictions.db"

app = Flask(__name__)
app.config["SECRET_KEY"] = "medipredict-ai-secret-key-2026"

def init_db():
    """Initializes and migrates SQLite database schema."""
    conn = sqlite3.connect(DB_PATH)
    try:
        with conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS prediction_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symptoms TEXT NOT NULL,
                    prediction TEXT NOT NULL,
                    confidence REAL DEFAULT 0.0,
                    risk_level TEXT DEFAULT 'Low / Routine',
                    patient_age_group TEXT DEFAULT 'Adult (18-64)',
                    symptom_duration TEXT DEFAULT '2-5 days',
                    notes TEXT DEFAULT '',
                    created_at TEXT NOT NULL
                )
            """)
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(prediction_history)")
            columns = [row[1] for row in cursor.fetchall()]
            new_cols = [
                ("confidence", "REAL DEFAULT 0.0"),
                ("risk_level", "TEXT DEFAULT 'Low / Routine'"),
                ("patient_age_group", "TEXT DEFAULT 'Adult (18-64)'"),
                ("symptom_duration", "TEXT DEFAULT '2-5 days'"),
                ("notes", "TEXT DEFAULT ''")
            ]
            for col_name, col_type in new_cols:
                if col_name not in columns:
                    try:
                        conn.execute(f"ALTER TABLE prediction_history ADD COLUMN {col_name} {col_type}")
                    except sqlite3.OperationalError:
                        pass
    finally:
        conn.close()

def load_model():
    """Loads trained ML model binary."""
    if not MODEL_PATH.exists():
        return None
    try:
        with MODEL_PATH.open("rb") as f:
            return pickle.load(f)
    except Exception:
        return None

def load_metadata():
    """Loads machine learning metrics and feature importance metadata."""
    if not METADATA_PATH.exists():
        return None
    try:
        with METADATA_PATH.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None

MODEL = load_model()
METADATA = load_metadata()
init_db()

@app.context_processor
def inject_global_data():
    """Injects common constants across all Jinja2 templates."""
    return {
        "current_year": datetime.now().year,
        "total_conditions_count": len(DISEASE_INFO),
        "total_symptoms_count": len(SYMPTOMS)
    }

# ==============================================================================
# WEB APPLICATION ROUTES
# ==============================================================================

@app.route("/")
def home():
    """Landing page with project overview, statistics, and quick-start links."""
    total_checks = 0
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM prediction_history")
        total_checks = cur.fetchone()[0]
    except Exception:
        total_checks = 0
    finally:
        conn.close()

    return render_template(
        "index.html",
        total_checks=total_checks,
        presets=SYMPTOM_PRESETS[:3],
        featured_conditions=list(DISEASE_INFO.keys())[:6]
    )

@app.route("/checker")
def checker():
    """Interactive multi-category symptom checker with search and presets."""
    return render_template(
        "checker.html",
        symptoms=SYMPTOMS,
        labels=SYMPTOM_LABELS,
        categories=SYMPTOM_CATEGORIES,
        icons=SYMPTOM_ICONS,
        presets=SYMPTOM_PRESETS
    )

@app.route("/about")
def about():
    """Project architecture, ethical AI guidelines, and technology stack."""
    return render_template("about.html")

@app.route("/conditions")
def conditions():
    """Searchable medical encyclopedia of all illnesses covered by the model."""
    search_query = request.args.get("q", "").strip().lower()
    selected_category = request.args.get("category", "").strip()

    filtered_conditions = {}
    categories = sorted(list({info.get("category", "General") for info in DISEASE_INFO.values()}))

    for name, info in DISEASE_INFO.items():
        if selected_category and info.get("category") != selected_category:
            continue
        if search_query:
            query_match = (
                search_query in name.lower() or
                search_query in info.get("description", "").lower() or
                any(search_query in sym.lower() for sym in info.get("typical_symptoms", []))
            )
            if not query_match:
                continue
        filtered_conditions[name] = info

    return render_template(
        "conditions.html",
        conditions=filtered_conditions,
        categories=categories,
        search_query=search_query,
        selected_category=selected_category
    )

@app.route("/conditions/<condition_name>")
def condition_detail(condition_name):
    """Detailed medical briefing page for a specific condition."""
    info = DISEASE_INFO.get(condition_name)
    if not info:
        abort(404)
    return render_template(
        "condition_detail.html",
        condition_name=condition_name,
        info=info
    )

@app.route("/analytics")
def analytics():
    """Model evaluation metrics, confusion matrix, and feature importances."""
    metadata = load_metadata()
    return render_template(
        "analytics.html",
        metadata=metadata
    )

@app.route("/history")
def history():
    """Audit log of demo predictions with search, filter, and export features."""
    condition_filter = request.args.get("condition", "").strip()
    risk_filter = request.args.get("risk", "").strip()

    query = "SELECT id, symptoms, prediction, confidence, risk_level, patient_age_group, symptom_duration, created_at FROM prediction_history WHERE 1=1"
    params = []

    if condition_filter:
        query += " AND prediction = ?"
        params.append(condition_filter)
    if risk_filter:
        query += " AND risk_level LIKE ?"
        params.append(f"%{risk_filter}%")

    query += " ORDER BY id DESC"

    records = []
    total_records = 0
    most_common_condition = "None yet"

    conn = sqlite3.connect(DB_PATH)
    try:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute(query, params)
        records = [dict(row) for row in cur.fetchall()]

        # Summary stats
        cur.execute("SELECT COUNT(*), COUNT(DISTINCT prediction) FROM prediction_history")
        stats_row = cur.fetchone()
        total_records = stats_row[0] if stats_row else 0

        cur.execute("SELECT prediction, COUNT(*) as c FROM prediction_history GROUP BY prediction ORDER BY c DESC LIMIT 1")
        top_row = cur.fetchone()
        most_common_condition = top_row[0] if top_row else "None yet"
    finally:
        conn.close()

    return render_template(
        "history.html",
        records=records,
        total_records=total_records,
        most_common_condition=most_common_condition,
        condition_filter=condition_filter,
        risk_filter=risk_filter,
        conditions=sorted(list(DISEASE_INFO.keys()))
    )

@app.route("/history/delete/<int:item_id>", methods=["POST"])
def delete_history_item(item_id):
    """Deletes an individual history item."""
    conn = sqlite3.connect(DB_PATH)
    try:
        with conn:
            conn.execute("DELETE FROM prediction_history WHERE id = ?", (item_id,))
    finally:
        conn.close()
    return redirect(url_for("history"))

@app.route("/history/clear", methods=["POST"])
def clear_history():
    """Clears all records in demo history."""
    conn = sqlite3.connect(DB_PATH)
    try:
        with conn:
            conn.execute("DELETE FROM prediction_history")
    finally:
        conn.close()
    return redirect(url_for("history"))

@app.route("/export/csv")
def export_csv():
    """Exports prediction history as a CSV spreadsheet."""
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT id, created_at, prediction, confidence, risk_level, patient_age_group, symptom_duration, symptoms FROM prediction_history ORDER BY id DESC")
        rows = cur.fetchall()
    finally:
        conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp", "Prediction", "Confidence (%)", "Risk Level", "Age Group", "Duration", "Symptoms"])
    for row in rows:
        writer.writerow([
            row["id"], row["created_at"], row["prediction"],
            row["confidence"], row["risk_level"], row["patient_age_group"],
            row["symptom_duration"], row["symptoms"]
        ])

    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = "attachment; filename=medipredict_history.csv"
    response.headers["Content-type"] = "text/csv; charset=utf-8"
    return response

# ==============================================================================
# PREDICTION INFERENCE ENDPOINT
# ==============================================================================

@app.route("/predict", methods=["POST"])
def predict():
    """Processes symptom submissions, runs model inference, and renders results."""
    global MODEL
    if MODEL is None:
        MODEL = load_model()

    selected = [s for s in request.form.getlist("symptoms") if s in SYMPTOMS]
    age_group = request.form.get("age_group", "Adult (18-64)")
    duration = request.form.get("duration", "2-5 days")

    if not selected:
        return render_template(
            "checker.html",
            symptoms=SYMPTOMS,
            labels=SYMPTOM_LABELS,
            categories=SYMPTOM_CATEGORIES,
            icons=SYMPTOM_ICONS,
            presets=SYMPTOM_PRESETS,
            error="Please select at least one symptom before continuing."
        ), 400

    if MODEL is None:
        return render_template(
            "checker.html",
            symptoms=SYMPTOMS,
            labels=SYMPTOM_LABELS,
            categories=SYMPTOM_CATEGORIES,
            icons=SYMPTOM_ICONS,
            presets=SYMPTOM_PRESETS,
            error="The model binary is not available. Run: python train_model.py"
        ), 503

    # Keep feature order identical to the training dataset with feature column names.
    features = pd.DataFrame([[1 if symptom in selected else 0 for symptom in SYMPTOMS]], columns=SYMPTOMS)

    try:
        prediction = str(MODEL.predict(features)[0])
    except Exception:
        return render_template(
            "checker.html",
            symptoms=SYMPTOMS,
            labels=SYMPTOM_LABELS,
            categories=SYMPTOM_CATEGORIES,
            icons=SYMPTOM_ICONS,
            presets=SYMPTOM_PRESETS,
            error="The model could not process this input. Please try again."
        ), 500

    # Calculate probabilities & differential diagnoses
    top_differentials = []
    confidence = 85.0
    if hasattr(MODEL, "predict_proba"):
        try:
            probs = MODEL.predict_proba(features)[0]
            classes = MODEL.classes_
            sorted_indices = np.argsort(probs)[::-1]
            for idx in sorted_indices[:3]:
                cond_name = str(classes[idx])
                prob_pct = round(float(probs[idx]) * 100, 1)
                top_differentials.append({
                    "condition": cond_name,
                    "probability": prob_pct,
                    "info": DISEASE_INFO.get(cond_name, {})
                })
            confidence = top_differentials[0]["probability"] if top_differentials else 85.0
        except Exception:
            pass

    if not top_differentials:
        top_differentials.append({
            "condition": prediction,
            "probability": 85.0,
            "info": DISEASE_INFO.get(prediction, {})
        })

    # Evaluate triage risk
    triage = evaluate_triage_risk(selected, prediction)

    # Symptom explainability breakdown
    selected_display = [SYMPTOM_LABELS.get(s, s) for s in selected]
    condition_info = DISEASE_INFO.get(prediction, {
        "category": "General",
        "description": "General health condition pattern detected from input symptoms.",
        "risk_level": "Moderate",
        "duration": "Variable",
        "typical_symptoms": [],
        "self_care": ["Rest and stay hydrated.", "Consult a doctor if symptoms worsen."],
        "when_to_see_doctor": "Seek medical attention if high fever, severe pain, or difficulty breathing occurs.",
        "precautions": "Maintain personal hygiene and monitor symptoms.",
        "specialist": "General Physician"
    })

    # Save to SQLite database
    symptoms_text = ", ".join(selected_display)
    conn = sqlite3.connect(DB_PATH)
    try:
        with conn:
            conn.execute(
                """
                INSERT INTO prediction_history
                (symptoms, prediction, confidence, risk_level, patient_age_group, symptom_duration, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (symptoms_text, prediction, confidence, triage["level"], age_group, duration,
                 datetime.now().strftime("%Y-%m-%d %H:%M"))
            )
    except Exception:
        pass
    finally:
        conn.close()

    return render_template(
        "result.html",
        selected_symptoms=selected_display,
        selected_raw=selected,
        prediction=prediction,
        confidence=confidence,
        triage=triage,
        differentials=top_differentials,
        info=condition_info,
        age_group=age_group,
        duration=duration,
        generated_at=datetime.now().strftime("%d %b %Y, %I:%M %p")
    )

# ==============================================================================
# REST API ENDPOINTS
# ==============================================================================

@app.route("/api/predict", methods=["POST"])
def api_predict():
    """REST API: Predicts condition from JSON payload {'symptoms': ['fever', 'cough']}."""
    global MODEL
    if MODEL is None:
        MODEL = load_model()

    data = request.get_json(silent=True) or {}
    req_symptoms = data.get("symptoms", [])

    if not isinstance(req_symptoms, list):
        return jsonify({"status": "error", "message": "'symptoms' must be a list of strings."}), 400

    selected = [s for s in req_symptoms if s in SYMPTOMS]
    if not selected:
        return jsonify({
            "status": "error",
            "message": "At least one valid symptom is required.",
            "valid_symptoms": SYMPTOMS
        }), 400

    if MODEL is None:
        return jsonify({"status": "error", "message": "Model not loaded. Train first."}), 503

    features = pd.DataFrame([[1 if s in selected else 0 for s in SYMPTOMS]], columns=SYMPTOMS)
    prediction = str(MODEL.predict(features)[0])

    top_diffs = []
    confidence = 85.0
    if hasattr(MODEL, "predict_proba"):
        try:
            probs = MODEL.predict_proba(features)[0]
            classes = MODEL.classes_
            sorted_indices = np.argsort(probs)[::-1]
            for idx in sorted_indices[:3]:
                top_diffs.append({
                    "condition": str(classes[idx]),
                    "probability": round(float(probs[idx]) * 100, 1)
                })
            confidence = top_diffs[0]["probability"]
        except Exception:
            pass

    triage = evaluate_triage_risk(selected, prediction)
    info = DISEASE_INFO.get(prediction, {})

    return jsonify({
        "status": "success",
        "prediction": prediction,
        "confidence": confidence,
        "triage": triage,
        "differential_diagnoses": top_diffs,
        "condition_details": info,
        "selected_symptoms": [SYMPTOM_LABELS.get(s, s) for s in selected]
    })

@app.route("/api/symptoms")
def api_symptoms():
    """REST API: Returns available symptoms catalog, labels, and categories."""
    return jsonify({
        "status": "success",
        "total": len(SYMPTOMS),
        "symptoms": [
            {
                "id": s,
                "label": SYMPTOM_LABELS.get(s, s),
                "icon": SYMPTOM_ICONS.get(s, "•"),
                "category": next((cat for cat, syms in SYMPTOM_CATEGORIES.items() if s in syms), "Other")
            }
            for s in SYMPTOMS
        ],
        "categories": SYMPTOM_CATEGORIES,
        "presets": SYMPTOM_PRESETS
    })

@app.route("/api/conditions")
def api_conditions():
    """REST API: Returns the medical condition encyclopedia."""
    return jsonify({
        "status": "success",
        "total": len(DISEASE_INFO),
        "conditions": DISEASE_INFO
    })

@app.route("/api/history")
def api_history():
    """REST API: Returns history records."""
    records = []
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM prediction_history ORDER BY id DESC LIMIT 100")
        records = [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()
    return jsonify({
        "status": "success",
        "count": len(records),
        "records": records
    })

@app.route("/api/history/<int:item_id>", methods=["DELETE"])
def api_delete_history(item_id):
    """REST API: Deletes a specific history record."""
    conn = sqlite3.connect(DB_PATH)
    try:
        with conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM prediction_history WHERE id = ?", (item_id,))
            if cur.rowcount == 0:
                return jsonify({"status": "error", "message": "Record not found"}), 404
    finally:
        conn.close()
    return jsonify({"status": "success", "message": f"Record {item_id} deleted."})

@app.route("/api/metrics")
def api_metrics():
    """REST API: Returns machine learning evaluation benchmarks and feature importances."""
    metadata = load_metadata()
    if not metadata:
        return jsonify({"status": "error", "message": "Metadata not found. Run train_model.py."}), 404
    return jsonify({
        "status": "success",
        "metadata": metadata
    })

# ==============================================================================
# ERROR HANDLERS
# ==============================================================================

@app.errorhandler(404)
def not_found_error(error):
    return render_template("404.html"), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template("500.html"), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
