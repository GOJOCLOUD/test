import sys
import os
import json
import subprocess
from PySide6.QtWidgets import QApplication, QWidget, QPushButton, QVBoxLayout, QLabel
from PySide6.QtCore import Qt

# 获取脚本所在目录并添加到 Python 路径
script_dir = os.path.dirname(os.path.abspath(__file__))
if script_dir not in sys.path:
    sys.path.insert(0, script_dir)

# PyInstaller 兼容性处理
def resource_path(relative_path):
    """获取资源的绝对路径，支持 PyInstaller 打包"""
    try:
        # PyInstaller 创建临时文件夹，并将路径存储在 _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        # 正常情况下使用当前脚本所在目录
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

# 全局数据路径函数
def get_data_path():
    """获取数据存储路径，用于存放 mouse_clicks.json"""
    # 使用当前脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # 返回完整的 JSON 文件路径（当前目录下的 mouse_clicks.json）
    return os.path.join(script_dir, "mouse_clicks.json")

# 导入其他模块
from interface import ClickToolWindow
from wifi import replay_steps

class LauncherWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)
        self.setWindowTitle("校园网")
        self.setFixedSize(300, 180)
        self.layout = QVBoxLayout()
        self.setLayout(self.layout)

        # 设置浅色主题
        self.setStyleSheet("""
            QWidget {
                background-color: #F7F7F7;
                color: #333333;
            }
            QLabel {
                color: #333333;
            }
            QPushButton {
                background-color: #FFFFFF;
                border: 1px solid #DCDCDC;
                border-radius: 6px;
                padding: 6px;
                color: #333333;
            }
            QPushButton:hover {
                background-color: #F2F2F2;
            }
        """)

        # 获取脚本所在目录
        self.script_dir = os.path.dirname(os.path.abspath(__file__))

        self.label = QLabel()
        self.label.setAlignment(Qt.AlignCenter)
        self.layout.addWidget(self.label)

        self.button = QPushButton()
        self.layout.addWidget(self.button)

        # 添加重新导入按钮
        self.reimport_button = QPushButton("重新导入")
        self.reimport_button.clicked.connect(self.record_steps)
        self.layout.addWidget(self.reimport_button)

        self.check_json_file()

    def check_json_file(self):
        json_path = get_data_path()
        if os.path.exists(json_path):
            with open(json_path, 'r') as f:
                try:
                    # 检查文件是否为空
                    if os.path.getsize(json_path) == 0:
                        self.setup_record_ui()
                        return
                    data = json.load(f)
                    # 检查 "steps" 列表是否非空
                    if data and data.get("steps"):
                        self.setup_run_ui()
                    else:
                        self.setup_record_ui()
                except json.JSONDecodeError:
                    self.setup_record_ui()
        else:
            self.setup_record_ui()

    def setup_run_ui(self):
        self.label.setText("检测到已保存的操作。")
        self.button.setText("运行")
        self.button.clicked.connect(self.run_automation)

    def setup_record_ui(self):
        self.label.setText("未检测到操作，请先录制。")
        self.button.setText("录制")
        self.button.clicked.connect(self.record_steps)

    def run_automation(self):
        print("正在运行自动化脚本...")
        wifi_py_path = os.path.join(self.script_dir, "wifi.py")
        try:
            subprocess.Popen([sys.executable, wifi_py_path], cwd=self.script_dir)
            self.close()
        except FileNotFoundError:
            self.label.setText(f"错误: {wifi_py_path} 未找到。")


    def record_steps(self):
        print("正在启动录制界面...")
        interface_py_path = os.path.join(self.script_dir, "interface.py")
        try:
            subprocess.Popen([sys.executable, interface_py_path], cwd=self.script_dir)
            self.close()
        except FileNotFoundError:
            self.label.setText(f"错误: {interface_py_path} 未找到。")


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = LauncherWindow()
    window.show()
    sys.exit(app.exec())