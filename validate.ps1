$filePath = "specs/001-metric-clock/tasks.md"
$content = Get-Content -Path $filePath

$totalTasks = 0
$tasksPerStory = @{ "US1" = 0; "US2" = 0; "US3" = 0; "US4" = 0 }
$failingLines = @()
$taskIDs = @()

$currentStory = $null # "US1", "US2", "US3", "US4" or $null
$inUserStorySection = $false # indicates if we are currently between a US user-story phase heading and that story checkpoint

# We'll scan line by line
for ($i = 0; $i -lt $content.Count; $i++) {
    $lineNum = $i + 1
    $line = $content[$i]

    # Check for User Story headings
    # Phase 3: User Story 1
    # Checkpoint
    if ($line -match "## Phase 3: User Story 1") {
        $currentStory = "US1"
        $inUserStorySection = $true
    } elseif ($line -match "## Phase 3: User Story 2") {
        $currentStory = "US2"
        $inUserStorySection = $true
    } elseif ($line -match "## Phase 3: User Story 3") {
        $currentStory = "US3"
        $inUserStorySection = $true
    } elseif ($line -match "## Phase 4: User Story 4") {
        $currentStory = "US4"
        $inUserStorySection = $true
    } elseif ($line -match "\*\*Checkpoint\*\*") {
        # Checkpoint ends the user story section
        $inUserStorySection = $false
    } elseif ($line -match "## Phase 5: Polish") {
        # Moving to polish/etc.
        $inUserStorySection = $false
        $currentStory = $null
    }

    # Identify if it is a task line
    # Any line starting with "- [" (including spaces) is checked or if it matches "- [ ] T"
    $isTaskLine = $line -match "^\s*-\s*\["
    
    if ($isTaskLine) {
        $totalTasks++
        
        # 1. Check if it starts exactly with "- [ ] T###" (with 3-digit number)
        # Note: the spec says "starts exactly - [ ] T###"
        $startsExactly = $line -match "^- \[ \] T\d{3}\s"
        if (-not $startsExactly) {
            $failingLines += [PSCustomObject]@{ LineNum = $lineNum; Check = "Starts exactly '- [ ] T###'"; Text = $line }
        }

        # Extra: Extract Task ID
        if ($line -match "T(\d{3})") {
            $idStr = $Matches[1]
            $taskIDs += [int]$idStr
        }

        # 2. Sequential checks and duplicates are handled globally, but let's parse elements

        # 3. Path-like token check: every task line contains an exact path-like token (e.g. contains `/` or a recognizable filename like `package.json`, `tsconfig.json`, `vite.config.ts`, etc.)
        # A simple regex for path-like tokens: words containing / or . with some extensions
        # Check for strings like `src/...` or `package.json`
        $hasPathToken = $line -match "`[a-zA-Z0-9_\-\.\/]+\s*`" -or $line -match "`[a-zA-Z0-9_\-\/]+\.[a-zA-Z0-9_\-]+`"
        if (-not $hasPathToken) {
            $failingLines += [PSCustomObject]@{ LineNum = $lineNum; Check = "Contains exact path-like token"; Text = $line }
        }

        # 4. [US#] check: `[US#]` appears only between the user-story phase heading and that story checkpoint,
        # and setup/foundational/polish task lines have no `[US#]`
        $hasUS = $line -match "\[US\d\]"
        if ($hasUS) {
            # Check if we are currently inside a user story section and if it matches the current active story
            if (-not $inUserStorySection) {
                $failingLines += [PSCustomObject]@{ LineNum = $lineNum; Check = "US marker present outside US section"; Text = $line }
            } else {
                # Verify that it is indeed in the active story
                if ($line -match "\[(US\d)\]") {
                    $usMarker = $Matches[1]
                    if ($usMarker -ne $currentStory) {
                        $failingLines += [PSCustomObject]@{ LineNum = $lineNum; Check = "US marker $usMarker doesn't match current story $currentStory"; Text = $line }
                    }
                    $tasksPerStory[$usMarker]++
                }
            }
        } else {
            # If we are inside user story section, does it require [US#]? The check asks:
            # "`[US#]` appears only between the user-story phase heading and that story checkpoint, and setup/foundational/polish task lines have no `[US#]`"
            # This implies if it has [US#], it must only be in that section. It doesn't strictly say every task in that section *must* have [US#], but usually they do or do not. Let's verify.
        }

        # 5. Templates check: no unresolved template placeholders: `[FEATURE NAME]`, `[###`, `[TODO]`, `[INSERT]`, `[YOUR`, or `TXXX`
        $hasPlaceholder = $line -match "\[FEATURE NAME\]" -or $line -match "\[###" -or $line -match "\[TODO\]" -or $line -match "\[INSERT\]" -or $line -match "\[YOUR" -or $line -match "TXXX"
        if ($hasPlaceholder) {
            $failingLines += [PSCustomObject]@{ LineNum = $lineNum; Check = "Unresolved template placeholders"; Text = $line }
        }

        # 6. [P] markers are syntactically well-formed: if "[P]" appears, is it well formed? Like `[P]` with spaces properly or just matching exactly `\[P\]`
        # Let's ensure if any P-like is there (e.g. `[ P ]` or `[p]`), it is exactly `[P]`
        if ($line -match "\[[pP]\]") {
            if (-not ($line -match "\s\[P\]\s")) {
                # Note: some lines might start like: - [ ] T002 [P] Configure
                if (-not ($line -match "^- \[ \] T\d{3} \[P\] ")) {
                    $failingLines += [PSCustomObject]@{ LineNum = $lineNum; Check = "Syntactically well-formed [P] marker"; Text = $line }
                }
            }
        }
    }
}

# Validate IDs sequential and starting at T001 with no duplicates
$expectedID = 1
$idErrors = @()
for ($i = 0; $i -lt $taskIDs.Count; $i++) {
    $id = $taskIDs[$i]
    if ($id -ne $expectedID) {
        $idErrors += "Task ID mismatch: expected T$(printf "%03d" $expectedID), found T$(printf "%03d" $id) at position $($i+1)"
    }
    $expectedID++
}

# Duplicate check
$duplicates = $taskIDs | Group-Object | Where-Object { $_.Count -gt 1 }
if ($duplicates) {
    $idErrors += "Duplicate IDs: " + ($duplicates.Name -join ", ")
}

# Let's print the summary
Write-Output "=== TOTAL TASKS ==="
Write-Output $totalTasks
Write-Output ""
Write-Output "=== TASKS PER STORY ==="
$tasksPerStory.GetEnumerator() | ForEach-Object { Write-Output "$($_.Name): $($_.Value)" }
Write-Output ""
Write-Output "=== ID ERRORS ==="
if ($idErrors.Count -eq 0) { "None" } else { $idErrors }
Write-Output ""
Write-Output "=== FAILING LINES ==="
if ($failingLines.Count -eq 0) { "None" } else { $failingLines | Format-Table -AutoSize }
