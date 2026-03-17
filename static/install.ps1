# Archipelag.io Island Installer for Windows
# Usage: irm https://archipelag.io/install.ps1 | iex
#
# Environment variables:
#   ARCHIPELAG_VERSION  - Version to install (default: latest)
#   ISLAND_DIR          - Install directory (default: ~/.island)
#   SKIP_WSL_CHECK      - Set to 1 to skip WSL recommendation

$ErrorActionPreference = "Stop"

$Repo = "archipelag-io/node-agent"
$InstallDir = if ($env:ISLAND_DIR) { $env:ISLAND_DIR } else { "$env:USERPROFILE\.island" }
$BinDir = "$InstallDir\bin"
$BinaryName = "island.exe"

function Write-Info($msg)    { Write-Host "  > " -ForegroundColor Green -NoNewline; Write-Host $msg }
function Write-Warn($msg)    { Write-Host "  ! " -ForegroundColor Yellow -NoNewline; Write-Host $msg }
function Write-Err($msg)     { Write-Host "  x " -ForegroundColor Red -NoNewline; Write-Host $msg; exit 1 }

# Suggest WSL if available (better experience for Docker, systemd, etc.)
function Test-WSL {
    if ($env:SKIP_WSL_CHECK -eq "1") { return }

    try {
        $wslStatus = wsl --status 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Warn "WSL is installed on this system."
            Write-Warn "For the best experience (Docker, systemd services, GPU passthrough),"
            Write-Warn "consider running the Island inside WSL instead:"
            Write-Host ""
            Write-Host "    wsl -e sh -c 'curl -fsSL https://archipelag.io/install.sh | sh'" -ForegroundColor Cyan
            Write-Host ""
            Write-Warn "Continuing with native Windows install in 5 seconds... (Ctrl+C to cancel)"
            Start-Sleep -Seconds 5
        }
    } catch {
        # WSL not available, continue with native install
    }
}

function Get-LatestVersion {
    if ($env:ARCHIPELAG_VERSION) {
        return $env:ARCHIPELAG_VERSION
    }

    Write-Info "Checking latest version..."
    try {
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest" -UseBasicParsing
        $version = $release.tag_name -replace '^v', ''
        if (-not $version) { Write-Err "Could not determine latest version." }
        return $version
    } catch {
        Write-Err "Could not fetch latest version. Set `$env:ARCHIPELAG_VERSION manually."
    }
}

function Install-Binary($version) {
    $asset = "island-$version-windows-x86_64.exe"
    $url = "https://github.com/$Repo/releases/download/v$version/$asset"

    Write-Info "Downloading island v$version for windows-x86_64..."

    New-Item -ItemType Directory -Path $BinDir -Force | Out-Null

    $outPath = "$BinDir\$BinaryName"
    try {
        Invoke-WebRequest -Uri $url -OutFile $outPath -UseBasicParsing
    } catch {
        Write-Err "Download failed. Check that v$version has a Windows release at:`n  $url"
    }

    Write-Info "Installed to $outPath"
}

function Test-Binary {
    try {
        $null = & "$BinDir\$BinaryName" --help 2>&1
        Write-Info "Binary verified OK"
    } catch {
        Write-Warn "Binary may be blocked by Windows Defender SmartScreen."
        Write-Warn "Right-click the file > Properties > Unblock, or run:"
        Write-Host "    Unblock-File `"$BinDir\$BinaryName`"" -ForegroundColor Cyan
    }
}

function New-Config($version) {
    $configFile = "$InstallDir\config.toml"

    if (Test-Path $configFile) {
        Write-Info "Config already exists at $configFile"
        return
    }

    $hostname = $env:COMPUTERNAME.ToLower()

    Write-Info "Creating default config at $configFile"
    @"
# Archipelag.io Island Configuration
# Docs: https://docs.archipelag.io/getting-started/for-hosts/

[host]
name = "$hostname"
region = "auto"

[coordinator]
nats_url = "tls://island:f925ab35cc3c46e51af6bb9fb900ed47e16c940e4e196bc4@sail.archipelag.io:4222"
api_url = "https://app.archipelag.io"

[workload]
llm_chat_image = "ghcr.io/archipelag-io/llm-chat:latest"
gpu_devices = []

[workload.resource_limits]
memory_mb = 4096
read_only_rootfs = true
tmpfs_size_mb = 256
network_disabled = true

[cache]
enable_preload = false
max_cached_images = 10

[model_cache]
max_cache_gb = 20

[preload]
enabled = true

[signing]
enabled = true
require_signature = false

[registry]
enabled = true
require_digest = false
"@ | Set-Content -Path $configFile -Encoding UTF8
}

function Set-UserPath {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -like "*$BinDir*") {
        return
    }

    Write-Info "Adding $BinDir to user PATH"
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$BinDir", "User")

    # Also update current session
    $env:Path = "$env:Path;$BinDir"
}

function Write-Success($version) {
    Write-Host ""
    Write-Host "  Archipelag.io Island v$version installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "    Binary:  $BinDir\$BinaryName"
    Write-Host "    Config:  $InstallDir\config.toml"
    Write-Host ""
    Write-Host "  To start the Island:" -ForegroundColor White
    Write-Host ""
    Write-Host "    island --agent --config `"$InstallDir\config.toml`"" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Note: open a new PowerShell window if 'island' is not recognized."
    Write-Host ""
    Write-Host "  Docs:    https://docs.archipelag.io/getting-started/for-hosts/"
    Write-Host "  Discord: https://discord.gg/vwUGXjXmsq"
    Write-Host ""
}

# Main
Write-Host ""
Write-Host "  Archipelag.io Island Installer" -ForegroundColor White
Write-Host ""

Test-WSL

$version = Get-LatestVersion
Install-Binary $version
Test-Binary
New-Config $version
Set-UserPath
Write-Success $version
