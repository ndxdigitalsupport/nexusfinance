param(
  [string]$Docx,
  [string]$OutDir = "C:\Users\Asus\AppData\Local\Temp\opencode\docpreview"
)
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open($Docx)
$pages = $doc.ComputeStatistics(2)
Write-Host "Page count: $pages"
foreach ($i in 1..$pages) {
  $doc.ActiveWindow.Selection.GoTo(-1, 1, 0, $i) | Out-Null
  $outFile = Join-Path $OutDir ("page_{0}.png" -f $i)
  $doc.ActiveWindow.RangeFromPoint(0, 0).CopyAsPicture() | Out-Null
  Write-Host "exported page $i"
}
$doc.Close($false)
$word.Quit()
[System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($word) | Out-Null