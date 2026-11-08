Add-Type -AssemblyName System.Drawing

$src = "C:\Users\mraaz\.gemini\antigravity\brain\1bf46753-de14-44aa-9adb-3dabad7aa653\.user_uploaded\media_1794134699771_aa7dbb2c.jpg"
$pub = "E:\Projects\WHATPART-v2\public"

Copy-Item $src -Destination "$pub\logo-original.jpg" -Force

$bmp = [System.Drawing.Bitmap]::FromFile($src)
$w = $bmp.Width
$h = $bmp.Height

function GenerateLogoVariants($subBmp, $prefix) {
    $sw = $subBmp.Width
    $sh = $subBmp.Height

    $bWhite = [System.Drawing.Bitmap]::new($sw, $sh, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $bDark = [System.Drawing.Bitmap]::new($sw, $sh, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $bGold = [System.Drawing.Bitmap]::new($sw, $sh, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    for ($y = 0; $y -lt $sh; $y++) {
        for ($x = 0; $x -lt $sw; $x++) {
            $c = $subBmp.GetPixel($x, $y)
            $lum = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
            $alpha = 0
            if ($lum -gt 22) {
                $norm = ($lum - 22) / (255 - 22)
                $alpha = [int][Math]::Min(255, [Math]::Max(0, [Math]::Round($norm * 255)))
            }

            # White
            $bWhite.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
            # Dark (Deep Charcoal / Springbok #063826)
            $bDark.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 6, 56, 38))
            # Gold (#FFB81C)
            $bGold.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 184, 28))
        }
    }

    $bWhite.Save("$pub\$prefix-white.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $bDark.Save("$pub\$prefix-dark.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $bGold.Save("$pub\$prefix-gold.png", [System.Drawing.Imaging.ImageFormat]::Png)

    $bWhite.Dispose()
    $bDark.Dispose()
    $bGold.Dispose()
    Write-Output "Generated $prefix variants ($sw x $sh)"
}

# 1. Full logo (minY=130 to maxY=446, minX=10 to maxX=834)
$fullCrop = [System.Drawing.Rectangle]::new(10, 130, 825, 317)
$bmpFull = $bmp.Clone($fullCrop, $bmp.PixelFormat)
GenerateLogoVariants $bmpFull "logo"
$bmpFull.Dispose()

# 2. Compact logo (car + "What Part?", excluding bottom tagline: minY=130 to maxY=420)
$compactCrop = [System.Drawing.Rectangle]::new(10, 130, 825, 290)
$bmpCompact = $bmp.Clone($compactCrop, $bmp.PixelFormat)
GenerateLogoVariants $bmpCompact "logo-compact"
$bmpCompact.Dispose()

# 3. Mark only (just the car silhouette: minY=130 to maxY=355)
$markCrop = [System.Drawing.Rectangle]::new(10, 130, 825, 225)
$bmpMark = $bmp.Clone($markCrop, $bmp.PixelFormat)
GenerateLogoVariants $bmpMark "logo-mark"
$bmpMark.Dispose()

# 4. Icon (square 512x512)
$iconSize = 512
$iconBmp = [System.Drawing.Bitmap]::new($iconSize, $iconSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($iconBmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$bgBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 6, 56, 38))
$g.FillRectangle($bgBrush, 0, 0, $iconSize, $iconSize)
$bgBrush.Dispose()

$wLogo = [System.Drawing.Bitmap]::FromFile("$pub\logo-white.png")
$targetW = 460
$targetH = [int]($wLogo.Height * ($targetW / $wLogo.Width))
$destX = [int](($iconSize - $targetW) / 2)
$destY = [int](($iconSize - $targetH) / 2)
$g.DrawImage($wLogo, $destX, $destY, $targetW, $targetH)
$wLogo.Dispose()
$g.Dispose()

$iconBmp.Save("$pub\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$iconBmp.Dispose()
Write-Output "Generated icon.png"

$bmp.Dispose()
Write-Output "All variants generated successfully!"
