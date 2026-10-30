#requires -Version 5.1
# AETHER Windows project installer. No Node.js or network access required.
$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false, $true)
$manifestName = 'aether/manifest.json'
$ruleName = '.agents/rules/aether-design-thinking.md'
$skillName = '.agents/skills/aether-design-thinking/SKILL.md'

function Sha([byte[]]$bytes) {
    $algorithm = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($algorithm.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant() }
    finally { $algorithm.Dispose() }
}
function Bytes([string]$value) { return ,$utf8.GetBytes($value) }
function JsonBytes($value) { return ,(Bytes ((ConvertTo-Json -InputObject $value -Depth 50).Replace("`r`n", "`n") + "`n")) }
function Properties($obj) {
    if ($null -eq $obj) { return @() }
    return @($obj.PSObject.Properties | Where-Object { $_.MemberType -eq 'NoteProperty' })
}
function Has($obj, [string]$name) { return $null -ne $obj -and $null -ne $obj.PSObject.Properties[$name] }
function SafeName([string]$name) {
    if ($name -cnotmatch '^(?:AGENTS\.md|aether/INDEX\.md|aether/knowledge/(?:README|[a-z0-9]+(?:-[a-z0-9]+)*)\.md|\.agents/skills/aether-[a-z0-9]+(?:-[a-z0-9]+)*/SKILL\.md|\.agents/rules/aether-design-thinking\.md|\.cursor/rules/aether-design-thinking\.mdc|\.github/copilot-instructions\.md|CLAUDE\.md|\.windsurf/rules/aether-design-thinking\.md)$') { throw "Unsafe managed path: $name" }
}
function PlainPath([string]$path, [bool]$directory) {
    $item = Get-Item -LiteralPath $path -Force -ErrorAction Stop
    if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 -or $item.PSIsContainer -ne $directory) { throw "Unsafe linked or unexpected path: $path" }
}
function Target([string]$base, [string]$relative, [bool]$create = $false) {
    if ($relative -notmatch '^[a-zA-Z0-9._/-]+$' -or $relative.StartsWith('/') -or $relative.Contains('..') -or $relative.Contains('//')) { throw "Unsafe relative path: $relative" }
    PlainPath $base $true
    $parts = $relative.Split('/')
    $at = $base
    for ($i = 0; $i -lt $parts.Length - 1; $i++) {
        $at = Join-Path $at $parts[$i]
        if (Test-Path -LiteralPath $at) { PlainPath $at $true }
        elseif ($create) { [IO.Directory]::CreateDirectory($at) | Out-Null; PlainPath $at $true }
        else { return $null }
    }
    return (Join-Path $at $parts[-1])
}
function ReadSafe([string]$base, [string]$relative) {
    $path = Target $base $relative
    if (-not $path -or -not (Test-Path -LiteralPath $path)) { return $null }
    PlainPath $path $false
    return ,([IO.File]::ReadAllBytes($path))
}
function WriteSafe([string]$base, [string]$relative, [byte[]]$data, [string]$expected = $null) {
    $path = Target $base $relative $true
    $old = ReadSafe $base $relative
    if (([string]::IsNullOrEmpty($expected) -and $null -ne $old) -or (-not [string]::IsNullOrEmpty($expected) -and ($null -eq $old -or (Sha $old) -cne $expected))) { throw "File changed or already exists: $relative (expected=$expected, found=$(if ($null -eq $old) { 'missing' } else { Sha $old }))" }
    $tmp = Join-Path ([IO.Path]::GetDirectoryName($path)) ('.aether-' + [guid]::NewGuid().ToString('N') + '.tmp')
    try {
        [IO.File]::WriteAllBytes($tmp, $data)
        if ([string]::IsNullOrEmpty($expected)) { [IO.File]::Move($tmp, $path) }
        else {
            $latest = ReadSafe $base $relative
            if ($null -eq $latest -or (Sha $latest) -cne $expected) { throw "File changed: $relative" }
            $backupPath = Join-Path ([IO.Path]::GetDirectoryName($path)) ('.aether-' + [guid]::NewGuid().ToString('N') + '.bak')
            try { [IO.File]::Replace($tmp, $path, $backupPath) }
            finally { if ([IO.File]::Exists($backupPath)) { [IO.File]::Delete($backupPath) } }
        }
    } finally { if ([IO.File]::Exists($tmp)) { [IO.File]::Delete($tmp) } }
}
function RemoveSafe([string]$base, [string]$relative, [string]$expected) {
    $data = ReadSafe $base $relative
    if ($null -eq $data -or (Sha $data) -cne $expected) { throw "File changed: $relative" }
    [IO.File]::Delete((Target $base $relative))
}
function ReadJson([byte[]]$bytes, [string]$label) {
    try { return (ConvertFrom-Json -InputObject ($utf8.GetString($bytes)) -ErrorAction Stop) }
    catch { throw "Invalid $label JSON" }
}
function ValidateManifest($m) {
    if ($null -eq $m -or $m.schema -ne 1 -or -not (Has $m 'files') -or -not (Has $m 'adapters') -or -not (Has $m 'history') -or $m.adapters -isnot [array] -or $m.history -isnot [array]) { throw 'Invalid AETHER manifest' }
    foreach ($p in (Properties $m.files)) {
        SafeName $p.Name
        if ($null -eq $p.Value -or $p.Value.hash -cnotmatch '^[a-f0-9]{64}$' -or $p.Value.version -cnotmatch '^[a-f0-9]{64}$') { throw "Invalid manifest entry: $($p.Name)" }
    }
    foreach ($id in $m.adapters) { if ($id -cnotin @('antigravity','cursor','copilot','claude','windsurf')) { throw 'Invalid manifest adapter' } }
    foreach ($id in $m.history) { if ($id -cnotmatch '^[a-f0-9-]{36}$') { throw 'Invalid manifest history' } }
}
function ReadManifest([string]$root) {
    $data = ReadSafe $root $manifestName
    if ($null -eq $data) { return $null }
    $m = ReadJson $data 'AETHER manifest'
    ValidateManifest $m
    return $m
}
function VerifyPackage([string]$source) {
    $builder = Join-Path $source 'build-portable.ps1'
    if (-not [IO.File]::Exists($builder)) { throw "AETHER source missing build-portable.ps1 at $source. Rerun install-aether.ps1 -Source NEW_PATH after moving the repository." }
    PlainPath $builder $false
    & $builder -Verify | Out-Null
    $pack = Join-Path $source 'portable'
    PlainPath $pack $true
    $data = ReadSafe $pack 'package-manifest.json'
    if ($null -eq $data) { throw 'Missing portable package; run build-portable.ps1 from the repository.' }
    $meta = ReadJson $data 'portable package manifest'
    if ($meta.schema -ne 1 -or -not (Has $meta 'files')) { throw 'Invalid portable package manifest' }
    return $meta
}
function PackageData([string]$pack, [string]$rel, [string]$digest) {
    SafeName $rel
    $data = ReadSafe $pack $rel
    if ($null -eq $data -or (Sha $data) -cne $digest) { throw "Missing or invalid portable file: $rel" }
    return ,$data
}
function AddOwned($manifest, [string]$path, [byte[]]$data) {
    $digest = Sha $data
    $manifest.files | Add-Member -NotePropertyName $path -NotePropertyValue ([pscustomobject]@{ hash = $digest; version = $digest }) -Force
}
function Install([string]$root, [string]$source, [bool]$refresh) {
    $old = ReadManifest $root
    if ($refresh -and $null -eq $old) { throw 'AETHER is not installed; use aether init.' }
    $meta = VerifyPackage $source
    $pack = Join-Path $source 'portable'
    $desired = [ordered]@{}
    foreach ($entry in (Properties $meta.files)) {
        if ($entry.Name -ceq 'AGENTS.md') { continue }
        $desired.Add($entry.Name, (PackageData $pack $entry.Name $entry.Value))
    }
    # An existing user AGENTS.md is never owned or replaced.
    if ($null -eq (ReadSafe $root 'AGENTS.md')) { $desired.Add('AGENTS.md', (PackageData $pack 'AGENTS.md' $meta.files.'AGENTS.md')) }
    # Do not install broken references when a non-owned index/entry/knowledge exists.
    foreach ($rel in @('aether/INDEX.md', $skillName) + @(($desired.Keys | Where-Object { $_ -like 'aether/knowledge/*' }))) {
        if ($null -ne (ReadSafe $root $rel) -and -not (Has $old.files $rel)) { throw "Unowned AETHER resource already exists: $rel" }
    }
    $skills = @($desired.Keys | Where-Object { $_ -match '^\.agents/skills/aether-([a-z0-9-]+)/SKILL\.md$' -and ($null -eq (ReadSafe $root $_) -or (Has $old.files $_)) } | ForEach-Object { [regex]::Match($_, '^\.agents/skills/aether-([a-z0-9-]+)/').Groups[1].Value })
    $knowledge = @($desired.Keys | Where-Object { $_ -match '^aether/knowledge/' })
    $index = "# AETHER index`n`nStart with [design thinking](../.agents/skills/aether-design-thinking/SKILL.md). Use only relevant guidance for the task.`n`n## Skills`n"
    $index += (($skills | ForEach-Object { "- [$_](../.agents/skills/aether-$_/SKILL.md)" }) -join "`n")
    $index += "`n`n## Knowledge`n" + (($knowledge | ForEach-Object { "- [$($_.Substring(17))](knowledge/$($_.Substring(17)))" }) -join "`n") + "`n"
    $desired['aether/INDEX.md'] = Bytes $index
    if ($null -eq $old) { $next = [pscustomobject]@{ schema = 1; files = [pscustomobject]@{}; adapters = @(); history = @() } }
    else { $next = ReadJson (JsonBytes $old) 'manifest copy' }
    $changes = New-Object 'System.Collections.Generic.List[object]'
    foreach ($rel in $desired.Keys) {
        SafeName $rel
        $existing = ReadSafe $root $rel
        $owned = if (Has $old.files $rel) { $old.files.PSObject.Properties[$rel].Value } else { $null }
        if ($null -ne $existing -and ($null -eq $owned -or (Sha $existing) -cne $owned.hash)) { continue }
        $data = [byte[]]$desired[$rel]
        if ($null -ne $existing -and (Sha $existing) -ceq (Sha $data)) { continue }
        $changes.Add([pscustomobject]@{ path = $rel; data = $data; previous = $existing })
        AddOwned $next $rel $data
    }
    if (-not ($next.adapters -ccontains 'antigravity') -and (Has $next.files $ruleName)) { $next.adapters = @($next.adapters) + @('antigravity') }
    if ($changes.Count -eq 0) { Write-Host 'AETHER is current; no managed files changed. Existing user files remain untouched.'; return }
    $id = if ($null -ne $old) { [guid]::NewGuid().ToString() } else { $null }
    if ($id) {
        $next.history = @($next.history) + @($id)
        foreach ($item in $changes) {
            if ($null -ne $item.previous) { WriteSafe $root "aether/history/$id/files/$($item.path)" $item.previous }
        }
        $entry = [pscustomobject]@{ before = $old; after = $next; changed = @($changes | ForEach-Object { $_.path }) }
        WriteSafe $root "aether/history/$id/entry.json" (JsonBytes $entry)
    }
    $applied = New-Object 'System.Collections.Generic.List[object]'
    try {
        foreach ($item in $changes) {
            WriteSafe $root $item.path $item.data $(if ($null -ne $item.previous) { Sha $item.previous } else { $null })
            $applied.Add($item)
        }
        $previousManifest = ReadSafe $root $manifestName
        WriteSafe $root $manifestName (JsonBytes $next) $(if ($null -ne $previousManifest) { Sha $previousManifest } else { $null })
    } catch {
        $failure = $_
        for ($i = $applied.Count - 1; $i -ge 0; $i--) {
            $item = $applied[$i]
            try {
                if ($null -ne $item.previous) { WriteSafe $root $item.path $item.previous (Sha $item.data) }
                else { RemoveSafe $root $item.path (Sha $item.data) }
            } catch { Write-Warning "Could not restore $($item.path); inspect this project before retrying." }
        }
        throw $failure
    }
    Write-Host "AETHER installed $($changes.Count) files in $root."
    if (Has $next.files $ruleName) { Write-Host 'Antigravity rule installed.' }
    else { Write-Warning 'An existing unowned Antigravity rule was preserved; add a reference to aether/INDEX.md manually.' }
    foreach ($item in $changes) { Write-Host "  $($item.path)" }
    Write-Host 'Run aether doctor to check managed files. Modified and user-owned files were preserved.'
}
function Doctor([string]$root) {
    $m = ReadManifest $root
    if ($null -eq $m) { throw 'AETHER is not installed (aether/manifest.json is missing).' }
    $issues = New-Object 'System.Collections.Generic.List[string]'
    foreach ($p in (Properties $m.files)) {
        try { $data = ReadSafe $root $p.Name; if ($null -eq $data) { $issues.Add("Missing: $($p.Name)") } elseif ((Sha $data) -cne $p.Value.hash) { $issues.Add("Modified: $($p.Name)") } }
        catch { $issues.Add("Unsafe: $($p.Name): $_") }
    }
    if (-not (Has $m.files $skillName)) { $issues.Add('Missing entry skill: design-thinking') }
    if ($issues.Count) { foreach ($issue in $issues) { Write-Host $issue }; throw "$($issues.Count) project integrity issue(s)." }
    Write-Host 'AETHER managed files are intact.'
}
function Uninstall([string]$root) {
    $m = ReadManifest $root
    if ($null -eq $m) { Write-Host 'AETHER is not installed.'; return }
    $remaining = ReadJson (JsonBytes $m) 'manifest copy'
    $removed = 0
    foreach ($p in (Properties $m.files)) {
        try { $data = ReadSafe $root $p.Name } catch { Write-Warning "Preserving unsafe file $($p.Name)"; continue }
        if ($null -ne $data -and (Sha $data) -cne $p.Value.hash) { Write-Warning "Preserving modified file $($p.Name)"; continue }
        if ($null -ne $data) { RemoveSafe $root $p.Name $p.Value.hash; $removed++ }
        $remaining.files.PSObject.Properties.Remove($p.Name)
    }
    if ((Properties $remaining.files).Count -eq 0) { RemoveSafe $root $manifestName (Sha (ReadSafe $root $manifestName)); $removed++ }
    else {
        $adapterFiles = @{ antigravity = '.agents/rules/aether-design-thinking.md'; cursor = '.cursor/rules/aether-design-thinking.mdc'; copilot = '.github/copilot-instructions.md'; claude = 'CLAUDE.md'; windsurf = '.windsurf/rules/aether-design-thinking.md' }
        $remaining.adapters = @($remaining.adapters | Where-Object { Has $remaining.files $adapterFiles[$_] })
        $raw = ReadSafe $root $manifestName
        WriteSafe $root $manifestName (JsonBytes $remaining) (Sha $raw)
    }
    Write-Host "Removed $removed unchanged managed files. Modified files, contributions and history remain untouched."
}
function Rollback([string]$root) {
    $m = ReadManifest $root
    if ($null -eq $m -or @($m.history).Count -eq 0) { throw 'No update to roll back.' }
    $id = $m.history[-1]
    $entryBytes = ReadSafe $root "aether/history/$id/entry.json"
    if ($null -eq $entryBytes) { throw 'Missing update history.' }
    $entry = ReadJson $entryBytes 'update history'
    ValidateManifest $entry.before; ValidateManifest $entry.after
    if ((ConvertTo-Json $entry.after -Depth 50 -Compress) -cne (ConvertTo-Json $m -Depth 50 -Compress) -or $entry.changed -isnot [array]) { throw 'Update history does not match the installed manifest.' }
    $backups = [ordered]@{}
    foreach ($rel in $entry.changed) {
        SafeName $rel
        $data = ReadSafe $root $rel
        if ($null -eq $data -or -not (Has $entry.after.files $rel) -or (Sha $data) -cne $entry.after.files.PSObject.Properties[$rel].Value.hash) { throw "Modified since update: $rel" }
        $prior = if (Has $entry.before.files $rel) { $entry.before.files.PSObject.Properties[$rel].Value } else { $null }
        $backup = if ($null -ne $prior) { ReadSafe $root "aether/history/$id/files/$rel" } else { $null }
        if ($null -ne $prior -and ($null -eq $backup -or (Sha $backup) -cne $prior.hash)) { throw "Missing or invalid backup: $rel" }
        $backups[$rel] = $backup
    }
    foreach ($rel in @($entry.changed)[($entry.changed.Count - 1)..0]) {
        $after = $entry.after.files.PSObject.Properties[$rel].Value.hash
        if ($null -ne $backups[$rel]) { WriteSafe $root $rel $backups[$rel] $after }
        else { RemoveSafe $root $rel $after }
    }
    $raw = ReadSafe $root $manifestName
    WriteSafe $root $manifestName (JsonBytes $entry.before) (Sha $raw)
    Write-Host "Restored $($entry.changed.Count) files from the last update; contributions and history preserved."
}
function Usage {
    Write-Host "AETHER portable installer 0.1.0`nUsage: aether <init|doctor|update|rollback|uninstall|package> [--cwd DIRECTORY]`n       aether --version | --help`n`nDefault project: current working directory. Windows PowerShell 5.1; Node.js/npm not required."
}
try {
    if ($args.Count -eq 0 -or $args[0] -in @('--help','-h','help')) { Usage; exit 0 }
    if ($args[0] -eq '--version') { Write-Host 'AETHER 0.1.0 (portable Windows)'; exit 0 }
    $command = [string]$args[0]
    if ($command -cnotin @('init','doctor','update','rollback','uninstall','package')) { throw "Unknown command: $command. Run aether --help." }
    $root = (Get-Location).ProviderPath
    $i = 1
    while ($i -lt $args.Count) {
        if ($args[$i] -ne '--cwd' -or $i + 1 -ge $args.Count) { throw "Unexpected option: $($args[$i]). Run aether --help." }
        $root = [string]$args[$i + 1]; $i += 2
    }
    if ($root -notmatch '^(?:[a-zA-Z]:[\\/]|\\\\[^\\]+\\[^\\]+)') { $root = [IO.Path]::GetFullPath((Join-Path (Get-Location).ProviderPath $root)) }
    $root = [IO.Path]::GetFullPath($root)
    PlainPath $root $true
    $homeDir = if ($env:AETHER_HOME) { $env:AETHER_HOME } else { Join-Path $env:LOCALAPPDATA 'AETHER' }
    $configPath = Join-Path $homeDir 'config.json'
    if (-not [IO.File]::Exists($configPath)) { throw "AETHER is not registered ($configPath). Run install-aether.ps1 from the repository." }
    PlainPath $homeDir $true; PlainPath $configPath $false
    $config = ReadJson ([IO.File]::ReadAllBytes($configPath)) 'registration'
    if ($config.schema -ne 1 -or $config.owner -cne 'AETHER install-aether.ps1' -or $config.source -notmatch '^(?:[a-zA-Z]:[\\/]|\\\\[^\\]+\\[^\\]+)') { throw 'Invalid AETHER registration. Rerun install-aether.ps1.' }
    $source = [string]$config.source
    if (-not [IO.Directory]::Exists($source)) { throw "AETHER source missing at $source. Rerun install-aether.ps1 -Source NEW_PATH after moving the repository." }
    PlainPath $source $true
    switch ($command) {
        'init' { Install $root $source $false }
        'update' { Install $root $source $true }
        'doctor' { Doctor $root }
        'uninstall' { Uninstall $root }
        'rollback' { Rollback $root }
        'package' { & (Join-Path $source 'build-portable.ps1'); if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw 'Package build failed.' } }
    }
} catch { [Console]::Error.WriteLine("AETHER: $($_.Exception.Message)"); exit 1 }
