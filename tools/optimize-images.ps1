# ============================================================================
#  Optimiza el arte del juego en una carpeta ligera (img/optimized/...)
#  · Escala a 320 px (máx lado) con bicúbica de alta calidad.
#  · PNG con transparencia se mantiene PNG; JPG se re-encoda a calidad 82.
#  La UI sirve primero la versión optimizada (js/04-ui.js: optOf) y cae a la
#  original si no existe. Ejecutar: npm run images
# ============================================================================
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outBase = Join-Path $root 'img\optimized'
$maxDim = 320
$jpgQ = 82
$srcRoots = @('img\personajes', 'img\extras\icons', 'img\minijuegos', 'img\sobres')

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$created = 0; $total = 0

foreach ($r in $srcRoots) {
  $srcRoot = Join-Path $root $r
  if (-not (Test-Path -LiteralPath $srcRoot)) { continue }
  $relRoot = $r.Substring(4)
  $files = Get-ChildItem -LiteralPath $srcRoot -Recurse -File | Where-Object { $_.Extension -match '^\.(png|jpe?g)$' }
  foreach ($f in $files) {
    $total++
    $rel = $f.FullName.Substring($srcRoot.Length + 1)
    $target = Join-Path (Join-Path $outBase $relRoot) $rel
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    try {
      $big = [Math]::Max($img.Width, $img.Height)
      $scale = [Math]::Min(1.0, $maxDim / $big)
      $w = [Math]::Max(1, [int][Math]::Round($img.Width * $scale))
      $h = [Math]::Max(1, [int][Math]::Round($img.Height * $scale))
      if ($w -eq $img.Width -and $h -eq $img.Height -and $f.Extension -eq '.png') {
        # Ya es pequeña: se copia tal cual (solo si no existe el destino)
        if (-not (Test-Path -LiteralPath $target)) {
          New-Item -ItemType Directory -Path (Split-Path $target) -Force | Out-Null
          Copy-Item -LiteralPath $f.FullName -Destination $target
        }
      } else {
        $bmp = New-Object System.Drawing.Bitmap($w, $h)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        try {
          $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
          $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
          $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
          $g.Clear([System.Drawing.Color]::Transparent)
          $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $w, $h)))
        } finally { $g.Dispose() }
        New-Item -ItemType Directory -Path (Split-Path $target) -Force | Out-Null
        if ($f.Extension -match '^\.jpe?g$') {
          $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
          $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$jpgQ)
          $bmp.Save($target, $jpegCodec, $ep)
        } else {
          $bmp.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
        }
        $bmp.Dispose()
      }
      $created++
    } finally { $img.Dispose() }
  }
}

Write-Output ("Optimizadas {0} de {1} imágenes en {2}" -f $created, $total, $outBase)