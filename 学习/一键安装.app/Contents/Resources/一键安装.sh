#!/bin/bash

echo "======================================"
echo "  校园网自动化程序 - 一键安装脚本"
echo "======================================"
echo ""

# 检查是否为 macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ 此脚本仅适用于 macOS 系统"
    exit 1
fi

# 检查是否已安装 Homebrew
echo "📦 检查 Homebrew..."
if ! command -v brew &> /dev/null; then
    echo "📥 正在安装 Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # 配置 Homebrew 环境变量
    if [[ -f "/opt/homebrew/bin/brew" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew 安装失败"
        exit 1
    fi
    echo "✅ Homebrew 安装成功"
else
    echo "✅ Homebrew 已安装"
fi

# 检查是否已安装 Python 3
echo ""
echo "📦 检查 Python 3..."
if ! command -v python3 &> /dev/null; then
    echo "📥 正在安装 Python 3..."
    brew install python3
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 安装失败"
        exit 1
    fi
    echo "✅ Python 3 安装成功"
else
    echo "✅ Python 3 已安装: $(python3 --version)"
fi

# 检查 pip3
echo ""
echo "📦 检查 pip3..."
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 未找到"
    exit 1
else
    echo "✅ pip3 已安装: $(pip3 --version)"
fi

# 安装依赖库
echo ""
echo "📦 正在安装 Python 依赖库..."
echo "   - PySide6"
echo "   - pynput"
echo "   - pyautogui"

# 使用清华镜像源加速安装
pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple PySide6 pynput pyautogui

if [ $? -eq 0 ]; then
    echo "✅ 依赖库安装成功"
else
    echo "❌ 依赖库安装失败"
    exit 1
fi

# 验证安装
echo ""
echo "🔍 验证安装..."
python3 -c "import PySide6; import pynput; import pyautogui; print('✅ 所有依赖库验证成功！')"

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "  ✅ 安装完成！"
    echo "======================================"
    echo ""
    echo "接下来请执行以下步骤："
    echo "1. 打开 '系统设置' → '隐私与安全性' → '辅助功能'"
    echo "2. 点击 '+' 按钮，添加 '终端' 并勾选启用"
    echo "3. （可选）在 '完全磁盘访问权限' 中添加 '终端'"
    echo "4. 双击 '校园网.app' 运行程序"
    echo ""
    echo "安装完成，终端将自动隐藏..."
    osascript -e 'tell application "Terminal" to set miniaturized of every window to true'
else
    echo ""
    echo "❌ 验证失败，请检查错误信息"
    exit 1
fi