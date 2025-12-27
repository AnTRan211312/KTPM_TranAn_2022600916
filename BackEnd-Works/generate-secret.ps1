$bytes = New-Object byte[] 32
$rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
$rng.GetBytes($bytes)
$base64 = [Convert]::ToBase64String($bytes)
Write-Output $base64
