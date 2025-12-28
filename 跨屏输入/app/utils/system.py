import subprocess
import sys
from typing import Optional


def send_macos_notification(title: str, message: str, sound: Optional[str] = None) -> bool:
    """
    使用 macOS osascript 发送原生系统通知
    
    Args:
        title: 通知标题
        message: 通知内容
        sound: 可选，通知声音名称（如 "default", "Ping", "Pop" 等），None 表示静音
    
    Returns:
        bool: 通知是否发送成功
    """
    try:
        if sys.platform != "darwin":
            print(f"警告: 当前系统不是 macOS (当前: {sys.platform})，无法发送系统通知")
            return False

        script = f'display notification "{message}" with title "{title}"'
        
        if sound:
            script += f' sound name "{sound}"'
        
        result = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0:
            print(f"系统通知已发送: [{title}] {message}")
            return True
        else:
            print(f"系统通知发送失败: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("系统通知发送超时")
        return False
    except Exception as e:
        print(f"发送系统通知时发生错误: {e}")
        return False


def send_cross_device_notification(message: str) -> bool:
    """
    发送跨设备消息通知（封装后的便捷函数）
    
    Args:
        message: 接收到的消息内容
    
    Returns:
        bool: 通知是否发送成功
    """
    return send_macos_notification(
        title="跨屏输入",
        message=message,
        sound="default"
    )


def test_notification() -> bool:
    """
    测试系统通知功能
    
    Returns:
        bool: 测试是否成功
    """
    return send_macos_notification(
        title="跨屏输入测试",
        message="系统通知功能正常工作！",
        sound="Ping"
    )
