#requires -Version 5.1
[CmdletBinding()]
param(
    [Alias('Home')][string]$InstallHome = (Join-Path $env:LOCALAPPDATA 'AETHER'),
    [string]$LauncherDirectory,
    [switch]$RemoveConfig,
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

if (-not (Test-AbsolutePath $InstallHome) -or ($LauncherDirectory -and -not (Test-AbsolutePath $LauncherDirectory))) {
    throw 'Home and LauncherDirectory must be absolute paths.'
}
$InstallHome = [IO.Path]::GetFullPath($InstallHome).TrimEnd('\')
if (-not $LauncherDirectory) { $LauncherDirectory = Join-Path $InstallHome 'bin' }
$LauncherDirectory = [IO.Path]::GetFullPath($LauncherDirectory).TrimEnd('\')
Assert-PlainParents $InstallHome
Assert-PlainParents $LauncherDirectory
$configPath = Join-Path $InstallHome 'config.json'
$launcher = Join-Path $LauncherDirectory 'aether.cmd'
$installedRuntime = Join-Path $LauncherDirectory 'aether.ps1'
if (-not (Test-Path -LiteralPath $configPath)) {
    if (Test-Path -LiteralPath $launcher) { throw "Launcher exists without ownership config: $launcher" }
    Write-Host 'No AETHER registration found.'
    return
}
Assert-PlainItem $configPath $false
try { $config = [IO.File]::ReadAllText($configPath) | ConvertFrom-Json -ErrorAction Stop }
catch { throw "Unrecognized AETHER config: $configPath" }
if ($config.schema -ne 1 -or $config.owner -cne 'AETHER install-aether.ps1' -or
    -not (Test-AbsolutePath ([string]$config.source)) -or
    -not (Test-AbsolutePath ([string]$config.launcherDirectory)) -or
        -not [string]::Equals($config.launcherDirectory, $LauncherDirectory, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Config does not own this launcher: $configPath"
}
$source = [IO.Path]::GetFullPath($config.source).TrimEnd('\')
if ($source -match '[\r\n]' -or $config.runtimeHash -cnotmatch '^[a-f0-9]{64}$') { throw 'Invalid source or runtime hash in config.' }
$expected = '@echo off' + "`r`n" + 'rem AETHER launcher schema 1' + "`r`n" + 'setlocal DisableDelayedExpansion' + "`r`n" + 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0aether.ps1" %*' + "`r`n"
if (Test-Path -LiteralPath $installedRuntime) {
    Assert-PlainItem $installedRuntime $false
    if ((Get-FileHash -LiteralPath $installedRuntime -Algorithm SHA256).Hash.ToLowerInvariant() -cne $config.runtimeHash) {
        throw "Refusing to remove a modified runtime: $installedRuntime"
    }
}
if (Test-Path -LiteralPath $launcher) {
    Assert-PlainItem $launcher $false
    if ([IO.File]::ReadAllText($launcher) -cne $expected) { throw "Refusing to remove a launcher not owned by this install: $launcher" }
}
if (Test-Path -LiteralPath $launcher) {
    [IO.File]::Delete($launcher)
}
if (Test-Path -LiteralPath $installedRuntime) { [IO.File]::Delete($installedRuntime) }
if (-not $NoPath) {
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $entries = @($userPath -split ';' | Where-Object { $_ -and $_.TrimEnd('\') -ine $LauncherDirectory })
    [Environment]::SetEnvironmentVariable('Path', ($entries -join ';'), 'User')
    $env:Path = (@($env:Path -split ';' | Where-Object { $_ -and $_.TrimEnd('\') -ine $LauncherDirectory }) -join ';')
}
if ($RemoveConfig) { [IO.File]::Delete($configPath) }
Write-Host "Removed AETHER launcher: $launcher"
if (-not $RemoveConfig) { Write-Host "Preserved config: $configPath" }
if ($NoPath) { Write-Host 'PATH unchanged (-NoPath).' }
