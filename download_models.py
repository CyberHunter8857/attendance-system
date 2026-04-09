import urllib.request
import os

MODELS_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/"
MODELS = [
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2"
]

target_dir = "frontend/public/models"
if not os.path.exists(target_dir):
    os.makedirs(target_dir)

for model in MODELS:
    print(f"Downloading {model}...")
    url = MODELS_URL + model
    urllib.request.urlretrieve(url, os.path.join(target_dir, model))

print("All models downloaded successfully!")
