$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$previewOut = Join-Path $root 'tmp-preview.out.log'
$previewErr = Join-Path $root 'tmp-preview.err.log'
$sshOut = Join-Path $root 'tmp-serveo-session.out.log'
$sshErr = Join-Path $root 'tmp-serveo-session.err.log'
$keyDir = 'C:\codex-tmp'
$keyPath = Join-Path $keyDir 'learnova-serveo'
$publicKeyPath = "$keyPath.pub"
$desiredName = 'learnova-lost-map'
$port = 4173

function Test-PortListening {
  param([int]$Port)

  try {
    $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
    return $listener.Count -gt 0
  } catch {
    return $false
  }
}

function Wait-ForFileContent {
  param(
    [string]$Path,
    [int]$TimeoutSeconds = 20
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    if ((Test-Path $Path) -and (Get-Item $Path).Length -gt 0) {
      return Get-Content -Raw $Path
    }

    Start-Sleep -Milliseconds 500
  }

  return ''
}

function Wait-ForPattern {
  param(
    [string]$Path,
    [string]$Pattern,
    [int]$TimeoutSeconds = 25
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    if (Test-Path $Path) {
      $text = Get-Content -Raw $Path
      if ($text -match $Pattern) {
        return $text
      }
    }

    Start-Sleep -Milliseconds 500
  }

  if (Test-Path $Path) {
    return Get-Content -Raw $Path
  }

  return ''
}

Push-Location $root

try {
  & 'C:\Program Files\nodejs\npm.cmd' run build | Out-Host

  if (-not (Test-PortListening -Port $port)) {
    $env:PORT = "$port"
    Start-Process -FilePath node `
      -ArgumentList 'scripts/preview-server.cjs' `
      -WorkingDirectory $root `
      -RedirectStandardOutput $previewOut `
      -RedirectStandardError $previewErr `
      -WindowStyle Hidden | Out-Null

    $previewReady = $false
    $previewDeadline = (Get-Date).AddSeconds(20)

    while ((Get-Date) -lt $previewDeadline) {
      try {
        $status = (Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$port/start").StatusCode
        if ($status -eq 200) {
          $previewReady = $true
          break
        }
      } catch {
      }

      Start-Sleep -Milliseconds 500
    }

    if (-not $previewReady) {
      throw 'Preview server did not start on port 4173.'
    }
  }

  if (-not (Test-Path $keyDir)) {
    New-Item -ItemType Directory -Force -Path $keyDir | Out-Null
  }

  if (-not (Test-Path $keyPath)) {
    ssh-keygen -t ed25519 -N '""' -f $keyPath | Out-Host
  }

  Get-CimInstance Win32_Process -Filter "Name = 'ssh.exe'" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like '*serveo.net*' -or $_.CommandLine -like '*localhost.run*'
  } | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }

  Remove-Item $sshOut, $sshErr -Force -ErrorAction SilentlyContinue

  Start-Process -FilePath ssh `
    -ArgumentList '-i', $keyPath, '-o', 'StrictHostKeyChecking=no', '-R', "$desiredName`:80:127.0.0.1:$port", 'serveo.net' `
    -RedirectStandardOutput $sshOut `
    -RedirectStandardError $sshErr `
    -WindowStyle Hidden | Out-Null

  $outText = Wait-ForPattern -Path $sshOut -Pattern 'https://[a-zA-Z0-9\-\.]+' -TimeoutSeconds 25
  $errText = Wait-ForFileContent -Path $sshErr -TimeoutSeconds 5
  $combined = ($outText + "`n" + $errText).Trim()

  $publicUrl = [regex]::Match($combined, 'https://[a-zA-Z0-9\-\.]+').Value
  $registerUrl = [regex]::Match($combined, 'https://console\.serveo\.net/[^\s]+').Value
  $publicKey = if (Test-Path $publicKeyPath) { Get-Content -Raw $publicKeyPath } else { '' }

  Write-Host ''
  Write-Host 'Public tunnel ready.'
  if ($publicUrl) {
    Write-Host "Public URL: $publicUrl"
  }

  if ($registerUrl) {
    Write-Host "Register this key once for a fixed subdomain: $registerUrl"
  }

  if ($publicKey) {
    Write-Host 'SSH public key:'
    Write-Host $publicKey.Trim()
  }

  Write-Host ''
  Write-Host "Then regenerate QR files with:"
  Write-Host "npm run qr:generate -- $publicUrl"
} finally {
  Pop-Location
}
