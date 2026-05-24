<#
.SYNOPSIS
  Canonical multi-line git commit helper for PowerShell.

.DESCRIPTION
  Wraps `git commit -F <tempfile>` with proper UTF-8 encoding, no BOM, and automatic
  cleanup. Avoids the recurring "PowerShell doesn't support heredoc" friction by routing
  through git's -F (file) flag rather than -m (message string), which sidesteps all shell
  argument-quoting hazards.

  Per BRIDLE v10.5 (B124 amendment). Canonical pattern for multi-line commit messages
  across all Knight + Bishop sessions on Windows / PowerShell environments.

.PARAMETER Message
  The commit message (multi-line strings supported). Required.

.PARAMETER ExtraArgs
  Optional array of additional arguments passed through to `git commit`
  (e.g., --amend, --no-verify, --signoff). Defaults to empty.

.PARAMETER WorkingDirectory
  Optional path to run git from. Defaults to current directory.

.EXAMPLE
  $msg = @'
  K###: Title

  Body line 1.
  Body line 2.
  '@
  .\librarian-mcp\scripts\git_commit_message.ps1 -Message $msg

.EXAMPLE
  Get-Content commit_message.txt -Raw | .\librarian-mcp\scripts\git_commit_message.ps1

.EXAMPLE
  .\librarian-mcp\scripts\git_commit_message.ps1 -Message $msg -ExtraArgs '--signoff'

.NOTES
  Exit code: passed through from `git commit`. 0 = success.
  Temp file is created in the system temp directory and removed on exit (success or fail).
  UTF-8 encoding without BOM matches git's default expectation.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, ValueFromPipeline = $true, Position = 0)]
    [string]$Message,

    [Parameter(Mandatory = $false)]
    [string[]]$ExtraArgs = @(),

    [Parameter(Mandatory = $false)]
    [string]$WorkingDirectory
)

# Resolve working directory
$startingDir = Get-Location
if ($WorkingDirectory) {
    if (-not (Test-Path $WorkingDirectory)) {
        Write-Error "WorkingDirectory does not exist: $WorkingDirectory"
        exit 2
    }
    Set-Location $WorkingDirectory
}

# Create temp file with UTF-8 (no BOM) encoding
$tempFile = [System.IO.Path]::GetTempFileName()
try {
    # Write message as UTF-8 without BOM (PS 5.1 default UTF8 has BOM; explicit UTF8NoBOM via .NET)
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($tempFile, $Message, $utf8NoBom)

    # Build git command
    $gitArgs = @('commit', '-F', $tempFile)
    if ($ExtraArgs.Count -gt 0) {
        $gitArgs += $ExtraArgs
    }

    # Invoke git
    & git @gitArgs
    $gitExitCode = $LASTEXITCODE
}
finally {
    # Always clean up temp file
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
    }
    # Restore starting directory if we changed it
    if ($WorkingDirectory) {
        Set-Location $startingDir
    }
}

exit $gitExitCode
