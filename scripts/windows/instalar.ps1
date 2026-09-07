# instalar.ps1 — instala tudo que a skill app-da-vsl precisa no Windows.
# Roda uma vez por maquina.
# uso: powershell -ExecutionPolicy Bypass -File "<caminho da skill>\scripts\windows\instalar.ps1"
$ErrorActionPreference = "Stop"

Write-Host "Instalando o que falta para o App da VSL. Isso leva uns 10 minutos." -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "!! Falta o winget, que e o instalador de programas do Windows." -ForegroundColor Red
    Write-Host "   Abra a Microsoft Store, procure por 'App Installer' e instale."
    Write-Host "   Depois feche e abra o terminal de novo e rode este arquivo outra vez."
    exit 1
}

# programas de linha de comando: nome do comando + id no winget + para que serve
$programas = @(
    @("git",    "Git.Git",           "guarda o codigo do seu app"),
    @("node",   "OpenJS.NodeJS.LTS", "roda o aplicativo"),
    @("gh",     "GitHub.cli",        "conversa com o seu GitHub"),
    @("ffmpeg", "Gyan.FFmpeg",       "separa o audio e as imagens do video")
)

foreach ($p in $programas) {
    if (Get-Command $p[0] -ErrorAction SilentlyContinue) {
        Write-Host "   $($p[0]) ja instalado ($($p[2]))" -ForegroundColor Green
    } else {
        Write-Host "-> instalando $($p[0]) ($($p[2]))..." -ForegroundColor Cyan
        winget install --id $p[1] --accept-source-agreements --accept-package-agreements -h
    }
}

# whisper.cpp — binario pronto do GitHub, sem precisar compilar nem instalar Python
$binDir = Join-Path $env:USERPROFILE "whisper-bin"
$exe    = Join-Path $binDir "whisper-cli.exe"
if (Test-Path $exe) {
    Write-Host "   whisper ja instalado (transcreve a fala)" -ForegroundColor Green
} else {
    Write-Host "-> baixando o whisper (transcreve a fala)..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path $binDir | Out-Null
    $zip = Join-Path $env:TEMP "whisper.zip"
    $api = "https://api.github.com/repos/ggml-org/whisper.cpp/releases/latest"
    $rel = Invoke-RestMethod -Uri $api -Headers @{ "User-Agent" = "app-da-vsl" }
    $asset = $rel.assets | Where-Object { $_.name -match "win.*x64.*\.zip$" -and $_.name -notmatch "cuda|hip|vulkan" } | Select-Object -First 1
    if (-not $asset) { $asset = $rel.assets | Where-Object { $_.name -match "\.zip$" } | Select-Object -First 1 }
    if (-not $asset) {
        Write-Host "!! Nao achei o download automatico do whisper." -ForegroundColor Red
        Write-Host "   Baixe manualmente em: https://github.com/ggml-org/whisper.cpp/releases"
        Write-Host "   Descompacte e coloque o whisper-cli.exe em: $binDir"
        exit 1
    }
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip -UseBasicParsing
    Expand-Archive -Path $zip -DestinationPath $binDir -Force
    Remove-Item $zip -Force
    # o exe pode vir dentro de subpasta
    if (-not (Test-Path $exe)) {
        $achado = Get-ChildItem -Path $binDir -Recurse -Filter "whisper-cli.exe" | Select-Object -First 1
        if (-not $achado) { $achado = Get-ChildItem -Path $binDir -Recurse -Filter "main.exe" | Select-Object -First 1 }
        if ($achado) { Copy-Item $achado.FullName $exe -Force }
    }
}

$modeloDir = Join-Path $env:USERPROFILE "whisper-models"
$modelo    = Join-Path $modeloDir "ggml-small.bin"
if (Test-Path $modelo) {
    Write-Host "   modelo de transcricao ja instalado" -ForegroundColor Green
} else {
    Write-Host "-> baixando o modelo de transcricao (466MB, so uma vez)..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path $modeloDir | Out-Null
    Invoke-WebRequest -Uri "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin" `
                      -OutFile $modelo -UseBasicParsing
}

# deixa o whisper-cli visivel para qualquer terminal (inclusive o Git Bash)
$pathUsuario = [Environment]::GetEnvironmentVariable("Path", "User")
if ($null -eq $pathUsuario) { $pathUsuario = "" }
$jaTem = $pathUsuario.Split(";") | Where-Object { $_.TrimEnd("\") -ieq $binDir.TrimEnd("\") }
if ($jaTem) {
    Write-Host "   a pasta do whisper ja esta no caminho de busca" -ForegroundColor Green
} else {
    Write-Host "-> colocando a pasta do whisper no caminho de busca..." -ForegroundColor Cyan
    $novo = if ($pathUsuario.Trim() -eq "") { $binDir } else { $pathUsuario.TrimEnd(";") + ";" + $binDir }
    [Environment]::SetEnvironmentVariable("Path", $novo, "User")
}

Write-Host ""
Write-Host "Pronto." -ForegroundColor Green
Write-Host "Feche e abra o terminal de novo — so assim os programas novos aparecem." -ForegroundColor Green
Write-Host "Falta uma coisa so, que voce mesmo faz: 'gh auth login' (entra na sua conta do GitHub)."
