"""
MediPredict AI - Production Machine Learning Pipeline
Trains, benchmarks, and evaluates multiple classification algorithms for disease prediction.
Extracts explainability metrics, feature importances, and exports model metadata.
"""
from datetime import datetime
import json
from pathlib import Path
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.tree import DecisionTreeClassifier

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "symptoms_dataset.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "disease_model.pkl"
METADATA_PATH = MODEL_DIR / "model_metadata.json"

FEATURES = [
    "fever", "high_fever", "headache", "throbbing_headache", "cough",
    "shortness_of_breath", "chest_congestion", "runny_nose", "sore_throat",
    "sneezing", "fatigue", "body_pain", "chills", "sweating", "dizziness",
    "loss_of_smell_taste", "sensitivity_to_light", "nausea", "vomiting",
    "diarrhea", "abdominal_pain", "loss_of_appetite", "skin_rash", "joint_pain"
]

SYMPTOM_DISPLAY_NAMES = {
    "fever": "Fever (Mild/Moderate)",
    "high_fever": "High Fever (>102°F / 39°C)",
    "headache": "General Headache",
    "throbbing_headache": "Severe Throbbing Headache",
    "cough": "Persistent Cough",
    "shortness_of_breath": "Shortness of Breath / Dyspnea",
    "chest_congestion": "Chest Congestion / Tightness",
    "runny_nose": "Runny / Stuffy Nose",
    "sore_throat": "Sore / Scratchy Throat",
    "sneezing": "Frequent Sneezing",
    "fatigue": "Fatigue / General Weakness",
    "body_pain": "Body / Muscle Aches (Myalgia)",
    "chills": "Chills & Shivering",
    "sweating": "Profuse Sweating",
    "dizziness": "Dizziness / Lightheadedness",
    "loss_of_smell_taste": "Loss of Smell or Taste (Anosmia)",
    "sensitivity_to_light": "Light / Sound Sensitivity (Photophobia)",
    "nausea": "Nausea / Queasiness",
    "vomiting": "Vomiting",
    "diarrhea": "Diarrhea / Loose Stools",
    "abdominal_pain": "Abdominal Cramps / Pain",
    "loss_of_appetite": "Loss of Appetite",
    "skin_rash": "Skin Rash / Itching",
    "joint_pain": "Joint Pain / Stiffness"
}

def load_and_validate_data():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}. Run generate_dataset.py first.")
    df = pd.read_csv(DATA_PATH)
    required = FEATURES + ["condition"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns in dataset: {missing}")
    if df[required].isnull().any().any():
        raise ValueError("Dataset contains missing values.")
    return df

def benchmark_models(X_train, y_train):
    """Run 5-Fold Stratified Cross Validation on multiple algorithms."""
    models = {
        "Random Forest": RandomForestClassifier(n_estimators=120, max_depth=9, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=7, random_state=42),
        "Logistic Regression": LogisticRegression(max_iter=1000, C=1.0, random_state=42),
        "Multinomial Naive Bayes": MultinomialNB(alpha=0.5)
    }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    comparison = {}

    print("=" * 65)
    print("      5-FOLD STRATIFIED CROSS-VALIDATION BENCHMARK")
    print("=" * 65)
    print(f"{'Algorithm':<26} | {'Mean CV Acc':<14} | {'Std Dev':<10}")
    print("-" * 65)

    for name, clf in models.items():
        scores = cross_val_score(clf, X_train, y_train, cv=cv, scoring="accuracy")
        comparison[name] = {
            "mean_cv_accuracy": round(float(np.mean(scores)), 4),
            "std_cv_accuracy": round(float(np.std(scores)), 4),
            "fold_scores": [round(float(s), 4) for s in scores]
        }
        print(f"{name:<26} | {comparison[name]['mean_cv_accuracy']*100:>10.2f}% | +/-{comparison[name]['std_cv_accuracy']*100:>6.2f}%")
    print("=" * 65)
    return models, comparison

def main():
    print("\n[1/4] Loading and preparing dataset...")
    df = load_and_validate_data()
    X = df[FEATURES].astype(int)
    y = df["condition"].astype(str)

    classes = sorted(y.unique().tolist())
    print(f"Total samples: {len(df)} | Features: {len(FEATURES)} | Unique Conditions: {len(classes)}")

    # 80/20 Stratified train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print("\n[2/4] Benchmarking candidate machine learning models...")
    models, comparison = benchmark_models(X_train, y_train)

    # Evaluate each on the test set
    test_metrics = {}
    for name, clf in models.items():
        clf.fit(X_train, y_train)
        preds = clf.predict(X_test)
        acc = accuracy_score(y_test, preds)
        prec, rec, f1, _ = precision_recall_fscore_support(y_test, preds, average="weighted", zero_division=0)
        test_metrics[name] = {
            "test_accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4)
        }
        comparison[name].update(test_metrics[name])

    # Select champion model by highest test accuracy
    champion_name = max(test_metrics.keys(), key=lambda k: test_metrics[k]["test_accuracy"])
    champion_model = models[champion_name]
    champion_preds = champion_model.predict(X_test)

    print(f"\n[3/4] Champion Model Evaluation Report ({champion_name}):")
    print("-" * 65)
    print(f"Test Accuracy: {accuracy_score(y_test, champion_preds)*100:.2f}%")
    print(classification_report(y_test, champion_preds, zero_division=0))

    # Confusion Matrix
    cm = confusion_matrix(y_test, champion_preds, labels=classes)

    # Feature Importance (using Random Forest for tree explainability)
    rf_model = models["Random Forest"]
    rf_importances = rf_model.feature_importances_
    feat_imp = sorted(
        [{"feature": f, "display": SYMPTOM_DISPLAY_NAMES[f], "importance": round(float(imp), 4)}
         for f, imp in zip(FEATURES, rf_importances)],
        key=lambda x: x["importance"],
        reverse=True
    )

    # Model metadata package
    metadata = {
        "trained_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_samples": len(df),
        "test_samples": len(y_test),
        "features": FEATURES,
        "feature_labels": SYMPTOM_DISPLAY_NAMES,
        "classes": classes,
        "champion_model": champion_name,
        "champion_metrics": test_metrics[champion_name],
        "model_comparison": comparison,
        "feature_importance": feat_imp,
        "confusion_matrix": {
            "labels": classes,
            "matrix": cm.tolist()
        }
    }

    print("\n[4/4] Saving production artifacts...")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    with MODEL_PATH.open("wb") as f:
        pickle.dump(champion_model, f)
    print(f"[OK] Model binary saved to: {MODEL_PATH}")

    with METADATA_PATH.open("w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[OK] Model metadata & benchmarks saved to: {METADATA_PATH}")

    print("\nTop 5 Most Predictive Symptoms:")
    for i, item in enumerate(feat_imp[:5], 1):
        print(f"  {i}. {item['display']}: {item['importance']*100:.2f}% importance")

    print("\nTraining completed successfully! Pipeline is production-ready.")

if __name__ == "__main__":
    main()
