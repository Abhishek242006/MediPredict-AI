"""
Medical Knowledge Base, Symptoms Catalog, and Triage Engine for MediPredict AI.
"""
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
INFO_PATH = BASE_DIR / "data" / "disease_info.json"

# Symptoms list in fixed canonical feature order for ML models
SYMPTOMS = [
    "fever", "high_fever", "headache", "throbbing_headache", "cough",
    "shortness_of_breath", "chest_congestion", "runny_nose", "sore_throat",
    "sneezing", "fatigue", "body_pain", "chills", "sweating", "dizziness",
    "loss_of_smell_taste", "sensitivity_to_light", "nausea", "vomiting",
    "diarrhea", "abdominal_pain", "loss_of_appetite", "skin_rash", "joint_pain"
]

SYMPTOM_LABELS = {
    "fever": "Fever (Mild / Moderate)",
    "high_fever": "High Fever (>102°F / 39°C)",
    "headache": "General Headache",
    "throbbing_headache": "Throbbing / Pulsing Headache",
    "cough": "Persistent Cough",
    "shortness_of_breath": "Shortness of Breath (Dyspnea)",
    "chest_congestion": "Chest Congestion / Tightness",
    "runny_nose": "Runny / Stuffy Nose",
    "sore_throat": "Sore / Scratchy Throat",
    "sneezing": "Frequent Sneezing",
    "fatigue": "Fatigue / General Weakness",
    "body_pain": "Body / Muscle Pain (Myalgia)",
    "chills": "Chills & Shivering",
    "sweating": "Profuse Sweating",
    "dizziness": "Dizziness / Lightheadedness",
    "loss_of_smell_taste": "Loss of Smell or Taste (Anosmia)",
    "sensitivity_to_light": "Light / Sound Sensitivity (Photophobia)",
    "nausea": "Nausea / Queasy Stomach",
    "vomiting": "Vomiting",
    "diarrhea": "Diarrhea / Loose Stools",
    "abdominal_pain": "Stomach Cramps / Abdominal Pain",
    "loss_of_appetite": "Loss of Appetite",
    "skin_rash": "Skin Rash / Itching / Hives",
    "joint_pain": "Joint Pain / Joint Stiffness"
}

SYMPTOM_CATEGORIES = {
    "Respiratory & Throat": [
        "cough", "runny_nose", "sore_throat", "shortness_of_breath",
        "sneezing", "chest_congestion"
    ],
    "General & Systemic": [
        "fever", "high_fever", "fatigue", "body_pain", "chills", "sweating"
    ],
    "Head & Neurological": [
        "headache", "throbbing_headache", "dizziness",
        "loss_of_smell_taste", "sensitivity_to_light"
    ],
    "Gastrointestinal": [
        "nausea", "vomiting", "diarrhea", "abdominal_pain", "loss_of_appetite"
    ],
    "Skin & Musculoskeletal": [
        "skin_rash", "joint_pain"
    ]
}

SYMPTOM_ICONS = {
    "fever": "♨", "high_fever": "🔥", "headache": "◉", "throbbing_headache": "⚡",
    "cough": "≋", "shortness_of_breath": "🫁", "chest_congestion": "🫀", "runny_nose": "💧",
    "sore_throat": "◍", "sneezing": "💨", "fatigue": "◒", "body_pain": "✳",
    "chills": "❄", "sweating": "💦", "dizziness": "🌀", "loss_of_smell_taste": "👃",
    "sensitivity_to_light": "☀", "nausea": "⌁", "vomiting": "🤮", "diarrhea": "🌊",
    "abdominal_pain": "🛑", "loss_of_appetite": "🍽", "skin_rash": "🩹", "joint_pain": "🦴"
}

SYMPTOM_PRESETS = [
    {
        "id": "cold_flu",
        "name": "Cold & Flu Symptoms",
        "icon": "🤧",
        "symptoms": ["fever", "cough", "runny_nose", "sore_throat", "fatigue", "body_pain"]
    },
    {
        "id": "digestive",
        "name": "Stomach & Digestion Issue",
        "icon": "🤢",
        "symptoms": ["nausea", "vomiting", "diarrhea", "abdominal_pain", "loss_of_appetite"]
    },
    {
        "id": "headache_migraine",
        "name": "Severe Headache / Migraine",
        "icon": "🧠",
        "symptoms": ["throbbing_headache", "sensitivity_to_light", "nausea", "dizziness"]
    },
    {
        "id": "allergy",
        "name": "Allergies & Irritation",
        "icon": "🌿",
        "symptoms": ["sneezing", "runny_nose", "skin_rash", "fatigue"]
    },
    {
        "id": "covid_watch",
        "name": "COVID-19 Check",
        "icon": "🦠",
        "symptoms": ["fever", "cough", "loss_of_smell_taste", "fatigue", "body_pain"]
    }
]

def load_disease_info():
    """Load curated medical condition descriptions and care guides."""
    if INFO_PATH.exists():
        try:
            with INFO_PATH.open("r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

DISEASE_INFO = load_disease_info()

def evaluate_triage_risk(selected_symptoms, predicted_condition=None):
    """
    Intelligent clinical safety rule engine.
    Identifies high-risk red flag combinations requiring emergency medical evaluation.
    """
    selected_set = set(selected_symptoms)

    red_flags = []
    if "shortness_of_breath" in selected_set:
        red_flags.append("Shortness of breath / respiratory difficulty")
    if "high_fever" in selected_set and "shortness_of_breath" in selected_set:
        red_flags.append("High fever combined with breathing distress")
    if "chest_congestion" in selected_set and "shortness_of_breath" in selected_set:
        red_flags.append("Severe chest tightness / shortness of breath")
    if "high_fever" in selected_set and "sweating" in selected_set and "dizziness" in selected_set:
        red_flags.append("High body temperature with dizziness and sweating (Heat emergency risk)")
    if "vomiting" in selected_set and "diarrhea" in selected_set and "dizziness" in selected_set:
        red_flags.append("Severe fluid loss with dizziness (Acute dehydration risk)")

    condition_risk = "Low"
    if predicted_condition and predicted_condition in DISEASE_INFO:
        condition_risk = DISEASE_INFO[predicted_condition].get("risk_level", "Low")

    if red_flags or "High" in condition_risk:
        return {
            "level": "Urgent Attention",
            "badge_class": "risk-urgent",
            "color": "#ef4444",
            "icon": "🚨",
            "message": "Potential red-flag symptoms detected. Immediate professional medical care is strongly recommended.",
            "red_flags": red_flags
        }
    elif "Moderate" in condition_risk or len(selected_symptoms) >= 4 or "fever" in selected_set or "vomiting" in selected_set:
        return {
            "level": "Moderate Risk",
            "badge_class": "risk-moderate",
            "color": "#f59e0b",
            "icon": "⚠️",
            "message": "Significant symptom cluster. Monitor closely and schedule a healthcare consultation if symptoms persist.",
            "red_flags": []
        }
    else:
        return {
            "level": "Low / Routine",
            "badge_class": "risk-low",
            "color": "#10b981",
            "icon": "ℹ️",
            "message": "Mild or common symptoms. Follow standard self-care, rest, and hydrate. Seek care if worsening.",
            "red_flags": []
        }
