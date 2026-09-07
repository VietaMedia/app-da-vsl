# checar.ps1 — diz, em portugues, o que ja esta pronto e o que falta. Nao instala nada.
# uso: powershell -ExecutionPolicy Bypass -File "<caminho da skill>\scripts\windows\checar.ps1"
$ErrorActionPreference = "SilentlyContinue"
$falta = 0

Write-Host "Conferindo as ferramentas da skill app-da-vsl:" -ForegroundColor Cyan
Write-Host ""

function Testar($cmd, $rotulo) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        Write-Host "  [ok]    $rotulo" -ForegroundColor Green; return 0
    } else {
        Write-Host "  [falta] $rotulo" -ForegroundColor Yellow; return 1
    }
}

$falta += Testar "winget" "winget (o instalador de programas do Windows)"
$falta += Testar "git"    "git (guarda o codigo do seu app)"

# node precisa ser 20 ou mais novo
if (Get-Command node -ErrorAction SilentlyContinue) {
    $versao = (& node -v) -replace "^v",""
    $maior  = [int]($versao.Split(".")[0])
    if ($maior -ge 20) {
        Write-Host "  [ok]    node v$versao (roda o aplicativo)" -ForegroundColor Green
    } else {
        Write-Host "  [falta] node atualizado (voce tem a v$versao, precisa ser 20 ou mais nova)" -ForegroundColor Yellow
        $falta++
    }
} else {
    Write-Host "  [falta] node (roda o aplicativo)" -ForegroundColor Yellow
    $falta++
}

# gh precisa estar instalado E logado
if (Get-Command gh -ErrorAction SilentlyContinue) {
    & gh auth status *> $null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [ok]    gh conectado na sua conta do GitHub" -ForegroundColor Green
    } else {
        Write-Host "  [falta] entrar no GitHub — rode: gh auth login" -ForegroundColor Yellow
        $falta++
    }
} else {
    Write-Host "  [falta] gh (conversa com o seu GitHub)" -ForegroundColor Yellow
    $falta++
}

$falta += Testar "ffmpeg" "ffmpeg (separa o audio e as imagens do video)"

$exe    = Join-Path $env:USERPROFILE "whisper-bin\whisper-cli.exe"
$modelo = Join-Path $env:USERPROFILE "whisper-models\ggml-small.bin"

if (Test-Path $exe) { Write-Host "  [ok]    whisper (transcreve a fala)" -ForegroundColor Green }
else { Write-Host "  [falta] whisper (transcreve a fala)" -ForegroundColor Yellow; $falta++ }

if (Test-Path $modelo) { Write-Host "  [ok]    modelo de transcricao" -ForegroundColor Green }
else { Write-Host "  [falta] modelo de transcricao (466MB, baixa uma vez so)" -ForegroundColor Yellow; $falta++ }

Write-Host ""
if ($falta -eq 0) {
    Write-Host "Tudo pronto." -ForegroundColor Green
} else {
    Write-Host "Falta coisa. Rode isto uma vez e resolve quase tudo:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  powershell -ExecutionPolicy Bypass -File `"$PSScriptRoot\instalar.ps1`""
    Write-Host ""
    Write-Host "Demora uns 10 minutos na primeira vez. Depois nunca mais."
    Write-Host "O 'gh auth login' e a unica parte que voce mesmo faz, na sua tela."
}
exit $falta
