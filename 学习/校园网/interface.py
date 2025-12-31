import sys
import json
import time
import os
from pynput import mouse
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, 
    QVBoxLayout, QGridLayout, QPushButton, QMessageBox, QListWidget, QInputDialog,
    QListWidgetItem, QLabel, QFrame, QLineEdit
)
from PySide6.QtCore import Qt, Slot
from PySide6.QtGui import QColor, QFont

# 全局数据路径函数

def get_data_path():
    """获取数据存储路径，用于存放 mouse_clicks.json"""
    # 使用当前脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # 返回完整的 JSON 文件路径（当前目录下的 mouse_clicks.json）
    return os.path.join(script_dir, "mouse_clicks.json")

# 导入 replay_steps 函数
from wifi import replay_steps

# 引用底层逻辑
from mouse_click_recorder import MouseClickRecorder

class ClickToolWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("校园网") 
        # 尺寸保持：320宽 x 340高，紧凑的方形感
        self.setFixedSize(320, 340) 
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)
        
        # --- 状态管理 ---
        self.steps = []
        self.last_action_time = None
        self.recorder = None
        self.listener = None
        self.is_editing = False
        self.is_placeholder_shown = False
        self.active_placeholder_text = ""
        self.json_filepath = get_data_path()

        # ========== 界面布局构建 ==========
        self.central_widget = QWidget()
        self.central_widget.setObjectName("CentralWidget")
        self.setCentralWidget(self.central_widget)
        
        self.main_layout = QVBoxLayout(self.central_widget)
        self.main_layout.setContentsMargins(12, 12, 12, 8)
        self.main_layout.setSpacing(8)

        # 1. 顶部功能按钮 (网格)
        self.button_layout = QGridLayout()
        self.button_layout.setSpacing(8) 

        self.btn_start = QPushButton("开始") 
        self.btn_start.setObjectName("BtnStart") 
        
        self.btn_stop = QPushButton("结束")
        self.btn_stop.setObjectName("BtnNormal")
        
        self.btn_add_text = QPushButton("备注")
        self.btn_add_text.setObjectName("BtnNormal")
        
        self.btn_clear = QPushButton("清空")
        self.btn_clear.setObjectName("BtnNormal")
        
        self.button_layout.addWidget(self.btn_start, 0, 0)
        self.button_layout.addWidget(self.btn_stop, 0, 1)
        self.button_layout.addWidget(self.btn_add_text, 1, 0)
        self.button_layout.addWidget(self.btn_clear, 1, 1)
        
        self.main_layout.addLayout(self.button_layout)

        # 2. 分割线
        line = QFrame()
        line.setFrameShape(QFrame.HLine)
        line.setFrameShadow(QFrame.Sunken)
        line.setObjectName("HLine")
        self.main_layout.addWidget(line)

        # 3. 列表区域
        self.step_list_widget = QListWidget()
        self.step_list_widget.setObjectName("StepList")
        self.step_list_widget.setVerticalScrollMode(QListWidget.ScrollPerPixel)
        self.main_layout.addWidget(self.step_list_widget)

        # 4. 【修改】连接按钮 (原WiFi按钮)
        self.btn_connect = QPushButton("连接")
        self.btn_connect.setObjectName("BtnConnect") 
        self.main_layout.addWidget(self.btn_connect)

        # 5. 底部状态栏
        self.lbl_status = QLabel("就绪")
        self.lbl_status.setObjectName("StatusLabel")
        self.lbl_status.setAlignment(Qt.AlignRight | Qt.AlignVCenter)
        self.main_layout.addWidget(self.lbl_status)

        # 应用样式
        self.setup_styles()
        
        # --- 信号连接 ---
        self.btn_start.clicked.connect(self.start_recording)
        self.btn_stop.clicked.connect(self.stop_recording)
        self.btn_add_text.clicked.connect(self.add_text_to_step)
        self.btn_clear.clicked.connect(self.clear_data)
        
        # 连接按钮 (逻辑预留)
        self.btn_connect.clicked.connect(self.launch_wifi_script)
        
        # --- 初始状态 ---
        self.btn_start.setEnabled(True)
        self.btn_stop.setEnabled(False)
        self.btn_add_text.setEnabled(False)
        self.btn_clear.setEnabled(False)
        self.show_placeholder("等待录制...")

    def setup_styles(self):
        font_family = "Microsoft YaHei UI, PingFang SC, sans-serif"
        
        self.setStyleSheet(f"""
            /* 全局背景：浅灰白 */
            QMainWindow, QWidget#CentralWidget {{
                background-color: #F7F7F7; 
                font-family: '{font_family}';
                color: #333333;
            }}
            
            /* 分割线 */
            QFrame#HLine {{
                background-color: #E0E0E0;
                border: none;
                max-height: 1px;
                height: 1px;
            }}

            /* 底部状态文字 */
            QLabel#StatusLabel {{
                color: #999999;
                font-size: 10px;
                font-weight: bold;
                padding-right: 2px;
            }}

            /* 列表：纯白背景 */
            QListWidget {{
                background-color: #FFFFFF;
                border: 1px solid #E5E5E5;
                border-radius: 6px;
                padding: 4px;
                outline: none;
            }}
            QListWidget::item {{
                color: #333333;
                border-radius: 4px;
                margin: 2px 0px;
                padding: 4px 8px;
                border-bottom: 1px solid #F0F0F0;
            }}
            QListWidget::item:selected {{
                background-color: #EBF4FF;
                color: #000000;
                border: 1px solid #Cce0ff;
            }}
            
            /* 滚动条 */
            QScrollBar:vertical {{
                background: transparent;
                width: 6px;
                margin: 0px;
            }}
            QScrollBar::handle:vertical {{
                background: #CCCCCC;
                min-height: 20px;
                border-radius: 3px;
            }}
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{ height: 0px; }}

            /* 按钮通用 */
            QPushButton {{
                font-family: '{font_family}';
                font-size: 12px;
                font-weight: 500;
                border-radius: 6px;
                padding: 6px;
                border: 1px solid #DCDCDC;
                background-color: #FFFFFF;
                color: #333333;
            }}
            QPushButton:hover {{ background-color: #F2F2F2; }}
            QPushButton:pressed {{ background-color: #E0E0E0; }}
            
            /* 开始按钮：稍微强调 */
            QPushButton#BtnStart {{
                color: #000000;
                border: 1px solid #BBBBBB;
                font-weight: 600;
            }}

            /* 【修改】连接按钮样式 */
            QPushButton#BtnConnect {{
                background-color: #F9F9F9;
                color: #555555;
                border: 1px dashed #CCCCCC; 
                margin-top: 4px;
            }}
            QPushButton#BtnConnect:hover {{
                background-color: #FFFFFF;
                border-style: solid;
                color: #333333;
            }}
            
            /* 输入框 */
            QInputDialog {{ background-color: #FFFFFF; color: #333333; }}
        """)

    def show_placeholder(self, text):
        self.step_list_widget.clear()
        self.active_placeholder_text = text
        item = QListWidgetItem(text)
        item.setFlags(item.flags() & ~Qt.ItemIsEnabled & ~Qt.ItemIsSelectable)
        item.setTextAlignment(Qt.AlignCenter)
        font = item.font()
        font.setPointSize(9)
        item.setFont(font)
        item.setForeground(QColor("#999999"))
        self.step_list_widget.addItem(item)
        self.is_placeholder_shown = True

    def hide_placeholder_if_shown(self):
        if self.is_placeholder_shown and self.step_list_widget.count() > 0:
            self.step_list_widget.takeItem(0)
            self.is_placeholder_shown = False

    def start_recording(self):
        if self.listener and self.listener.is_alive():
            return

        self.is_editing = False
        self.steps = []
        self.lbl_status.setText("● 正在录制")
        self.lbl_status.setStyleSheet("QLabel#StatusLabel { color: #FF3B30; }") 
        self.show_placeholder("...")
        
        self.last_action_time = time.time()
        
        self.recorder = MouseClickRecorder()
        self.recorder.click_recorded.connect(self.add_click_step)
        self.recorder.set_ignore_rect(self.geometry())
        
        self.listener = mouse.Listener(on_click=self.recorder.on_click)
        self.listener.start()
        self.recorder.start()

        self.btn_start.setEnabled(False)
        self.btn_stop.setEnabled(True)
        self.btn_add_text.setEnabled(False)
        self.btn_clear.setEnabled(False)
        
        self.step_list_widget.setStyleSheet("""
            QListWidget {
                background-color: #FFFDFD;
                border: 1px solid #FFCCCC;
                border-radius: 6px;
            }
        """)

    @Slot(float, float)
    def add_click_step(self, x, y):
        self.hide_placeholder_if_shown()
        interval = time.time() - self.last_action_time
        step_data = {
            'type': 'click', 'x': round(x, 4), 'y': round(y, 4), 'time_interval': round(interval, 2)
        }
        self.steps.append(step_data)
        self.refresh_step_list()
        self.last_action_time = time.time()
        self.step_list_widget.scrollToBottom()

    @Slot()
    def add_text_to_step(self):
        if not self.is_editing:
            return

        selected_items = self.step_list_widget.selectedItems()
        if not selected_items:
            self.lbl_status.setText("请先选择一行")
            return
        
        current_row = self.step_list_widget.row(selected_items[0])
        if current_row >= len(self.steps): return
              
        step_data = self.steps[current_row]
        existing_text = step_data.get('text', '')
        
        # 使用自定义对话框实现中文按钮
        from PySide6.QtWidgets import QDialog, QLabel, QLineEdit, QPushButton, QVBoxLayout, QHBoxLayout
        
        dialog = QDialog(self)
        dialog.setWindowTitle("添加备注")
        dialog.setFixedSize(300, 150)
        
        # 设置对话框为浅色主题，不随系统变化
        dialog.setStyleSheet("""
            QDialog {
                background-color: #F5F5F5;
            }
            QLabel {
                color: #333333;
            }
            QLineEdit {
                background-color: #FFFFFF;
                border: 1px solid #DDDDDD;
                border-radius: 4px;
                padding: 6px;
                color: #333333;
            }
            QLineEdit::placeholder {
                color: #AAAAAA;
            }
            QPushButton {
                background-color: #FFFFFF;
                border: 1px solid #DDDDDD;
                border-radius: 4px;
                padding: 6px 16px;
                color: #333333;
            }
            QPushButton:hover {
                background-color: #F0F0F0;
            }
        """)
        
        # 主布局
        main_layout = QVBoxLayout(dialog)
        main_layout.setSpacing(12)
        main_layout.setContentsMargins(16, 16, 16, 12)
        
        # 标签
        label = QLabel("输入文本内容:")
        main_layout.addWidget(label)
        
        # 输入框
        line_edit = QLineEdit()
        line_edit.setText(existing_text)
        line_edit.setPlaceholderText("仅限字母和数字")
        main_layout.addWidget(line_edit)
        
        # 按钮布局
        button_layout = QHBoxLayout()
        button_layout.setSpacing(8)
        button_layout.addStretch()
        
        # 取消按钮
        cancel_btn = QPushButton("取消")
        cancel_btn.clicked.connect(dialog.reject)
        button_layout.addWidget(cancel_btn)
        
        # 确定按钮
        ok_btn = QPushButton("确定")
        ok_btn.clicked.connect(dialog.accept)
        button_layout.addWidget(ok_btn)
        
        main_layout.addLayout(button_layout)
        
        # 执行对话框
        if dialog.exec() == QDialog.Accepted:
            text = line_edit.text()
            if text:
                step_data['text'] = text
            elif 'text' in step_data:
                del step_data['text']
            
            self.refresh_step_list()
            self.save_steps_to_json()
            self.step_list_widget.setCurrentRow(current_row)
            self.lbl_status.setText("已保存")

    def stop_recording(self):
        # 无论监听器状态如何，都执行停止录制逻辑
        if self.listener and self.listener.is_alive():
            self.listener.stop()
        self.listener = None
        if self.recorder:
            self.recorder.stop()
            self.recorder = None

        self.save_steps_to_json()
        
        # 恢复样式
        self.step_list_widget.setStyleSheet("""
            QListWidget {
                background-color: #FFFFFF;
                border: 1px solid #E5E5E5;
                border-radius: 6px;
            }
        """)
        
        self.lbl_status.setText(f"完成 ({len(self.steps)} 步)")
        self.lbl_status.setStyleSheet("QLabel#StatusLabel { color: #888888; }")
        
        # 确保更新状态和按钮可用性
        self.is_editing = True
        self.btn_start.setEnabled(True)
        self.btn_stop.setEnabled(False)
        self.btn_add_text.setEnabled(True)
        self.btn_clear.setEnabled(True)
        
        if len(self.steps) == 0:
            self.show_placeholder("无数据")

    def refresh_step_list(self):
        self.step_list_widget.clear()
        self.is_placeholder_shown = False

        if not self.steps:
            if self.active_placeholder_text:
                self.show_placeholder(self.active_placeholder_text)
            return

        for i, step in enumerate(self.steps, 1):
            coord_text = f"{i:02d} . 点击 ({step['x']}, {step['y']})"
            
            item = QListWidgetItem()
            if step.get('text'):
                item.setText(f"{coord_text}\n   └── {step['text']}")
            else:
                item.setText(coord_text)
                
            self.step_list_widget.addItem(item)

    def save_steps_to_json(self):
        json_data = {"metadata": {"total_steps": len(self.steps)}, "steps": self.steps}
        try:
            with open(self.json_filepath, "w", encoding="utf-8") as f:
                json.dump(json_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存失败: {e}")

    # 运行自动化脚本函数
    def launch_wifi_script(self):
        try:
            # 直接调用 replay_steps 函数，传入 JSON 文件路径
            replay_steps(self.json_filepath)
            # 状态栏留白
            self.lbl_status.setText("")
        except Exception as e:
            print(f"运行自动化脚本失败: {e}")
            self.lbl_status.setText(f"错误: {str(e)}")

    def clear_data(self):
        self.steps = []
        self.save_steps_to_json()
        self.is_editing = False
        self.btn_add_text.setEnabled(False)
        self.show_placeholder("等待录制...")
        self.refresh_step_list()
        self.lbl_status.setText("已清空")

    def moveEvent(self, event):
        if self.recorder:
            self.recorder.set_ignore_rect(self.geometry())
        super().moveEvent(event)

    def closeEvent(self, event):
        if self.listener and self.listener.is_alive():
            self.stop_recording()
        event.accept()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    os.environ["QT_AUTO_SCREEN_SCALE_FACTOR"] = "1"
    window = ClickToolWindow()
    window.show()
    sys.exit(app.exec())