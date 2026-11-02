#requires -Version 5.1
[CmdletBinding()]
param([switch]$Verify)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$package = Join-Path $root 'portable'
$utf8 = New-Object System.Text.UTF8Encoding($false, $true)
$slug = '^[a-z0-9]+(?:-[a-z0-9]+)*$'
$knowledgeName = '^(?:README|[a-z0-9]+(?:-[a-z0-9]+)*)\.md$'

function Assert-SafeItem([string]$path, [bool]$directory) {
    $item = Get-Item -LiteralPath $path -Force -ErrorAction Stop
    if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 -or $item.PSIsContainer -ne $directory) {
        throw "Unsafe or unexpected resource: $path"
    }
    return $item
}

function Get-Names([string]$path) {
    $names = [string[]]@(Get-ChildItem -LiteralPath $path -Force | ForEach-Object { $_.Name })
    [Array]::Sort($names, [StringComparer]::Ordinal)
    return $names
}

function Get-Hash([byte[]]$bytes) {
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant() }
    finally { $sha.Dispose() }
}

function Get-Bytes([string]$text) { return ,$utf8.GetBytes($text) }

function Read-Source([string]$path) {
    Assert-SafeItem $path $false | Out-Null
    $bytes = [IO.File]::ReadAllBytes($path)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191) {
        throw "UTF-8 BOM in source: $path"
    }
    return ,$bytes
}

function Add-File([System.Collections.IDictionary]$files, [string]$path, [string]$content) {
    $files.Add($path, (Get-Bytes $content))
}

function Assert-Inventory([string]$base, [System.Collections.IDictionary]$expected) {
    Assert-SafeItem $base $true | Out-Null
    $found = @{}
    $pending = New-Object 'System.Collections.Generic.List[string]'
    $pending.Add($base)
    while ($pending.Count -gt 0) {
        $dir = $pending[$pending.Count - 1]
        $pending.RemoveAt($pending.Count - 1)
        foreach ($name in (Get-Names $dir)) {
            $path = Join-Path $dir $name
            $item = Get-Item -LiteralPath $path -Force
            if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw "Reparse point in package: $path" }
            if ($item.PSIsContainer) { $pending.Add($path); continue }
            $relative = $path.Substring($base.Length + 1).Replace('\', '/')
            if (-not $expected.Contains($relative) -or $found.ContainsKey($relative)) { throw "Unexpected package file: $relative" }
            $found[$relative] = $true
        }
    }
    if ($found.Count -ne $expected.Count) { throw 'Missing package files' }
}

Assert-SafeItem $root $true | Out-Null
$skillsDir = Join-Path $root 'skills'
$knowledgeDir = Join-Path $root 'knowledge'
Assert-SafeItem $skillsDir $true | Out-Null
Assert-SafeItem $knowledgeDir $true | Out-Null

$sources = [ordered]@{}
$files = [ordered]@{}
$knowledge = @(Get-Names $knowledgeDir)
foreach ($name in $knowledge) {
    if ($name -cnotmatch $knowledgeName) { throw "Invalid knowledge entry: $name" }
    $relative = "knowledge/$name"
    $bytes = Read-Source (Join-Path $knowledgeDir $name)
    $sources.Add($relative, (Get-Hash $bytes))
    $text = $utf8.GetString($bytes).Replace("`r`n", "`n")
    Add-File $files "aether/knowledge/$name" $text
}

$names = @(Get-Names $skillsDir)
foreach ($name in $names) {
    if ($name -cnotmatch $slug) { throw "Invalid skill name: $name" }
    $dir = Join-Path $skillsDir $name
    Assert-SafeItem $dir $true | Out-Null
    $entries = @(Get-Names $dir)
    if ($entries.Count -ne 1 -or $entries[0] -cne 'SKILL.md') { throw "Unexpected skill entry: $dir" }
    $relative = "skills/$name/SKILL.md"
    $bytes = Read-Source (Join-Path $dir 'SKILL.md')
    $sources.Add($relative, (Get-Hash $bytes))
    $text = $utf8.GetString($bytes).Replace("`r`n", "`n")
    $header = [regex]::Match($text, '\A---\nname: ([^\n]+)\ndescription: ([^\n]+)\n---(?:\n|\z)')
    if (-not $header.Success -or $header.Groups[1].Value -cne $name) { throw "Invalid skill metadata: $name" }
    $text = $text.Substring(0, $header.Groups[1].Index) + "aether-$name" + $text.Substring($header.Groups[1].Index + $header.Groups[1].Length)
    $links = [regex]::Matches($text, '\]\(\.\./\.\./knowledge/([^\s)#?]+\.md)\)')
    foreach ($link in $links) {
        $file = $link.Groups[1].Value
        if ($knowledge -cnotcontains $file) { throw "Missing knowledge reference: $file" }
        $text = $text.Replace($link.Value, "](../../../aether/knowledge/$file)")
    }
    Add-File $files ".agents/skills/aether-$name/SKILL.md" $text
}
if ($names -cnotcontains 'design-thinking') { throw 'Missing design-thinking entry skill' }

$index = @'
# AETHER index

Start with [design thinking](../.agents/skills/aether-design-thinking/SKILL.md). Act as a Creative Director and Principal UI Engineer: compare at least two distinct structural and aesthetic directions, commit to a bold visual thesis, and build directly in production code unless asked for a written brief.

## Routing & Priority
1. **Concept & Anti-Generic Direction:** `design-thinking`, `visual-design`, `anti-generic-design` (`knowledge/strategy.md`, `knowledge/category-directions.md`, `knowledge/visual-direction.md`, `knowledge/distinctiveness.md`)
2. **Core Visual Craft (load for website/UI creation):** `typography`, `color-intelligence`, `layout-intelligence`, `responsive-design` (`knowledge/color-typography.md`, `knowledge/layout-components-responsive.md`)
3. **Interactive & Spatial Craft (load when relevant):** `component-design`, `navigation-architecture`, `interaction-design`, `motion-design`, `scroll-engineering`, `3d-design` (`knowledge/interaction-motion-3d.md`, `knowledge/technology-choices.md`)
4. **Engineering & Quality Gate:** `accessibility`, `performance`, `ux-design`, `design-quality`, `self-improvement` (`knowledge/ux-accessibility.md`, `knowledge/performance.md`, `knowledge/resources-qa.md`, `knowledge/improvement-loop.md`)

**Conflict resolution:** Distinctive art direction, expressive web typography, atmospheric color tokens, varied section rhythm, and domain-authentic copy lead the visual experience. Accessibility (WCAG 2.2 AA, keyboard/touch parity, `prefers-reduced-motion`), semantics, performance, and silent-by-default audio are engineering guardrails—never an excuse for generic system-font wireframes or repetitive 3-card templates.

## Skills
'@.Replace("`r`n", "`n") + "`n"
$index += (($names | ForEach-Object { "- [$_](../.agents/skills/aether-$_/SKILL.md)" }) -join "`n")
$index += "`n`n## Knowledge`n"
$index += (($knowledge | ForEach-Object { "- [$_](knowledge/$_)" }) -join "`n")
$index += "`n"
Add-File $files 'aether/INDEX.md' $index
Add-File $files 'AGENTS.md' "# AETHER`n`nFor website design or UI work, start with ``.agents/skills/aether-design-thinking/SKILL.md`` and consult ``aether/INDEX.md``. Pair distinctive art direction (``visual-design``, ``typography``, ``color-intelligence``, ``layout-intelligence``) with accessible, responsive, silent-by-default engineering, and implement directly in production code.`n"
$workflow = @'
# AETHER design entry workflow

For website, UI/UX, frontend, layout, styling, or visual implementation tasks:
1. Read `.agents/skills/aether-design-thinking/SKILL.md` first. Act as a Creative Director and Principal UI Engineer: silently compare at least two distinct structural and aesthetic concepts tailored to the domain, choose a bold visual thesis, and implement directly in production-quality code (do not output a prose brief unless asked for strategy/critique only).
2. Read `aether/INDEX.md` to load only the skills relevant to the task: pair concept direction with the Core Visual Craft skills (`visual-design`, `typography`, `color-intelligence`, `layout-intelligence`) plus any needed specialist skills (`component-design`, `navigation-architecture`, `interaction-design`, `motion-design`, `scroll-engineering`, `responsive-design`, `3d-design`, `accessibility`, `performance`, `design-quality`).
3. Creative priority and conflict resolution: distinctive art direction, expressive web typography, atmospheric color tokens, varied section rhythm, and domain-authentic content drive the design. Accessibility (WCAG 2.2 AA, keyboard/touch parity, `prefers-reduced-motion`), semantics, performance, and silent-by-default audio are mandatory engineering guardrails that shape how the interface is built—never an excuse for generic system-font wireframes, repetitive 3-card templates, or visual emptiness.
'@.Replace("`r`n", "`n") + "`n"
$rule = "---`ntrigger: model_decision`ndescription: `"Use AETHER for design, UI/UX, frontend, layout, styling, and visual implementation tasks.`"`n---`n`n$workflow"
Add-File $files '.agents/rules/aether-design-thinking.md' $rule

$hashes = [ordered]@{}
foreach ($path in $files.Keys) { $hashes.Add($path, (Get-Hash $files[$path])) }
$manifest = [ordered]@{ schema = 1; sources = $sources; files = $hashes }
Add-File $files 'package-manifest.json' ((ConvertTo-Json -InputObject $manifest -Depth 10).Replace("`r`n", "`n") + "`n")

function Assert-ExistingPackage([string]$base) {
    Assert-SafeItem $base $true | Out-Null
    $manifestPath = Join-Path $base 'package-manifest.json'
    $bytes = Read-Source $manifestPath
    try { $old = ConvertFrom-Json -InputObject ($utf8.GetString($bytes)) }
    catch { throw 'Invalid existing package manifest' }
    if ($old.schema -ne 1 -or $null -eq $old.files -or $null -eq $old.sources) {
        throw 'Invalid existing package manifest'
    }
    $owned = [ordered]@{}
    foreach ($property in $old.files.PSObject.Properties) {
        $path = $property.Name
        if ($path -cne 'AGENTS.md' -and $path -cne 'aether/INDEX.md' -and
            $path -cne '.agents/rules/aether-design-thinking.md' -and
            $path -cnotmatch '^aether/knowledge/(?:README|[a-z0-9]+(?:-[a-z0-9]+)*)\.md$' -and
            $path -cnotmatch '^\.agents/skills/aether-[a-z0-9]+(?:-[a-z0-9]+)*/SKILL\.md$') {
            throw "Invalid existing package path: $path"
        }
        $owned.Add($path, $true)
    }
    $owned.Add('package-manifest.json', $true)
    Assert-Inventory $base $owned
}

function Verify-Package([string]$base) {
    Assert-Inventory $base $files
    $actual = [IO.File]::ReadAllBytes((Join-Path $base 'package-manifest.json'))
    if ((Get-Hash $actual) -cne (Get-Hash $files['package-manifest.json'])) { throw 'Package manifest differs from sources' }
    foreach ($path in $hashes.Keys) {
        $disk = [IO.File]::ReadAllBytes((Join-Path $base ($path.Replace('/', '\'))))
        if ((Get-Hash $disk) -cne $hashes[$path]) { throw "Package file modified: $path" }
    }
}

if ($Verify) {
    Verify-Package $package
    Write-Host "Verified portable package ($($sources.Count) sources, $($hashes.Count) files)."
    return
}

# Stage beside the destination so directory renames remain on the same volume.
$stage = Join-Path $root ('.portable-stage-' + [guid]::NewGuid().ToString('N'))
$backup = Join-Path $root ('.portable-backup-' + [guid]::NewGuid().ToString('N'))
try {
    [IO.Directory]::CreateDirectory($stage) | Out-Null
    foreach ($path in $files.Keys) {
        $target = Join-Path $stage ($path.Replace('/', '\'))
        [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($target)) | Out-Null
        [IO.File]::WriteAllBytes($target, $files[$path])
    }
    Verify-Package $stage
    $hadPackage = Test-Path -LiteralPath $package
    if ($hadPackage) {
        # Do not silently delete extra files or follow links in an old package.
        Assert-ExistingPackage $package
        [IO.Directory]::Move($package, $backup)
    }
    try { [IO.Directory]::Move($stage, $package) }
    catch {
        if ($hadPackage) { [IO.Directory]::Move($backup, $package) }
        throw
    }
    if ($hadPackage) { [IO.Directory]::Delete($backup, $true) }
    Write-Host "Built portable package ($($sources.Count) sources, $($hashes.Count) files)."
}
finally {
    if ([IO.Directory]::Exists($stage)) { [IO.Directory]::Delete($stage, $true) }
}
