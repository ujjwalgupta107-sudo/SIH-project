import torch
print(f'PyTorch: {torch.__version__}')
print(f'CUDA available: {torch.cuda.is_available()}')
print(f'CUDA devices: {torch.cuda.device_count()}')
if torch.cuda.is_available():
    print(f'Device: {torch.cuda.get_device_name(0)}')
else:
    print('NO CUDA')