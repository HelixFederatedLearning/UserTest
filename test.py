import onnxruntime as ort
import numpy as np
from PIL import Image
from torchvision import transforms
import torch

# ---------- CONFIG ----------
onnx_path  = "/home/girish/GIT/Federated_learning/dr_model.onnx"    # your ONNX model
image_path = "0.png"            # test image

# APTOS 2019 labels (replace with your own if different)
class_names = [
    "No_DR",
    "Mild",
    "Moderate",
    "Severe",
    "Proliferative_DR"
]

# ---------- PREPROCESS ----------
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    # If you normalized during training, add it here:
    # transforms.Normalize(mean=[0.485, 0.456, 0.406],
    #                      std=[0.229, 0.224, 0.225]),
])

img = Image.open(image_path).convert("RGB")
img_tensor = preprocess(img).unsqueeze(0)        # [1,3,224,224]
img_np = img_tensor.numpy().astype(np.float32)

# ---------- ONNX INFERENCE ----------
providers = ['CUDAExecutionProvider', 'CPUExecutionProvider'] if ort.get_device() == 'GPU' else ['CPUExecutionProvider']
sess = ort.InferenceSession(onnx_path, providers=providers)

input_name  = sess.get_inputs()[0].name
output_name = sess.get_outputs()[0].name

outputs = sess.run([output_name], {input_name: img_np})
logits = outputs[0]  # shape [1, num_classes]

# ---------- SOFTMAX ----------
exp = np.exp(logits - np.max(logits, axis=1, keepdims=True))
probs = exp / np.sum(exp, axis=1, keepdims=True)
probs = probs.squeeze(0)  # [num_classes]

# ---------- PRINT RESULTS ----------
print("\n=== ONNX Predictions ===")
for cls, p in zip(class_names, probs):
    print(f"{cls:18s}: {p:.6f}")

top1_idx = int(np.argmax(probs))
print(f"\nTop-1 Prediction: {class_names[top1_idx]} (prob={probs[top1_idx]:.6f})")
