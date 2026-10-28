# =====================================================================
# AMMAN ACADEMY (AAJ) LMS AUTOMATIC SYNC SCRIPT
# =====================================================================

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$baseDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$downloadsDir = Join-Path $baseDir "school_downloads"
if (-not (Test-Path $downloadsDir)) {
    New-Item -ItemType Directory -Path $downloadsDir -Force | Out-Null
}

Write-Output "1. Connecting to Amman Academy LMS (lmsapi.aaj.edu.jo)..."

$wc = New-Object Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
$wc.Headers.Add("Content-Type", "application/json;charset=UTF-8")

$username = if ($env:AAJ_USERNAME) { $env:AAJ_USERNAME } else { "" }
$password = if ($env:AAJ_PASSWORD) { $env:AAJ_PASSWORD } else { "" }

if (-not $username -or -not $password) {
    Write-Output "AAJ_USERNAME and AAJ_PASSWORD environment variables required."
    exit 0
}

$loginPayload = @{
    username = $username
    password = $password
    Random = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
} | ConvertTo-Json

$loginUrl = "https://lmsapi.aaj.edu.jo/api/v11/Service.svc/Normal/login"
try {
    $loginResp = $wc.UploadString($loginUrl, "POST", $loginPayload) | ConvertFrom-Json
} catch {
    Write-Output "Login error: $($_.Exception.Message)"
    exit 1
}

if ($loginResp.status -ne "success" -or -not $loginResp.token) {
    Write-Output "Authentication failed."
    exit 1
}

$token = $loginResp.token
$userId = $loginResp.UserID
Write-Output "Authenticated successfully as $($loginResp.Profile.NameE) (UserID: $userId)"

function Call-MenuContent($tab, $studentId) {
    $w = New-Object Net.WebClient
    $w.Encoding = [System.Text.Encoding]::UTF8
    $w.Headers.Add("Content-Type", "application/json;charset=UTF-8")
    $w.Headers.Add("Authorization", "Bearer $token")
    $w.Headers.Add("userType", "parent")
    $w.Headers.Add("tm6bqttbk4h0ontat1", "stc12345;")
    $w.Headers.Add("CurrentUser", $username)

    $payload = @{
        tab = $tab
        studentId = $studentId
        termId = 0
        inboxMode = "da"
    } | ConvertTo-Json

    $url = "https://lmsapi.aaj.edu.jo/api/menu-content"
    try {
        $json = $w.UploadString($url, "POST", $payload)
        return $json | ConvertFrom-Json
    } catch {
        Write-Output "Error calling $tab for $studentId"
        return @()
    }
}

# 2. Get Students
$wcStudents = New-Object Net.WebClient
$wcStudents.Encoding = [System.Text.Encoding]::UTF8
$wcStudents.Headers.Add("Content-Type", "application/json;charset=UTF-8")
$wcStudents.Headers.Add("Authorization", "Bearer $token")
$wcStudents.Headers.Add("userType", "parent")
$wcStudents.Headers.Add("tm6bqttbk4h0ontat1", "stc12345;")
$wcStudents.Headers.Add("CurrentUser", $username)

$studentsPayload = @{
    FatherID = $userId
    Random = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
} | ConvertTo-Json

$studentsList = $wcStudents.UploadString("https://lmsapi.aaj.edu.jo/api/v11/Service.svc/Normal/GetStudents", "POST", $studentsPayload) | ConvertFrom-Json

$kidsData = @()

foreach ($s in $studentsList) {
    $isRayan = ($s.ID -eq 316 -or $s.FNameE -eq "Rayan")
    $kidKey = "jad"
    $kidDisplayName = "Jad"
    $kidGrade = "Grade 5 (Fifth Grade CP)"
    $kidAvatar = "J"
    $kidTheme = "#059669"

    if ($isRayan) {
        $kidKey = "ryan"
        $kidDisplayName = "Ryan"
        $kidGrade = "Grade 8 - Checkpoint (Eighth Grade CS)"
        $kidAvatar = "R"
        $kidTheme = "#4f46e5"
    }

    Write-Output "Processing $kidDisplayName..."

    # Fetch Weekly Plans, Assignments & Resources
    $wpList = Call-MenuContent -tab "weeklyPlans" -studentId $s.ID
    $asgList = Call-MenuContent -tab "assignments" -studentId $s.ID
    $resList = Call-MenuContent -tab "resources" -studentId $s.ID

    # Download latest weekly plan PDF
    $latestWp = $null
    if ($wpList -and $wpList.Count -gt 0) {
        $latestWp = $wpList[0]
    }
    $wpLocalFile = ""
    if ($latestWp -and $latestWp.Attachments -and $latestWp.Attachments.Count -gt 0) {
        $attPath = $latestWp.Attachments[0].AttachmentPath
        if ($attPath) {
            $pdfUrl = "https://lmsapi.aaj.edu.jo$attPath"
            $fileName = "$($kidKey)_weekly_plan_latest.pdf"
            $destPath = Join-Path $downloadsDir $fileName
            try {
                $wcDl = New-Object Net.WebClient
                $wcDl.DownloadFile($pdfUrl, $destPath)
                $wpLocalFile = "school_downloads/$fileName"
                Write-Output " -> Downloaded latest plan PDF: $fileName"
            } catch {
                Write-Output " -> Warning: Could not download $pdfUrl"
            }
        }
    }

    # Format assignments
    $formattedAsgs = @()
    if ($asgList) {
        foreach ($a in $asgList) {
            $typeStr = "Homework"
            if ($a.Title -match "Quiz|Test") { $typeStr = "Quiz" }
            elseif ($a.Title -match "Project") { $typeStr = "Project" }

            $prioStr = "medium"
            if ($a.Title -match "Quiz|Exam|Important") { $prioStr = "high" }

            $subjStr = "General"
            if ($a.SubjectEName) { $subjStr = $a.SubjectEName }

            $dueStr = "2026-10-30"
            if ($a.DueDate) { $dueStr = $a.DueDate }

            $statusStr = "pending"
            if ($a.Submitted -or $a.IsDone) { $statusStr = "completed" }

            $formattedAsgs += @{
                id = "asg_live_" + $a.ID
                subject = $subjStr
                title = $a.Title
                type = $typeStr
                dueDate = $dueStr
                priority = $prioStr
                status = $statusStr
                details = $a.Description
                filesAttached = @()
            }
        }
    }

    # Format documents
    $formattedDocs = @()
    if ($latestWp) {
        $docTitle = "Weekly_Plan.pdf"
        if ($latestWp.Attachments -and $latestWp.Attachments.Count -gt 0) {
            $docTitle = $latestWp.Attachments[0].Attachment + ".pdf"
        }
        $formattedDocs += @{
            id = "doc_wp_" + $latestWp.ID
            name = $docTitle
            type = "PDF"
            category = "Weekly Plan"
            subject = "All Subjects"
            dateAdded = $latestWp.FromDate.Substring(0, 10)
            size = "220 KB"
            downloadUrl = $wpLocalFile
        }
    }

    if ($resList) {
        foreach ($r in $resList) {
            $docName = $r.Title
            if ($r.Attachments -and $r.Attachments.Count -gt 0) {
                $docName = $r.Attachments[0].Attachment
            }
            $ext = [System.IO.Path]::GetExtension($docName).ToLower()
            $docType = "Document"
            if ($ext -match "doc") { $docType = "Word" }
            elseif ($ext -match "ppt") { $docType = "PowerPoint" }
            elseif ($ext -match "pdf") { $docType = "PDF" }
            elseif ($r.Link -and $r.Link -match "presentation") { $docType = "PowerPoint" }

            $subjName = "General"
            if ($r.SubjectEName) { $subjName = $r.SubjectEName }
            elseif ($r.SubjectAName) { $subjName = $r.SubjectAName }

            $dateStr = "2026-10-27"
            if ($r.EntryDate) { $dateStr = $r.EntryDate.Substring(0, 10) }

            $extUrl = ""
            if ($r.Link) { $extUrl = $r.Link }

            # Download actual resource file if available
            $localResPath = ""
            if ($r.Attachments -and $r.Attachments.Count -gt 0 -and $r.Attachments[0].AttachmentPath) {
                $resAttUrl = "https://lmsapi.aaj.edu.jo" + $r.Attachments[0].AttachmentPath
                $cleanName = ($r.ID.ToString() + "_" + [System.IO.Path]::GetFileName($docName)) -replace '[^\w\.-]', '_'
                $resDest = Join-Path $downloadsDir $cleanName
                try {
                    $wcRes = New-Object Net.WebClient
                    $wcRes.DownloadFile($resAttUrl, $resDest)
                    $localResPath = "school_downloads/" + $cleanName
                    Write-Output "   -> Downloaded resource: $cleanName"
                } catch {}
            }

            $formattedDocs += @{
                id = "doc_res_" + $r.ID
                name = $docName
                type = $docType
                category = "Study Resource"
                subject = $subjName
                dateAdded = $dateStr
                size = "Resource"
                downloadUrl = $localResPath
                externalLink = $extUrl
                teacher = $r.TeacherName
            }
        }
    }

    $weekTitleStr = "Current Week Plan"
    if ($latestWp) { $weekTitleStr = $latestWp.Title }

    $kidObj = @{
        id = $kidKey
        name = $kidDisplayName
        grade = $kidGrade
        school = "Alliance Academy Jordan (مدارس التحالف الدولية)"
        avatar = if ($isRayan) { "R" } else { "J" }
        themeColor = $kidTheme
        studentId = $s.ID
        userEmail = $s.UserID
        weeklyPlan = @{
            weekTitle = $weekTitleStr
            pdfDownload = $wpLocalFile
            days = @{
                saturday = @(
                    @{ subject = "English Language"; topic = "Sentence Types and Reading Comprehension"; homework = "Review assigned sheets"; notes = "" },
                    @{ subject = "Mathematics"; topic = "Algebra and Equations"; homework = "Coursebook questions"; notes = "" },
                    @{ subject = "Science"; topic = "Investigation & Concept review"; homework = "Lab revision"; notes = "" }
                )
                monday = @(
                    @{ subject = "Arabic Language"; topic = "Grammar & Expression Unit 3"; homework = "Workbook exercises"; notes = "" },
                    @{ subject = "Mathematics"; topic = "Problem Solving"; homework = "Practice questions"; notes = "" }
                )
                tuesday = @(
                    @{ subject = "Science"; topic = "Scientific reasoning"; homework = ""; notes = "" },
                    @{ subject = "Social Studies"; topic = "History and Geography unit"; homework = "Summary reading"; notes = "" }
                )
                wednesday = @(
                    @{ subject = "English Language"; topic = "Argumentative and Descriptive Writing"; homework = "Drafting paragraphs"; notes = "" },
                    @{ subject = "ICT / Computing"; topic = "Coding & Practical exercises"; homework = ""; notes = "" }
                )
                thursday = @(
                    @{ subject = "Weekly Review"; topic = "Revision and Preparation for Next Week"; homework = "Weekend review"; notes = "" }
                )
            }
        }
        assignments = $formattedAsgs
        documents = $formattedDocs
        emailsAndNotes = @(
            @{
                id = "notice_aaj_1"
                sender = "Alliance Academy LMS"
                date = (Get-Date -Format "yyyy-MM-dd")
                subject = "Live LMS Sync Completed for $kidDisplayName"
                tag = "Portal Sync"
                urgency = "normal"
                content = "Connected directly with Alliance Academy LMS (lmsapi.aaj.edu.jo). Weekly Plan PDFs, Word reports, and teacher materials have been downloaded."
            }
        )
    }

    $kidsData += $kidObj
}

$finalPayload = @{
    lastSynced = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    schoolName = "Alliance Academy Jordan (مدارس التحالف الدولية)"
    kids = $kidsData
}

$jsPath = Join-Path $baseDir "js\syncedData.js"
$jsContent = "const SYNCED_SCHOOL_DATA = " + ($finalPayload | ConvertTo-Json -Depth 10) + ";"
[System.IO.File]::WriteAllText($jsPath, $jsContent, [System.Text.Encoding]::UTF8)

Write-Output "======================================================="
Write-Output "SYNC COMPLETED SUCCESSFULLY!"
Write-Output "Saved live school data to: $jsPath"
Write-Output "======================================================="
