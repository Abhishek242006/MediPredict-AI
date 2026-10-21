# MediPredict AI — Educational Disease Prediction & Clinical Triage Platform

[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.13-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1.3-emerald.svg)](https://flask.palletsprojects.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.9.1-orange.svg)](https://scikit-learn.org/)
[![Tests](https://img.shields.io/badge/Tests-18%2F18%20Passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Release-Academic%20v2.0-teal.svg)]()

MediPredict AI is a production-grade, educational machine learning web application engineered for student portfolios, final-year capstone presentations, and healthcare data science demonstrations. It accepts multi-system patient symptom reports, executes multi-model supervised classification, computes top-3 differential diagnosis probabilities, runs autonomous clinical emergency triage heuristics, and maintains local privacy-preserving audit logs.

> ⚠️ **Educational & Academic Safety Notice:** MediPredict AI is an educational student prototype and is **NOT** a medical diagnostic device. It must never be used to diagnose, rule out, or treat any medical illness. Always seek professional advice from qualified medical practitioners for healthcare decisions.

---

## 🌟 Key Features

### 🧠 Advanced Machine Learning Engine
- **Multi-Model Benchmark Suite:** Evaluates and compares **Random Forest (120 Trees)**, **Decision Tree (CART)**, **Multinomial Logistic Regression**, and **Multinomial Naive Bayes**.
- **5-Fold Stratified Cross Validation:** Guarantees balanced class distributions across all evaluation splits.
- **High Generalization Accuracy:** Champion model achieves **91.96% test accuracy** and **91.74% cross-validation accuracy** across 16 disease categories.
- **Explainable Feature Importance:** Calculates Gini impurity reduction to rank the most discriminative symptoms (e.g., Persistent Cough, Skin Rash, Abdominal Pain).

### 🩺 Clinical Intelligence & Triage
- **Top-3 Differential Diagnoses:** Rather than outputting a single diagnosis, the engine calculates calibrated class probabilities to acknowledge symptom overlap.
- **Emergency Red-Flag Heuristics:** Automatically detects critical presentations (e.g., dyspnea, acute chest tightness, fever with breathing difficulty, heat shock, acute dehydration) and displays emergency helpline guidance (**911 / 112 / 108**).
- **Comprehensive Disease Encyclopedia:** Searchable directory detailing pathology summaries, common symptoms, evidence-based self-care, prevention, and clinical specialist fields across all 16 covered conditions.

### 💻 Modern, Accessible Web Architecture
- **Interactive Symptom Checker:** Real-time search filter, category tabs (Respiratory, Systemic, Neurological, Gastrointestinal, Skin & Joints), one-click clinical presets (Cold & Flu, Stomach Bug, Migraine, Allergy), and patient context options (Age Group, Duration).
- **Dark & Light Theme:** Built-in theme toggle with local storage persistence.
- **Doctor-Ready Printable Summary:** Styled `@media print` layout that prints a clean, single-page clinical summary sheet.
- **Audit Trails & CSV Export:** Searchable, filterable SQLite audit log of past demo runs with one-click CSV spreadsheet download.
- **RESTful JSON API:** Full program access for frontend or mobile integrations (`/api/predict`, `/api/symptoms`, `/api/conditions`, `/api/metrics`).

---

## 📁 Project Directory Structure

```text
medipredict-ai/
├── app.py                         # Main Flask application controller & REST API
├── disease_data.py                # Symptoms catalog, categories, presets & triage engine
├── generate_dataset.py            # Synthetic dataset generator with clinical distributions
├── train_model.py                 # Multi-model benchmarking, CV & training pipeline
├── requirements.txt               # Project dependencies
├── ARCHITECTURE.md                # System architecture & Mermaid flowcharts
├── INTERNSHIP_REPORT.md           # Full 10-chapter academic internship report
├── INTERNSHIP_REPORT_STARTER.md   # Executive summary and report index
├── README.md                      # Comprehensive documentation
├── data/
│   ├── symptoms_dataset.csv       # Curated 560-sample, 24-feature dataset
│   └── disease_info.json          # Curated medical condition knowledge base
├── models/
│   ├── disease_model.pkl          # Serialized champion model binary
│   └── model_metadata.json        # Evaluation benchmarks, metrics & feature importance
├── templates/
│   ├── base.html                  # Master template with navigation, theme toggle & footer
│   ├── index.html                 # Hero page with live counters, presets & feature grid
│   ├── checker.html               # Interactive symptom checker with tabs & search
│   ├── result.html                # Differential analysis, triage alerts & printable report
│   ├── conditions.html            # Searchable condition encyclopedia
│   ├── condition_detail.html      # Individual condition medical briefing page
│   ├── history.html               # Audit log table, filters, deletion & CSV export
│   ├── analytics.html             # Model benchmark charts, confusion matrix & viva guide
│   ├── about.html                 # Architecture workflow, mathematical formulation & ethics
│   ├── 404.html                   # Custom 404 error page
│   └── 500.html                   # Custom 500 error page
├── static/
│   ├── css/
│   │   └── style.css              # Modern CSS design system (Dark/Light + Print styles)
│   └── js/
│       └── script.js              # Theme manager, live filter, presets & validation
└── tests/
    ├── __init__.py                # Tests package marker
    ├── test_model.py              # ML pipeline, data integrity & probability tests
    └── test_app.py                # Web routes, validation, database & REST API tests
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** (Tested on Python 3.13)
- PowerShell (Windows) or Terminal (macOS / Linux)

### 2. Setup Virtual Environment & Install Dependencies
Open your terminal in the `medipredict-ai` project directory:

**Windows (PowerShell):**
```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```
*(If PowerShell blocks script activation, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*

**macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Generate Dataset & Train Models
```bash
python generate_dataset.py
python train_model.py
```
This benchmarks candidate algorithms using 5-Fold Stratified Cross Validation and saves the champion model to `models/disease_model.pkl` and metadata to `models/model_metadata.json`.

### 4. Launch the Web Application
```bash
python app.py
```
Open your browser and navigate to:
👉 **`http://127.0.0.1:5000`**

---

## 📊 Machine Learning Benchmark Leaderboard

Candidate algorithms evaluated on 560 clinical cases (80% Train, 20% Held-Out Test):

| Algorithm | 5-Fold CV Accuracy | CV Std Dev | Test Accuracy | Precision (Weighted) | Recall (Weighted) | F1-Score (Weighted) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression (Champion)** | **91.74%** | **±1.66%** | **91.96%** | **0.93** | **0.92** | **0.92** |
| **Random Forest (120 Trees)** | 87.73% | ±1.81% | 91.07% | 0.92 | 0.91 | 0.91 |
| **Multinomial Naive Bayes** | 87.96% | ±2.44% | 88.39% | 0.89 | 0.88 | 0.88 |
| **Decision Tree (CART)** | 63.17% | ±3.64% | 66.07% | 0.69 | 0.66 | 0.66 |

---

## 🔌 RESTful API Documentation

MediPredict AI exposes clean JSON REST endpoints:

### `POST /api/predict`
Predicts condition, differential probabilities, and triage risk level from symptom IDs.

**Request:**
```bash
curl -X POST http://127.0.0.1:5000/api/predict \
     -H "Content-Type: application/json" \
     -d '{"symptoms": ["fever", "cough", "loss_of_smell_taste", "fatigue"]}'
```

**Response (JSON):**
```json
{
  "status": "success",
  "prediction": "COVID-19 like illness",
  "confidence": 88.4,
  "triage": {
    "level": "Moderate Risk",
    "badge_class": "risk-moderate",
    "color": "#f59e0b",
    "icon": "⚠️",
    "message": "Significant symptom cluster. Monitor closely and schedule a healthcare consultation if symptoms persist.",
    "red_flags": []
  },
  "differential_diagnoses": [
    {"condition": "COVID-19 like illness", "probability": 88.4},
    {"condition": "Flu-like illness", "probability": 7.2},
    {"condition": "Acute Bronchitis", "probability": 3.1}
  ],
  "selected_symptoms": [
    "Fever (Mild / Moderate)",
    "Persistent Cough",
    "Loss of Smell or Taste (Anosmia)",
    "Fatigue / General Weakness"
  ]
}
```

### Additional Endpoints:
- `GET /api/symptoms` — Returns all 24 symptoms, display labels, categories, and icons.
- `GET /api/conditions` — Returns the medical condition encyclopedia.
- `GET /api/history` — Returns JSON list of past prediction logs.
- `DELETE /api/history/<id>` — Deletes an individual history record.
- `GET /api/metrics` — Returns model cross-validation benchmarks and feature importances.
- `GET /export/csv` — Streams audit logs directly as a CSV spreadsheet.

---

## 🧪 Automated Testing Suite

The repository includes a comprehensive 18-point unit and integration test suite:

```bash
python -m unittest discover tests
```

**Output:**
```text
..................
----------------------------------------------------------------------
Ran 18 tests in 0.141s

OK
```

All 18 tests execute in sub-second time, validating:
- Model vectorization and probability calibration ($\sum p_i = 1.0$)
- Triage emergency red-flag triggers
- Web routes (200 OK), form validation, and error pages (404/500)
- REST API payloads and response structure
- SQLite transaction safety and CSV generation

---

## 🛡️ Responsible AI & Ethical Principles

1. **Zero Data Harvesting:** No names, emails, phone numbers, or IP addresses are collected or logged. All records are stored strictly in local SQLite.
2. **Transparent Uncertainty:** Replaces misleading single-disease certainty with multi-condition differential probabilities.
3. **Emergency Escalation:** Automated red-flag rules bypass probabilistic scores to immediately direct patients to emergency care when severe distress signs are present.

---

## 📄 License & Attribution

This project is released under the **MIT License**. Created as an academic demonstration of applied machine learning and web systems engineering.
