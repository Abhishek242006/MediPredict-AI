"""
Generate realistic synthetic symptom dataset for MediPredict AI educational demonstration.
Each disease is defined by primary, secondary, and occasional symptoms with realistic probability distributions.
"""
from pathlib import Path
import random
import numpy as np
import pandas as pd

random.seed(42)
np.random.seed(42)

BASE_DIR = Path(__file__).resolve().parent

SYMPTOMS = [
    "fever", "high_fever", "headache", "throbbing_headache", "cough",
    "shortness_of_breath", "chest_congestion", "runny_nose", "sore_throat",
    "sneezing", "fatigue", "body_pain", "chills", "sweating", "dizziness",
    "loss_of_smell_taste", "sensitivity_to_light", "nausea", "vomiting",
    "diarrhea", "abdominal_pain", "loss_of_appetite", "skin_rash", "joint_pain"
]

# Clinical symptom probability profiles for each condition
DISEASE_PROFILES = {
    "Common cold": {
        "primary": ["runny_nose", "cough", "sore_throat", "sneezing"],
        "secondary": ["fatigue", "headache"],
        "rare": ["fever", "body_pain", "loss_of_appetite"]
    },
    "Flu-like illness": {
        "primary": ["fever", "high_fever", "body_pain", "fatigue", "chills"],
        "secondary": ["headache", "cough", "sweating", "sore_throat"],
        "rare": ["runny_nose", "nausea", "loss_of_appetite"]
    },
    "COVID-19 like illness": {
        "primary": ["fever", "cough", "loss_of_smell_taste", "fatigue"],
        "secondary": ["body_pain", "headache", "shortness_of_breath", "sore_throat", "chills"],
        "rare": ["nausea", "diarrhea", "runny_nose"]
    },
    "Allergy-like symptoms": {
        "primary": ["sneezing", "runny_nose"],
        "secondary": ["skin_rash", "fatigue", "headache"],
        "rare": ["cough", "sore_throat"]
    },
    "Acute Bronchitis": {
        "primary": ["cough", "chest_congestion", "fatigue"],
        "secondary": ["shortness_of_breath", "sore_throat", "fever"],
        "rare": ["body_pain", "headache", "chills"]
    },
    "Sinusitis": {
        "primary": ["headache", "runny_nose"],
        "secondary": ["loss_of_smell_taste", "cough", "fatigue", "fever"],
        "rare": ["sore_throat", "dizziness"]
    },
    "Strep Throat": {
        "primary": ["sore_throat", "fever", "high_fever"],
        "secondary": ["headache", "body_pain", "loss_of_appetite"],
        "rare": ["nausea", "chills", "fatigue"]
    },
    "Migraine": {
        "primary": ["throbbing_headache", "sensitivity_to_light", "nausea"],
        "secondary": ["dizziness", "vomiting", "fatigue"],
        "rare": ["headache", "loss_of_appetite"]
    },
    "Tension Headache": {
        "primary": ["headache"],
        "secondary": ["fatigue", "body_pain"],
        "rare": ["dizziness", "sensitivity_to_light"]
    },
    "Viral Gastroenteritis": {
        "primary": ["nausea", "vomiting", "diarrhea", "abdominal_pain"],
        "secondary": ["fatigue", "loss_of_appetite", "fever"],
        "rare": ["chills", "body_pain", "headache"]
    },
    "Food Poisoning": {
        "primary": ["nausea", "vomiting", "diarrhea", "abdominal_pain"],
        "secondary": ["fever", "chills", "sweating", "fatigue", "dizziness"],
        "rare": ["headache", "body_pain"]
    },
    "Acid Reflux / GERD": {
        "primary": ["chest_congestion", "abdominal_pain"],
        "secondary": ["nausea", "sore_throat", "cough"],
        "rare": ["loss_of_appetite", "headache"]
    },
    "Asthma Flare-up": {
        "primary": ["shortness_of_breath", "cough", "chest_congestion"],
        "secondary": ["fatigue"],
        "rare": ["headache", "sweating"]
    },
    "Allergic Dermatitis": {
        "primary": ["skin_rash"],
        "secondary": ["fatigue"],
        "rare": ["body_pain", "headache"]
    },
    "Joint Inflammation / Arthritis": {
        "primary": ["joint_pain", "body_pain"],
        "secondary": ["fatigue"],
        "rare": ["fever", "headache"]
    },
    "Heat Exhaustion": {
        "primary": ["high_fever", "sweating", "dizziness"],
        "secondary": ["fatigue", "headache", "nausea", "body_pain"],
        "rare": ["vomiting", "chills"]
    }
}

def generate_samples(disease, profile, n_samples=32):
    samples = []
    primary = profile.get("primary", [])
    secondary = profile.get("secondary", [])
    rare = profile.get("rare", [])

    for _ in range(n_samples):
        row = {}
        for s in SYMPTOMS:
            if s in primary:
                # 88% - 98% likelihood
                row[s] = 1 if random.random() < random.uniform(0.85, 0.98) else 0
            elif s in secondary:
                # 45% - 75% likelihood
                row[s] = 1 if random.random() < random.uniform(0.45, 0.75) else 0
            elif s in rare:
                # 10% - 25% likelihood
                row[s] = 1 if random.random() < random.uniform(0.08, 0.22) else 0
            else:
                # noise background 1% - 4%
                row[s] = 1 if random.random() < 0.03 else 0

        # Ensure at least one primary symptom is present
        if sum(row[s] for s in primary) == 0 and primary:
            row[random.choice(primary)] = 1

        row["condition"] = disease
        samples.append(row)
    return samples

def main():
    all_data = []
    for disease, profile in DISEASE_PROFILES.items():
        all_data.extend(generate_samples(disease, profile, n_samples=35))

    df = pd.DataFrame(all_data)
    # Shuffle dataframe
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)

    out_path = BASE_DIR / "data" / "symptoms_dataset.csv"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
    print(f"Dataset generated with {len(df)} records across {len(DISEASE_PROFILES)} diseases.")
    print(f"Saved to: {out_path}")
    print(df["condition"].value_counts())

if __name__ == "__main__":
    main()
