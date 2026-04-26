# start_ollama_gpu_k511.ps1
# Starts Ollama server with Vulkan GPU backend for K511 benchmark.
# AMD Radeon RX 9070 XT (16 GB VRAM) — RDNA 4, gfx1201
# ROCm does NOT support gfx1201; Vulkan backend works fine.
#
# Usage: .\start_ollama_gpu_k511.ps1
# Then in another terminal: python run_local_llm_k511.py

$OllamaExe = "C:\Users\Administrator\AppData\Local\Programs\Ollama\ollama.exe"

# Kill any existing Ollama processes
Write-Host "Stopping any existing Ollama processes..." -ForegroundColor Yellow
taskkill /F /IM ollama.exe /T 2>&1 | Out-Null
Start-Sleep -Seconds 3

# Set GPU env vars
$env:OLLAMA_VULKAN          = "1"       # Enable Vulkan backend (AMD GPU)
$env:GGML_VK_VISIBLE_DEVICES = "0"      # Discrete GPU only (RX 9070 XT, not iGPU)
$env:OLLAMA_KEEP_ALIVE      = "60m"    # Keep model loaded between calls
$env:OLLAMA_DEBUG           = "0"       # Set to "1" for verbose GPU detection logs
$env:PATH = "C:\Users\Administrator\AppData\Local\Programs\Ollama;" + $env:PATH

Write-Host "Starting Ollama with Vulkan GPU (RX 9070 XT)..." -ForegroundColor Green
Write-Host "  OLLAMA_VULKAN=1  GGML_VK_VISIBLE_DEVICES=0" -ForegroundColor Cyan

& $OllamaExe serve
