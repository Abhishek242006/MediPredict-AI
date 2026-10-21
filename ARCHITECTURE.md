# System Architecture & Technical Specifications — MediPredict AI

MediPredict AI is designed as a modular, decoupled full-stack machine learning web application. It integrates supervised multi-class classification algorithms, probabilistic differential diagnosis calculation, clinical triage heuristics, and local privacy-preserving SQLite auditing.

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client["Presentation Layer (Client Browser)"]
        UI["Modern Responsive UI\n(Plus Jakarta Sans, HTML5, CSS3, ES6)"]
        Form["Symptom Selection Form\n(24 Multi-System Checkboxes)"]
        Search["Instant Search & Category Tabs\n(Real-time DOM Filter)"]
        Presets["Quick Presets Controller\n(1-Click Clinical Scenarios)"]
        Theme["Theme Manager\n(Dark/Light Mode via localStorage)"]
    end

    subgraph Server["Application Layer (Flask 3.1 Backend)"]
        Routes["WSGI Controller Routes\n(/, /checker, /conditions, /history, /analytics)"]
        API["RESTful API Endpoints\n(/api/predict, /api/symptoms, /api/conditions, /api/metrics)"]
        Validation["Request Sanitization & Input Validator"]
        VectorEngine["Binary Feature Vectorization Engine\nX ∈ {0, 1}^24"]
        TriageEngine["Clinical Triage & Red-Flag Rule Engine"]
    end

    subgraph ML["Machine Learning & Inference Layer"]
        ModelPickle["Champion Classifier Binary\n(models/disease_model.pkl)"]
        Metadata["Model Metrics & Benchmarks\n(models/model_metadata.json)"]
        Proba["Probability Calibrator\n(predict_proba / Softmax)"]
        Differentials["Top-3 Differential Ranking Engine"]
    end

    subgraph Data["Persistence & Storage Layer"]
        DB[(Local SQLite Database\npredictions.db)]
        CSVExport["CSV Stream Engine\n(/export/csv)"]
        KnowledgeBase["Disease Knowledge Base\n(data/disease_info.json)"]
    end

    UI --> Form
    Search -.-> Form
    Presets -.-> Form
    Form -->|POST /predict or JSON POST /api/predict| Validation
    Validation --> Routes
    Validation --> API
    Routes --> VectorEngine
    API --> VectorEngine
    VectorEngine --> ModelPickle
    ModelPickle --> Proba
    Proba --> Differentials
    Differentials --> TriageEngine
    TriageEngine --> KnowledgeBase
    TriageEngine -->|Persist Audit Record| DB
    DB --> CSVExport
    KnowledgeBase --> UI
    Differentials --> UI
```

---

## 2. Machine Learning Training & Evaluation Pipeline

```mermaid
flowchart LR
    A["Raw Clinical Dataset\n(data/symptoms_dataset.csv\n560 samples, 24 features)"] --> B["Data Validation &\nMissing Value Check"]
    B --> C["Stratified 80/20\nTrain-Test Split"]
    
    subgraph Benchmarking["Model Benchmarking Suite (train_model.py)"]
        C --> D1["Random Forest\n(120 Estimators, Depth 9)"]
        C --> D2["Decision Tree\n(Max Depth 7)"]
        C --> D3["Logistic Regression\n(C=1.0, L-BFGS)"]
        C --> D4["Multinomial Naive Bayes\n(Alpha=0.5)"]
    end

    D1 & D2 & D3 & D4 --> E["5-Fold Stratified Cross-Validation\n(Mean Accuracy + Std Dev)"]
    E --> F["Held-Out Test Set Evaluation\n(Precision, Recall, F1, Confusion Matrix)"]
    F --> G["Select Champion Classifier\n(Highest Accuracy & Generalization)"]
    G --> H["Extract Feature Importance\n(Gini Impurity Reduction)"]
    H --> I["Export Production Artifacts\n(disease_model.pkl + model_metadata.json)"]
```

---

## 3. Clinical Triage & Risk Decision Logic

```mermaid
flowchart TD
    Start["User Submits Symptom Vector"] --> CheckRedFlags{"Evaluate Red Flags\n(Dyspnea, High Fever, Chest Pressure,\nAcute Dehydration, Heat Shock)?"}
    
    CheckRedFlags -- Yes --> HighRisk["Risk Level: Urgent Attention\n(🚨 Call Emergency 911/112/108)"]
    
    CheckRedFlags -- No --> CheckConditionRisk{"Predicted Condition Risk\n== 'High' or 'Moderate' OR\n4+ Symptoms Present?"}
    
    CheckConditionRisk -- Yes --> ModRisk["Risk Level: Moderate Risk\n(⚠️ Clinic Visit in 24-48 Hours)"]
    CheckConditionRisk -- No --> LowRisk["Risk Level: Low / Routine\n(ℹ️ Rest, Hydration & Standard Self-Care)"]

    HighRisk --> GenerateReport["Assemble Clinical Report & Differentials"]
    ModRisk --> GenerateReport
    LowRisk --> GenerateReport
    GenerateReport --> Output["Render Result Page / API Response"]
```

---

## 4. Database Entity-Relationship (ER) Model

```mermaid
erDiagram
    PREDICTION_HISTORY {
        INTEGER id PK "Auto Increment"
        TEXT symptoms "Comma-separated list of selected symptom names"
        TEXT prediction "Primary predicted illness or condition"
        REAL confidence "Model match percentage (e.g. 88.5)"
        TEXT risk_level "Triage level (Urgent Attention, Moderate, Low)"
        TEXT patient_age_group "Demographic category (e.g. Adult 18-64)"
        TEXT symptom_duration "Onset timeframe (e.g. 2-5 days)"
        TEXT notes "Optional patient notes"
        TEXT created_at "ISO-formatted timestamp (YYYY-MM-DD HH:MM)"
    }
```

---

## 5. Technology Stack Summary

| Layer | Component | Version | Role |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | Python | 3.13 | Core computation and execution environment |
| **Web Framework** | Flask | 3.1.3 | WSGI routing, templating, request validation, REST API |
| **Machine Learning** | Scikit-learn | 1.9.1 | Model training, cross-validation, probability estimation |
| **Data Manipulation** | Pandas & NumPy | 3.0 / 2.5 | Matrix vectorization and DataFrame processing |
| **Database** | SQLite3 | 3.x embedded | Relational storage for local prediction audit trails |
| **Frontend** | HTML5 / CSS3 / ES6 | Modern | Responsive UI, theme switching, dynamic client filtering |
