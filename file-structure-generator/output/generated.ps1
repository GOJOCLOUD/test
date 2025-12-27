# 自动生成的 PowerShell 脚本
param([string]$BasePath = ".")

$structure = @'
cross-screen-platform/
├─ backend/                        # 服务端核心（通信、控制、AI中枢）
│  ├─ core/
│  │  ├─ server.js                 # 启动主服务（WebSocket + API）
│  │  ├─ routes.js                 # 后端路由汇总（HTTP接口）
│  │  └─ sockets.js                # WS事件分发中心
│  │
│  ├─ modules/                     # 功能模块化目录（独立可扩展）
│  │  ├─ keyboardController.js     # 控制系统输入（模拟键盘/鼠标）
│  │  ├─ clipboardController.js    # 剪贴板同步（预留）
│  │  ├─ aiAgent.js                # AI功能集成（LLM提示生成/处理）
│  │  ├─ deviceManager.js          # 多设备连接管理
│  │  └─ fileBridge.js             # 文件跨端传输（预留）
│  │
│  ├─ utils/
│  │  ├─ logger.js                 # 日志系统（带级别输出）
│  │  ├─ config.js                 # 环境变量与全局配置
│  │  └─ helper.js                 # 工具函数库
│  │
│  ├─ data/
│  │  └─ sessions/                 # 会话记录 / 临时数据缓存
│  │
│  ├─ package.json
│  └─ README.md
│
├─ frontend/                       # 前端（手机 / Pad / Web 端 UI）
│  ├─ public/
│  │  └─ index.html
│  ├─ src/
│  │  ├─ App.jsx                   # 根组件
│  │  ├─ pages/
│  │  │  ├─ MobileInput.jsx        # 手机输入界面
│  │  │  ├─ PadDashboard.jsx       # Pad主界面（未来扩展）
│  │  │  └─ Settings.jsx           # 设置页
│  │  ├─ components/
│  │  │  ├─ InputArea.jsx
│  │  │  ├─ ShortcutPanel.jsx
│  │  │  ├─ StatusBar.jsx
│  │  │  └─ AIAssistant.jsx        # AI输入提示（预留）
│  │  ├─ hooks/
│  │  │  └─ useSocket.js           # WebSocket封装Hook
│  │  ├─ services/
│  │  │  ├─ socketClient.js        # 与后端WebSocket通信
│  │  │  └─ apiClient.js           # REST接口封装（后期AI服务用）
│  │  ├─ store/
│  │  │  └─ globalStore.js         # Zustand或Redux（状态管理）
│  │  ├─ assets/
│  │  │  └─ icons/                 # 图标素材
│  │  └─ styles/
│  │     └─ main.css
│  │
│  ├─ package.json
│  └─ vite.config.js
│
├─ shared/                         # 跨前后端通用逻辑（结构定义、协议）
│  ├─ protocol/
│  │  ├─ messageTypes.js           # 定义所有WebSocket事件类型
│  │  └─ schema.js                 # 消息数据结构定义
│  └─ constants/
│     ├─ keyMap.js                 # 全局键位映射表
│     └─ appConfig.js              # 通用配置项
│
├─ scripts/                        # 自动化脚本（打包、部署、更新）
│  ├─ start-dev.ps1
│  ├─ build-all.sh
│  └─ deploy-linux.sh
│
└─ README.md
'@

$lines = $structure -split "\r?\n" | Where-Object { $_.Trim() -ne "" }

foreach ($line in $lines) {
    $item = $line.Trim()
    $isDir = $item.EndsWith("/")
    $clean = $item -replace '[├─└│]+', '' -replace '^\s+', ''
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
