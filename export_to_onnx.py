import torch
import torch.nn as nn
import numpy as np

# EDIT if your class count is different
NUM_CLASSES = 5
CKPT_PATH = "model/best_resnet18_aptos.pth"
ONNX_PATH = "dr_model.onnx"
INPUT_NAME = "input"
OUTPUT_NAME = "output"
OPSET = 17

# 1) Build the correct architecture: RESNET-18
from torchvision.models import resnet18
model = resnet18(weights=None)   # no pretrained weights
model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)

# 2) Load checkpoint robustly
ckpt = torch.load(CKPT_PATH, map_location="cpu")
state_dict = ckpt.get("state_dict", ckpt)

# strip common prefixes
def strip_prefix(sd, prefixes=("module.", "model.", "net.")):
    out = {}
    for k, v in sd.items():
        for p in prefixes:
            if k.startswith(p):
                k = k[len(p):]
        out[k] = v
    return out

state_dict = strip_prefix(state_dict)

missing, unexpected = model.load_state_dict(state_dict, strict=False)
print("Loaded state_dict with strict=False")
print("  missing keys   :", missing[:10], "... total", len(missing))
print("  unexpected keys:", list(unexpected)[:10], "... total", len(unexpected))

model.eval()

# 3) Dummy input (ResNet18 default: 3x224x224)
B, C, H, W = 1, 3, 224, 224
dummy = torch.randn(B, C, H, W, dtype=torch.float32)

# 4) Export to ONNX
dynamic_axes = {INPUT_NAME: {0: "batch"}, OUTPUT_NAME: {0: "batch"}}
torch.onnx.export(
    model, dummy, ONNX_PATH,
    input_names=[INPUT_NAME], output_names=[OUTPUT_NAME],
    dynamic_axes=dynamic_axes,
    opset_version=OPSET, do_constant_folding=True
)
print("Exported:", ONNX_PATH)

# 5) Quick parity check (optional but recommended)
try:
    import onnxruntime as ort
    with torch.no_grad():
        torch_out = model(dummy).cpu().numpy()
    sess = ort.InferenceSession(ONNX_PATH, providers=["CPUExecutionProvider"])
    ort_out = sess.run([OUTPUT_NAME], {INPUT_NAME: dummy.cpu().numpy()})[0]
    print("ONNX parity:", np.allclose(torch_out, ort_out, rtol=1e-03, atol=1e-04))
    print("Torch shape:", torch_out.shape, "ONNX shape:", ort_out.shape)
except Exception as e:
    print("ONNX check skipped/failed:", e)
