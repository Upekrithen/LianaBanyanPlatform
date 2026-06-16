#Requires -Version 5.1
<#
.SYNOPSIS
  Packages the MnemosyneC Plow CLI LAN Mesh Bundle omnibus zip.
#>

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$out  = Join-Path (Split-Path -Parent (Split-Path -Parent $root)) "Cephas\cephas-hugo\static\download\MnemosyneC-Plow-CLI-Mesh-LAN.zip"

Write-Host "=== Building MnemosyneC-Plow-CLI-Mesh-LAN.zip ===" -ForegroundColor Cyan
Write-Host "Source: $root"
Write-Host "Output: $out"

# Stage to temp
$tmp = Join-Path $env:TEMP "plow-mesh-stage-$(Get-Random)"
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp | Out-Null
New-Item -ItemType Directory -Path "$tmp\shards" | Out-Null

# Copy files
Copy-Item "$root\plow-cli.js"      "$tmp\plow-cli.js"
Copy-Item "$root\aggregate.js"     "$tmp\aggregate.js"
Copy-Item "$root\setup-helper.ps1" "$tmp\setup-helper.ps1"
Copy-Item "$root\README.md"        "$tmp\README.md"

# Copy 5 named shards only (exclude test20)
foreach ($shard in @("m0_shard.json","m1_shard.json","m2_shard.json","m3_shard.json","m5_shard.json")) {
    Copy-Item "$root\shards\$shard" "$tmp\shards\$shard"
}

Write-Host "Staged files:" -ForegroundColor DarkGray
Get-ChildItem $tmp -Recurse | ForEach-Object { Write-Host "  $($_.FullName.Replace($tmp, ''))" }

# Remove old zip if exists
if (Test-Path $out) { Remove-Item $out -Force }

# Compress
Compress-Archive -Path "$tmp\*" -DestinationPath $out -CompressionLevel Optimal
Write-Host "[ OK ] Zip created: $out" -ForegroundColor Green

# Report size
$size = [math]::Round((Get-Item $out).Length / 1KB, 1)
Write-Host "[ INFO ] Zip size: ${size} KB" -ForegroundColor Cyan

# Verify: extract to temp2 and list
$tmp2 = Join-Path $env:TEMP "plow-mesh-verify-$(Get-Random)"
if (Test-Path $tmp2) { Remove-Item $tmp2 -Recurse -Force }
Expand-Archive -Path $out -DestinationPath $tmp2
Write-Host "Verify — contents:" -ForegroundColor DarkGray
Get-ChildItem $tmp2 -Recurse | ForEach-Object { Write-Host "  $($_.FullName.Replace($tmp2, ''))" }

$required = @("plow-cli.js","aggregate.js","setup-helper.ps1","README.md",
              "shards\m0_shard.json","shards\m1_shard.json","shards\m2_shard.json",
              "shards\m3_shard.json","shards\m5_shard.json")

$allOk = $true
foreach ($f in $required) {
    $full = Join-Path $tmp2 $f
    if (-not (Test-Path $full)) {
        Write-Host "[ MISSING ] $f" -ForegroundColor Red
        $allOk = $false
    }
}
if ($allOk) {
    Write-Host "[ OK ] All required files present in zip" -ForegroundColor Green
}

# Cleanup temps
Remove-Item $tmp  -Recurse -Force
Remove-Item $tmp2 -Recurse -Force

Write-Host "=== Done ===" -ForegroundColor Cyan
