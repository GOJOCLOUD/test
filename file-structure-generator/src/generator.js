// generator.js
// 负责把文本结构封装成 PowerShell 脚本字符串

function generatePowerShell(structureText) {
  return `# 自动生成的 PowerShell 脚本
param([string]$BasePath = ".")

$structure = @'
${structureText.trim()}
'@

$lines = $structure -split "\\r?\\n" | Where-Object { $_.Trim() -ne "" }

foreach ($line in $lines) {
    $item = $line.Trim()
    $isDir = $item.EndsWith("/")
    $clean = $item -replace '[├─└│]+', '' -replace '^\\s+', ''
    $fullPath = Join-Path $BasePath ($clean.TrimEnd("/").Trim())

    if ($isDir) {
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath | Out-Null
        }
    } else {
        $dir = Split-Path $fullPath -Parent
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir | Out-Null
        }
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType File -Path $fullPath | Out-Null
        }
    }
}

Write-Host "✅ 已生成文件结构到: $(Resolve-Path $BasePath)"
`;
}

export { generatePowerShell };
