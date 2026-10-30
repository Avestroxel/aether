#requires -Version 5.1
[CmdletBinding()]
param(
    [string]$Source = $PSScriptRoot,
    [Alias('Home')][string]$InstallHome = (Join-Path $env:LOCALAPPDATA 'AETHER'),
    [string]$LauncherDirectory,
    [switch]$RebuildPackage,
    [switch]$NoPath
)

$ErrorActionPreference = 'Stop'

function Test-AbsolutePath([string]$Path) {
    return $Path -match '^(?:[A-Za-z]:[\\/]|\\\\[^\\]+\\[^\\]+(?:\\|$))'
}

function Assert-PlainItem([string]$Path, [bool]$Directory) {
    $item = Get-Item -LiteralPath $Path -Force -ErrorAction Stop
    if ($item.PSIsContainer -ne $Directory -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "Unexpected or linked path: $Path"
    }
}

function Assert-PlainParents([string]$Path) {
    $current = [IO.Path]::GetFullPath($Path)
    while ($current) {
        if (Test-Path -LiteralPath $current) { Assert-PlainItem $current $true }
        $parent = [IO.Path]::GetDirectoryName($current)
        if ($parent -eq $current) { break }
        $current = $parent
    }
}

function Get-LauncherText([string]$Root) {
    # ASCII-only batch file: Unicode source and launcher paths stay in Windows/PowerShell strings.
    return '@echo off' + "`r`n" + 'rem AETHER launcher schema 1' + "`r`n" + 'setlocal DisableDelayedExpansion' + "`r`n" + 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0aether.ps1" %*' + "`r`n"
}

if (-not (Test-AbsolutePath $Source) -or -not (Test-AbsolutePath $InstallHome) -or
    ($LauncherDirectory -and -not (Test-AbsolutePath $LauncherDirectory))) {
    throw 'Source, Home, and LauncherDirectory must be absolute paths.'
}
$Source = [IO.Path]::GetFullPath($Source).TrimEnd('\')
$InstallHome = [IO.Path]::GetFullPath($InstallHome).TrimEnd('\')
if (-not $LauncherDirectory) { $LauncherDirectory = Join-Path $InstallHome 'bin' }
$LauncherDirectory = [IO.Path]::GetFullPath($LauncherDirectory).TrimEnd('\')
if ($Source -match '[\r\n]') { throw 'Source path contains a newline.' }
Assert-PlainParents $Source
Assert-PlainItem $Source $true
$runtime = Join-Path $Source 'aether.ps1'
$builder = Join-Path $Source 'build-portable.ps1'
$manifest = Join-Path $Source 'portable\package-manifest.json'
foreach ($file in @($runtime, $builder)) { Assert-PlainItem $file $false }
if ($RebuildPackage) { & $builder }
Assert-PlainItem $manifest $false
& $builder -Verify

Assert-PlainParents $InstallHome
Assert-PlainParents $LauncherDirectory
$configPath = Join-Path $InstallHome 'config.json'
$launcher = Join-Path $LauncherDirectory 'aether.cmd'
$installedRuntime = Join-Path $LauncherDirectory 'aether.ps1'
$runtimeHash = (Get-FileHash -LiteralPath $runtime -Algorithm SHA256).Hash.ToLowerInvariant()
$encoding = New-Object System.Text.UTF8Encoding($false)
$launcherText = Get-LauncherText $Source
if (Test-Path -LiteralPath $configPath) {
    Assert-PlainItem $configPath $false
    try { $existing = [IO.File]::ReadAllText($configPath) | ConvertFrom-Json -ErrorAction Stop }
    catch { throw "Refusing to replace unrecognized config: $configPath" }
    if ($existing.schema -ne 1 -or $existing.owner -cne 'AETHER install-aether.ps1' -or
        -not (Test-AbsolutePath ([string]$existing.source)) -or
        -not (Test-AbsolutePath ([string]$existing.launcherDirectory)) -or
        $existing.source -match '[\r\n]' -or
        $existing.runtimeHash -cnotmatch '^[a-f0-9]{64}$') {
        throw "Refusing to replace unrecognized config: $configPath"
    }
    Assert-PlainParents $existing.launcherDirectory
    $oldLauncher = Join-Path $existing.launcherDirectory 'aether.cmd'
    if (-not [string]::Equals($oldLauncher, $launcher, [StringComparison]::OrdinalIgnoreCase) -and
        (Test-Path -LiteralPath $oldLauncher)) {
        throw "Old launcher exists at $oldLauncher; uninstall it before changing launcher directories."
    }
}
if (Test-Path -LiteralPath $launcher) {
    Assert-PlainItem $launcher $false
    if ($null -eq $existing -or
        -not [string]::Equals($existing.launcherDirectory, $LauncherDirectory, [StringComparison]::OrdinalIgnoreCase) -or
        [IO.File]::ReadAllText($launcher) -cne (Get-LauncherText $existing.source)) {
        throw "Refusing to overwrite a launcher not owned by this install: $launcher"
    }
}
if (Test-Path -LiteralPath $installedRuntime) {
    Assert-PlainItem $installedRuntime $false
    if ($null -eq $existing -or -not [string]::Equals($existing.launcherDirectory, $LauncherDirectory, [StringComparison]::OrdinalIgnoreCase) -or
        (Get-FileHash -LiteralPath $installedRuntime -Algorithm SHA256).Hash.ToLowerInvariant() -cne $existing.runtimeHash) {
        throw "Refusing to overwrite an unowned or modified runtime: $installedRuntime"
    }
}

if (-not $NoPath) {
    $shadow = Get-Command aether.cmd -CommandType Application -ErrorAction SilentlyContinue
    if ($shadow -and -not [string]::Equals($shadow.Source, $launcher, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Another aether command at $($shadow.Source) would shadow $launcher. Resolve the PATH conflict first."
    }
}
[IO.Directory]::CreateDirectory($InstallHome) | Out-Null
[IO.Directory]::CreateDirectory($LauncherDirectory) | Out-Null
$config = [ordered]@{ schema = 1; owner = 'AETHER install-aether.ps1'; source = $Source; launcherDirectory = $LauncherDirectory; runtimeHash = $runtimeHash }
[IO.File]::WriteAllBytes($installedRuntime, [IO.File]::ReadAllBytes($runtime))
[IO.File]::WriteAllText($configPath, ((ConvertTo-Json -InputObject $config -Depth 3) + "`n"), $encoding)
[IO.File]::WriteAllText($launcher, $launcherText, $encoding)

if (-not $NoPath) {
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $entries = @($userPath -split ';')
    if (-not @($entries | Where-Object { $_.TrimEnd('\') -ieq $LauncherDirectory }).Count) {
        $userPath = if ($userPath) { $userPath + ';' + $LauncherDirectory } else { $LauncherDirectory }
        [Environment]::SetEnvironmentVariable('Path', $userPath, 'User')
    }
    $processEntries = @($env:Path -split ';')
    if (-not @($processEntries | Where-Object { $_.TrimEnd('\') -ieq $LauncherDirectory }).Count) {
        $env:Path = if ($env:Path) { $env:Path + ';' + $LauncherDirectory } else { $LauncherDirectory }
    }
}
# Verify command resolution and execution, including when an isolated home is used.
if (-not [IO.File]::Exists($launcher) -or [IO.File]::ReadAllText($launcher) -cne $launcherText -or
    (Get-FileHash -LiteralPath $installedRuntime -Algorithm SHA256).Hash.ToLowerInvariant() -cne $runtimeHash) {
    throw "Launcher verification failed: $launcher"
}
if (-not $NoPath) {
    $found = Get-Command aether.cmd -CommandType Application -ErrorAction SilentlyContinue
    if (-not $found -or -not [string]::Equals($found.Source, $launcher, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Another aether command shadows $launcher. Resolve the PATH conflict before use."
    }
}
$previousAetherHome = $env:AETHER_HOME
try {
    $env:AETHER_HOME = $InstallHome
    & $launcher --version | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Launcher execution failed: $launcher" }
} finally { $env:AETHER_HOME = $previousAetherHome }
Write-Host "Installed AETHER from $Source. Launcher: $launcher"
if ($NoPath) { Write-Host 'PATH unchanged (-NoPath).' }
else { Write-Host 'User PATH updated; open a new terminal to pick it up.' }
