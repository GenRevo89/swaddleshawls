$envPath = ".\.env.local"
if (-Not (Test-Path $envPath)) {
    Write-Host "Could not find .env.local"
    exit
}

$key = (Get-Content $envPath | Where-Object { $_ -match "^SURGE_API_KEY=(.*)$" } | ForEach-Object { $matches[1] }).Trim()
$headers = @{ "Ocp-Apim-Subscription-Key" = $key; "Accept" = "application/json" }

Write-Host "Fetching inventory from Surge API..."
$response = Invoke-RestMethod -Uri "https://surge.basalthq.com/api/inventory?limit=100" -Headers $headers

$targetDir = ".\public\products"
if (-Not (Test-Path $targetDir)) { 
    New-Item -ItemType Directory -Path $targetDir | Out-Null 
}
# ensure targetDir absolute path for IO.File WriteAllBytes
$targetDirAbs = (Resolve-Path $targetDir).ProviderPath

$items = if ($response.items) { $response.items } elseif ($response.data) { $response.data } else { $response }

$count = 0

foreach ($item in $items) {
    if (-not $item) { continue }
    $sku = if ($item.sku) { $item.sku } else { $item.name -replace '[^a-zA-Z0-9_\-]', '_' }
    $idx = 0
    
    $allImages = @()
    if ($item.image -and $item.image.Length -gt 5) { $allImages += $item.image }
    if ($item.images) { foreach ($i in $item.images) { if ($i.Length -gt 5) { $allImages += $i } } }
    $allImages = $allImages | Select-Object -Unique
    
    foreach ($img in $allImages) {
        $idx++
        $filename = "${sku}_${idx}"
        
        if ($img -match "^http") {
            $uri = [System.Uri]::new($img)
            $ext = [System.IO.Path]::GetExtension($uri.LocalPath)
            if (-not $ext) { $ext = ".png" }
            $destPath = Join-Path $targetDirAbs ($filename + $ext)
            
            if (-not (Test-Path $destPath)) {
                Write-Host "Downloading $destPath from URL..."
                try { Invoke-WebRequest -Uri $img -OutFile $destPath; $count++ } catch { Write-Host "Failed: $_" }
            }
        }
        elseif ($img -match "^data:image/(\w+);base64,(.*)$") {
            $ext = "." + $matches[1]
            if ($ext -eq ".jpeg") { $ext = ".jpg" }
            $base64 = $matches[2]
            $destPath = Join-Path $targetDirAbs ($filename + $ext)
            
            if (-not (Test-Path $destPath)) {
                Write-Host "Saving Base64 to $destPath ..."
                try {
                    $bytes = [Convert]::FromBase64String($base64)
                    [System.IO.File]::WriteAllBytes($destPath, $bytes)
                    $count++
                } catch { Write-Host "Failed: $_" }
            }
        }
    }
}

Write-Host "Saved or downloaded $count new images!"
