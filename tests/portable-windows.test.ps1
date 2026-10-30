#requires -Version 5.1
# Run with Windows PowerShell 5.1: powershell.exe -NoProfile -ExecutionPolicy Bypass -File tests/portable-windows.test.ps1
$ErrorActionPreference = 'Stop'
$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$ps = Join-Path $PSHOME 'powershell.exe'
if (-not [IO.File]::Exists($ps) -or $PSVersionTable.PSVersion.Major -ne 5) { throw 'This suite requires Windows PowerShell 5.1.' }
$system = [Environment]::SystemDirectory
$cmd = Join-Path $system 'cmd.exe'
$originalPath = $env:Path
$originalHome = $env:AETHER_HOME
$root = Join-Path ([IO.Path]::GetTempPath()) ('aether-portable-tests-' + [guid]::NewGuid().ToString('N'))
$utf8 = New-Object System.Text.UTF8Encoding($false)
$failures = New-Object 'System.Collections.Generic.List[string]'

function Assert-True($condition, [string]$message) {
    if (-not $condition) { throw $message }
}
function Assert-Equal($actual, $expected, [string]$message) {
    if ($actual -cne $expected) { throw "$message (expected '$expected', got '$actual')" }
}
function Assert-Contains([string]$actual, [string]$pattern, [string]$message) {
    if ($actual -notmatch $pattern) { throw "$message (expected /$pattern/ in '$actual')" }
}
function Read-Text([string]$path) { return [IO.File]::ReadAllText($path, [Text.Encoding]::UTF8) }
function Write-Text([string]$path, [string]$text) { [IO.File]::WriteAllText($path, $text, $utf8) }
function Invoke-Native([string]$exe, [string[]]$arguments, [string]$cwd = $null) {
    $prior = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        if ($cwd) { Push-Location -LiteralPath $cwd }
        try {
            $global:LASTEXITCODE = 0
            $lines = @(& $exe @arguments 2>&1)
            return [pscustomobject]@{ Code = $LASTEXITCODE; Text = (($lines | ForEach-Object { $_.ToString() }) -join "`n") }
        } finally { if ($cwd) { Pop-Location } }
    } finally { $ErrorActionPreference = $prior }
}
function Invoke-Script([string]$script, [string[]]$arguments, [string]$cwd = $null) {
    return (Invoke-Native $ps (@('-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', $script) + $arguments) $cwd)
}
function Invoke-Launcher([string]$launcher, [string[]]$arguments, [string]$cwd) {
    # Calling the .cmd directly exercises its %* forwarding and powershell.exe lookup.
    return (Invoke-Native $launcher $arguments $cwd)
}
function Assert-Success($result, [string]$label) {
    Assert-Equal $result.Code 0 "$label failed: $($result.Text)"
}
function Assert-Failure($result, [string]$pattern, [string]$label) {
    Assert-True ($result.Code -ne 0) "$label unexpectedly succeeded: $($result.Text)"
    Assert-Contains $result.Text $pattern "$label returned an unexpected error"
}
function New-Folder([string]$name) {
    $path = Join-Path $root $name
    [IO.Directory]::CreateDirectory($path) | Out-Null
    return $path
}
function Copy-Source([string]$name) {
    $destination = New-Folder $name
    foreach ($file in @('aether.ps1', 'build-portable.ps1', 'install-aether.ps1', 'uninstall-aether.ps1')) {
        Copy-Item -LiteralPath (Join-Path $repo $file) -Destination $destination
    }
    foreach ($folder in @('skills', 'knowledge', 'portable')) {
        Copy-Item -LiteralPath (Join-Path $repo $folder) -Destination $destination -Recurse
    }
    return $destination
}
function Copy-InteropSource([string]$name) {
    $destination = Copy-Source $name
    Copy-Item -LiteralPath (Join-Path $repo 'dist') -Destination $destination -Recurse
    Copy-Item -LiteralPath (Join-Path $repo 'package.json') -Destination $destination
    Assert-True ([IO.File]::Exists((Join-Path $destination 'dist\cli.js'))) 'Build the legacy Node CLI before running interoperability tests'
    return $destination
}
function Register([string]$source, [string]$installDir) {
    $result = Invoke-Script (Join-Path $source 'install-aether.ps1') @('-Source', $source, '-InstallHome', $installDir, '-NoPath')
    Assert-Success $result 'register'
    $env:AETHER_HOME = $installDir
    $config = Get-Content -LiteralPath (Join-Path $installDir 'config.json') -Raw | ConvertFrom-Json
    Assert-Equal $config.source $source 'registration source'
    return (Join-Path $installDir 'bin\aether.cmd')
}
function Test-Case([string]$name, [scriptblock]$body) {
    try { & $body; Write-Host "PASS $name" }
    catch {
        $failures.Add("${name}: $($_.Exception.Message)")
    }
}

try {
    # Child processes have Windows tools and PowerShell, but no node/npm on PATH.
    $env:Path = "$system;$PSHOME;$env:SystemRoot"
    Assert-True (-not (Get-Command node.exe, npm.cmd -ErrorAction SilentlyContinue)) 'node/npm must not be on the test PATH'
    $source = Copy-Source 'source with spaces'
    $runtime = Join-Path $source 'aether.ps1'
    Test-Case 'portable package is complete and rewrites all skill references' {
        $manifest = Get-Content -LiteralPath (Join-Path $source 'portable\package-manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
        $skillFiles = @($manifest.files.PSObject.Properties.Name | Where-Object { $_ -match '^\.agents/skills/aether-.+/SKILL\.md$' })
        $knowledgeFiles = @($manifest.files.PSObject.Properties.Name | Where-Object { $_ -match '^aether/knowledge/.+\.md$' })
        Assert-Equal $skillFiles.Count (Get-ChildItem -LiteralPath (Join-Path $source 'skills') -Directory).Count 'missing packaged skills'
        Assert-Equal $knowledgeFiles.Count (Get-ChildItem -LiteralPath (Join-Path $source 'knowledge') -File).Count 'missing packaged knowledge'
        $index = Read-Text (Join-Path $source 'portable\aether\INDEX.md')
        foreach ($relative in $skillFiles) {
            $name = ($relative -split '/')[2]
            Assert-Contains $index ([regex]::Escape($name)) "index missing $name"
            $text = Read-Text (Join-Path (Join-Path $source 'portable') ($relative.Replace('/', '\')))
            Assert-Contains $text ('name: ' + [regex]::Escape($name)) "invalid skill name $name"
            Assert-True ($text -notmatch '\]\(\.\./\.\./knowledge/') "unrewritten skill link in $name"
        }
        foreach ($relative in $knowledgeFiles) { Assert-Contains $index ([regex]::Escape(($relative -split '/')[-1])) "index missing $relative" }
        Assert-True ([IO.File]::Exists((Join-Path $source 'portable\.agents\rules\aether-design-thinking.md'))) 'Antigravity rule missing'
    }
    Test-Case 'registration and launcher from an unrelated cwd, Unicode --cwd' {
        $installDir = Join-Path $root 'isolated home'
        $project = New-Folder ('project with spaces ' + [char]0x65E5 + [char]0x672C + [char]0x8A9E)
        $elsewhere = New-Folder 'unrelated cwd'
        $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
        $launcher = Register $source $installDir
        Assert-Equal ([Environment]::GetEnvironmentVariable('Path', 'User')) $userPath '-NoPath changed the user PATH'
        Assert-Success (Invoke-Launcher $launcher @('init', '--cwd', $project) $elsewhere) 'launcher init --cwd'
        Assert-True ([IO.File]::Exists((Join-Path $project 'aether\manifest.json'))) 'init missed the requested project'
        Assert-True (-not [IO.Directory]::Exists((Join-Path $elsewhere 'aether'))) 'init wrote to the caller cwd'
        Assert-Success (Invoke-Launcher $launcher @('doctor', '--cwd', $project) $elsewhere) 'launcher doctor'
        Assert-Success (Invoke-Script $runtime @('init') $elsewhere) 'init in current working directory'
        Assert-True ([IO.File]::Exists((Join-Path $elsewhere 'aether\manifest.json'))) 'implicit cwd was ignored'
        $again = Invoke-Launcher $launcher @('init', '--cwd', $project) $elsewhere
        Assert-Success $again 'repeat init'
        Assert-Contains $again.Text 'current; no managed files changed' 'repeat init was not idempotent'
        Assert-Success (Invoke-Script $runtime @('update', '--cwd', $project) $elsewhere) 'no-op update'
        Assert-Failure (Invoke-Script $runtime @('rollback', '--cwd', $project) $elsewhere) 'No update to roll back' 'rollback without update'
        Assert-Success (Invoke-Script (Join-Path $source 'uninstall-aether.ps1') @('-InstallHome', $installDir, '-NoPath', '-RemoveConfig')) 'unregister'
        Assert-True (-not [IO.File]::Exists($launcher)) 'launcher survived unregister'
        Assert-True (-not [IO.File]::Exists((Join-Path $installDir 'config.json'))) 'config survived unregister'
        Assert-Equal ([Environment]::GetEnvironmentVariable('Path', 'User')) $userPath 'unregister changed user PATH'
    }
    Test-Case 'user AGENTS, Antigravity discovery, modified files and uninstall' {
        $installDir = Join-Path $root 'preservation home'
        $project = New-Folder 'existing instructions'
        $agents = Join-Path $project 'AGENTS.md'
        $gemini = Join-Path $project 'GEMINI.md'
        Write-Text $agents "# User instructions`n"
        Write-Text $gemini "# Antigravity instructions`n"
        $launcher = Register $source $installDir
        Assert-Success (Invoke-Launcher $launcher @('init', '--cwd', $project) $root) 'Antigravity init'
        $rule = Join-Path $project '.agents\rules\aether-design-thinking.md'
        Assert-Contains (Read-Text $rule) 'trigger: model_decision' 'Antigravity rule missing'
        Assert-Contains (Read-Text $rule) 'aether/INDEX.md' 'Antigravity rule lacks index'
        $manifest = Get-Content -LiteralPath (Join-Path $project 'aether\manifest.json') -Raw | ConvertFrom-Json
        Assert-True ($manifest.adapters -contains 'antigravity') 'Antigravity not recorded'
        Assert-True ($null -eq $manifest.files.PSObject.Properties['AGENTS.md']) 'user AGENTS was claimed'
        Assert-Equal (Read-Text $agents) "# User instructions`n" 'user AGENTS was replaced'
        Assert-Equal (Read-Text $gemini) "# Antigravity instructions`n" 'GEMINI was replaced'
        $modified = Join-Path $project 'aether\knowledge\strategy.md'
        Write-Text $modified "# User modified guidance`n"
        Assert-Failure (Invoke-Script $runtime @('doctor', '--cwd', $project)) 'Modified: aether/knowledge/strategy.md' 'doctor modified file'
        Assert-Success (Invoke-Script $runtime @('update', '--cwd', $project)) 'update with local edit'
        Assert-Equal (Read-Text $modified) "# User modified guidance`n" 'update overwrote local edit'
        Assert-Success (Invoke-Script $runtime @('uninstall', '--cwd', $project)) 'uninstall with local edit'
        Assert-Equal (Read-Text $modified) "# User modified guidance`n" 'uninstall removed local edit'
        Assert-Equal (Read-Text $agents) "# User instructions`n" 'uninstall removed user AGENTS'
        Assert-Equal (Read-Text $gemini) "# Antigravity instructions`n" 'uninstall removed GEMINI'
        Assert-True (-not [IO.File]::Exists($rule)) 'uninstall left unchanged Antigravity rule'
        Assert-True ([IO.File]::Exists((Join-Path $project 'aether\manifest.json'))) 'modified managed file lost its ownership record'
        Assert-Failure (Invoke-Script $runtime @('doctor', '--cwd', $project)) 'Modified:' 'doctor after partial uninstall'
        $clean = New-Folder 'clean uninstall'
        Assert-Success (Invoke-Script $runtime @('init', '--cwd', $clean)) 'clean init'
        Assert-True ([IO.File]::Exists((Join-Path $clean 'AGENTS.md'))) 'generated AGENTS missing'
        Assert-Success (Invoke-Script $runtime @('uninstall', '--cwd', $clean)) 'clean uninstall'
        Assert-True (-not [IO.File]::Exists((Join-Path $clean 'AGENTS.md'))) 'generated AGENTS survived uninstall'
        Assert-True (-not [IO.File]::Exists((Join-Path $clean 'aether\manifest.json'))) 'manifest survived clean uninstall'
    }
    Test-Case 'package verification, update and rollback with a changed source' {
        $installDir = Join-Path $root 'version home'
        $project = New-Folder 'version project'
        Register $source $installDir | Out-Null
        Assert-Success (Invoke-Script $runtime @('init', '--cwd', $project)) 'version init'
        $installed = Join-Path $project 'aether\knowledge\strategy.md'
        $before = Read-Text $installed
        $sourceKnowledge = Join-Path $source 'knowledge\strategy.md'
        Write-Text $sourceKnowledge ((Read-Text $sourceKnowledge) + "`n## Portable test revision`n")
        Assert-Failure (Invoke-Script (Join-Path $source 'build-portable.ps1') @('-Verify')) 'Package manifest differs from sources' 'stale package verification'
        Assert-Failure (Invoke-Script $runtime @('update', '--cwd', $project)) 'Package manifest differs from sources' 'update with stale package'
        Assert-Equal (Read-Text $installed) $before 'failed update altered project'
        Assert-Success (Invoke-Script $runtime @('package')) 'package rebuild command'
        Assert-Success (Invoke-Script (Join-Path $source 'build-portable.ps1') @('-Verify')) 'rebuilt package verification'
        Assert-Success (Invoke-Script $runtime @('update', '--cwd', $project)) 'update'
        $after = Read-Text $installed
        Assert-Contains $after 'Portable test revision' 'update did not install revised knowledge'
        Assert-Success (Invoke-Script $runtime @('doctor', '--cwd', $project)) 'doctor after update'
        Write-Text $installed "# Edited after update`n"
        Assert-Failure (Invoke-Script $runtime @('rollback', '--cwd', $project)) 'Modified since update: aether/knowledge/strategy.md' 'rollback with later edit'
        Assert-Equal (Read-Text $installed) "# Edited after update`n" 'failed rollback overwrote edit'
        Write-Text $installed $after
        Assert-Success (Invoke-Script $runtime @('rollback', '--cwd', $project)) 'rollback'
        Assert-Equal (Read-Text $installed) $before 'rollback failed to restore original content'
        Assert-Success (Invoke-Script $runtime @('doctor', '--cwd', $project)) 'doctor after rollback'
        Assert-Failure (Invoke-Script $runtime @('rollback', '--cwd', $project)) 'No update to roll back' 'repeat rollback'
    }
    Test-Case 'missing source and relocation via re-registration' {
        $moving = Copy-Source 'source before move'
        $installDir = Join-Path $root 'moving home'
        $project = New-Folder 'moving project'
        $launcher = Register $moving $installDir
        $relocated = Join-Path $root 'source after move'
        Move-Item -LiteralPath $moving -Destination $relocated
        Assert-Failure (Invoke-Script $runtime @('doctor', '--cwd', $project)) 'AETHER source missing.*Rerun install-aether.ps1' 'missing registered source'
        Assert-Success (Invoke-Script (Join-Path $relocated 'install-aether.ps1') @('-Source', $relocated, '-InstallHome', $installDir, '-NoPath')) 're-register moved source'
        Assert-Equal ((Get-Content -LiteralPath (Join-Path $installDir 'config.json') -Raw | ConvertFrom-Json).source) $relocated 're-registration source'
        Assert-Success (Invoke-Launcher $launcher @('init', '--cwd', $project) $root) 'relocated launcher init'
        Assert-Success (Invoke-Launcher $launcher @('doctor', '--cwd', $project) $root) 'relocated launcher doctor'
        Assert-Success (Invoke-Launcher $launcher @('update', '--cwd', $project) $root) 'relocated launcher update'
    }
    Test-Case 'tampered package is rejected without touching a project' {
        $badSource = Copy-Source 'tamper source'
        $installDir = Join-Path $root 'tamper home'
        $project = New-Folder 'tamper project'
        Register $badSource $installDir | Out-Null
        $file = Join-Path $badSource 'portable\aether\knowledge\strategy.md'
        Write-Text $file "# Tampered package`n"
        Assert-Failure (Invoke-Script (Join-Path $badSource 'build-portable.ps1') @('-Verify')) 'Package file modified: aether/knowledge/strategy.md' 'tampered package verification'
        Assert-Failure (Invoke-Script (Join-Path $badSource 'aether.ps1') @('init', '--cwd', $project)) 'Package file modified: aether/knowledge/strategy.md' 'init with tampered package'
        Assert-True (-not [IO.File]::Exists((Join-Path $project 'aether\manifest.json'))) 'invalid package partially installed'
        Assert-Success (Invoke-Script (Join-Path $badSource 'build-portable.ps1') @()) 'rebuild tampered package'
        $extra = Join-Path $badSource 'portable\unlisted.txt'
        Write-Text $extra "unlisted`n"
        Assert-Failure (Invoke-Script (Join-Path $badSource 'build-portable.ps1') @('-Verify')) 'Unexpected package file: unlisted.txt' 'unexpected package file'
        Assert-Failure (Invoke-Script (Join-Path $badSource 'aether.ps1') @('init', '--cwd', $project)) 'Unexpected package file: unlisted.txt' 'init with unexpected package file'
    }
    Test-Case 'Unicode source and launcher directories' {
        $unicode = [char]0x6F22 + [char]0x5B57
        $unicodeSource = Copy-Source ("source $unicode")
        $installDir = Join-Path $root ("registration $unicode")
        $project = New-Folder ("website $unicode")
        & (Join-Path $unicodeSource 'install-aether.ps1') -InstallHome $installDir -NoPath
        $env:AETHER_HOME = $installDir
        $launcher = Join-Path $installDir 'bin\aether.cmd'
        Assert-Equal ((Get-Content -LiteralPath (Join-Path $installDir 'config.json') -Raw -Encoding UTF8 | ConvertFrom-Json).source) $unicodeSource 'Unicode source registration'
        Assert-Success (Invoke-Launcher $launcher @('init', '--cwd', $project) $root) 'Unicode-source init'
        Assert-Success (Invoke-Launcher $launcher @('doctor', '--cwd', $project) $root) 'Unicode-source doctor'
        Assert-Success (Invoke-Script (Join-Path $unicodeSource 'uninstall-aether.ps1') @('-InstallHome', $installDir, '-NoPath', '-RemoveConfig')) 'Unicode-source unregister'
    }
    Write-Host 'UNTESTED global user PATH registration: -NoPath is covered; testing registry-backed user PATH requires an isolated Windows account.'
    # Only the following interoperability cases may see the development host PATH.
    try {
        $env:Path = $originalPath
        $nodeCommand = Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue
        if ($nodeCommand) { $nodeExe = $nodeCommand.Source }
    } finally { $env:Path = "$system;$PSHOME;$env:SystemRoot" }
    Test-Case 'native init -> legacy Node doctor, update, rollback' {
        Assert-True ($nodeExe -and [IO.File]::Exists($nodeExe)) 'Node executable not available on development host'
        $interop = Copy-InteropSource 'native first source'
        $project = New-Folder 'native first project'
        $installDir = Join-Path $root 'native first home'
        Register $interop $installDir | Out-Null
        $cli = Join-Path $interop 'dist\cli.js'
        $native = Join-Path $interop 'aether.ps1'
        $installed = Join-Path $project 'aether\knowledge\strategy.md'
        Assert-Success (Invoke-Script $native @('init', '--cwd', $project)) 'native init before Node commands'
        $before = Read-Text $installed
        Assert-Success (Invoke-Native $nodeExe @($cli, 'doctor', '--cwd', $project)) 'Node doctor of native install'
        $knowledge = Join-Path $interop 'knowledge\strategy.md'
        Write-Text $knowledge ((Read-Text $knowledge) + "`n## Interop Node update`n")
        Assert-Success (Invoke-Native $nodeExe @($cli, 'update', '--cwd', $project)) 'Node update of native install'
        Assert-Contains (Read-Text $installed) 'Interop Node update' 'Node update did not install revised guidance'
        Assert-Success (Invoke-Native $nodeExe @($cli, 'doctor', '--cwd', $project)) 'Node doctor after update'
        Assert-Success (Invoke-Native $nodeExe @($cli, 'rollback', '--cwd', $project)) 'Node rollback of native install'
        Assert-Equal (Read-Text $installed) $before 'Node rollback did not restore native install'
        Assert-Success (Invoke-Script $native @('doctor', '--cwd', $project)) 'native doctor after Node rollback'
    }
    Test-Case 'legacy Node init -> native doctor, update, rollback' {
        Assert-True ($nodeExe -and [IO.File]::Exists($nodeExe)) 'Node executable not available on development host'
        $interop = Copy-InteropSource 'node first source'
        $project = New-Folder 'node first project'
        $installDir = Join-Path $root 'node first home'
        Register $interop $installDir | Out-Null
        $cli = Join-Path $interop 'dist\cli.js'
        $native = Join-Path $interop 'aether.ps1'
        $installed = Join-Path $project 'aether\knowledge\strategy.md'
        Assert-Success (Invoke-Native $nodeExe @($cli, 'init', '--ide', 'antigravity', '--cwd', $project)) 'Node init before native commands'
        $before = Read-Text $installed
        Assert-Success (Invoke-Script $native @('doctor', '--cwd', $project)) 'native doctor of Node install'
        $knowledge = Join-Path $interop 'knowledge\strategy.md'
        Write-Text $knowledge ((Read-Text $knowledge) + "`n## Interop native update`n")
        Assert-Success (Invoke-Script (Join-Path $interop 'build-portable.ps1') @()) 'build revised interop package'
        Assert-Success (Invoke-Script $native @('update', '--cwd', $project)) 'native update of Node install'
        Assert-Contains (Read-Text $installed) 'Interop native update' 'native update did not install revised guidance'
        Assert-Success (Invoke-Script $native @('doctor', '--cwd', $project)) 'native doctor after update'
        Assert-Success (Invoke-Script $native @('rollback', '--cwd', $project)) 'native rollback of Node install'
        Assert-Equal (Read-Text $installed) $before 'native rollback did not restore Node install'
        Assert-Success (Invoke-Native $nodeExe @($cli, 'doctor', '--cwd', $project)) 'Node doctor after native rollback'
    }
} finally {
    $env:Path = $originalPath
    $env:AETHER_HOME = $originalHome
    if ([IO.Directory]::Exists($root)) { [IO.Directory]::Delete($root, $true) }
}
if ($failures.Count) {
    foreach ($failure in $failures) { [Console]::Error.WriteLine("FAIL $failure") }
    exit 1
}
Write-Host 'All portable Windows integration tests passed.'
