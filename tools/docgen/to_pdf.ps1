$word = New-Object -ComObject Word.Application
$word.Visible = $false

$folders = @('DOC\EN', 'DOC\KH')
foreach ($folder in $folders) {
    $docxFiles = Get-ChildItem -Path $folder -Filter '*.docx' -File
    foreach ($file in $docxFiles) {
        $pdfPath = [System.IO.Path]::ChangeExtension($file.FullName, '.pdf')
        Write-Host "Converting: $($file.Name)"
        $doc = $word.Documents.Open($file.FullName)
        $doc.SaveAs([ref] $pdfPath, [ref] 17)
        $doc.Close()
    }
}

$word.Quit()
Write-Host '=== All conversions complete ==='
