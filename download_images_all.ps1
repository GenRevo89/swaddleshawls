$envPath = ".\.env.local"
if (-Not (Test-Path $envPath)) {
    Write-Host "Could not find .env.local"
    exit
}

$key = (Get-Content $envPath | Where-Object { $_ -match "^SURGE_API_KEY=(.*)$" } | ForEach-Object { $matches[1] }).Trim()

if (-Not $key) {
    Write-Host "Could not find SURGE_API_KEY in .env.local"
    exit
}

Write-Host "Fetching inventory from Surge API (with limit=100)..."
$headers = @{ "Ocp-Apim-Subscription-Key" = $key; "Accept" = "application/json" }
$response = Invoke-RestMethod -Uri "https://surge.basalthq.com/api/inventory?limit=100" -Headers $headers

$targetDir = ".\public\products"
if (-Not (Test-Path $targetDir)) { 
    New-Item -ItemType Directory -Path $targetDir | Out-Null 
    Write-Host "Created public\products directory."
}

$urls = @()
if ($response.data) { $response = $response.data }
if ($response.items) { $response = $response.items }

foreach ($item in $response) {
    if ($item.image -and $item.image -match "^http") { $urls += $item.image }
    if ($item.images) {
        foreach ($img in $item.images) {
            if ($img -match "^http") { $urls += $img }
        }
    }
}

$urls = $urls | Select-Object -Unique
Write-Host "Found $($urls.Length) unique image URLs to download."

foreach ($url in $urls) {
    $uri = [System.Uri]::new($url)
    $filename = [System.IO.Path]::GetFileName($uri.LocalPath)
    if (-not $filename) { $filename = "image_$(Get-Random -Minimum 1000 -Maximum 9999).png" }
    
    # Clean up filename
    $filename = [System.Web.HttpUtility]::UrlDecode($filename)
    $filename = $filename -replace '[^a-zA-Z0-9.\-_]', '_'
    
    $destPath = Join-Path $targetDir $filename
    Write-Host "Downloading: $filename"
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $destPath
    } catch {
        Write-Host "Failed to download $url : $_"
    }
}
Write-Host "Download complete!"
