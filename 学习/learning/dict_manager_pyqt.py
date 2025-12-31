import os
import json
import sys
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
                             QLabel, QLineEdit, QPushButton, QListWidget, QListWidgetItem, QMessageBox, 
                             QSplitter, QGroupBox, QFileDialog)
from PyQt5.QtCore import Qt
from pathlib import Path

# 字典文件路径
DICT_FILE = "app_aliases.json"

def load_dict():
    """从文件加载字典"""
    if os.path.exists(DICT_FILE):
        try:
            with open(DICT_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_dict(alias_dict):
    """保存字典到文件"""
    try:
        with open(DICT_FILE, 'w', encoding='utf-8') as f:
            json.dump(alias_dict, f, ensure_ascii=False, indent=2)
        return True
    except:
        return False

def get_installed_apps():
    """获取本机已安装的应用程序列表"""
    app_paths = []
    
    # 根据操作系统确定搜索路径
    if os.name == 'posix':  # macOS 和 Linux
        search_paths = [
            "/Applications",
            "/System/Applications",
            os.path.expanduser("~/Applications")
        ]
    elif os.name == 'nt':  # Windows
        # Windows 应用程序路径
        import winreg
        search_paths = []
        try:
            # 从注册表获取程序路径
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths")
            for i in range(1024):
                try:
                    subkey_name = winreg.EnumKey(key, i)
                    subkey = winreg.OpenKey(key, subkey_name)
                    path = winreg.QueryValueEx(subkey, None)[0]
                    if path and os.path.exists(path):
                        search_paths.append(os.path.dirname(path))
                    winreg.CloseKey(subkey)
                except:
                    break
            winreg.CloseKey(key)
        except:
            pass
        
        # 添加常见程序目录
        program_files = os.environ.get("ProgramFiles", "C:\\Program Files")
        program_files_x86 = os.environ.get("ProgramFiles(x86)", "C:\\Program Files (x86)")
        search_paths.extend([program_files, program_files_x86])
    else:
        search_paths = []
    
    # 搜索应用程序
    for base_path in search_paths:
        if os.path.exists(base_path):
            try:
                for item in os.listdir(base_path):
                    item_path = os.path.join(base_path, item)
                    if os.name == 'posix' and item.endswith(".app"):
                        app_paths.append(item_path)
                    elif os.name == 'nt' and (item.endswith('.exe') or os.path.isdir(item_path)):
                        app_paths.append(item_path)
                    elif os.path.isdir(item_path) and not item.startswith("."):
                        # 递归查找子目录中的应用程序
                        try:
                            for sub_item in os.listdir(item_path):
                                sub_item_path = os.path.join(item_path, sub_item)
                                if (os.name == 'posix' and sub_item.endswith(".app")) or \
                                   (os.name == 'nt' and sub_item.endswith('.exe')):
                                    app_paths.append(sub_item_path)
                        except:
                            continue
            except:
                continue
    
    return app_paths

class DictManagerApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.alias_dict = load_dict()
        self.initUI()
        
    def initUI(self):
        self.setWindowTitle('软件字典管理')
        self.setGeometry(100, 100, 900, 600)
        
        # 创建中央窗口部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 创建主布局
        main_layout = QHBoxLayout(central_widget)
        
        # 创建分割器
        splitter = QSplitter(Qt.Horizontal)
        main_layout.addWidget(splitter)
        
        # 左侧面板 - 软件别名管理
        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)
        
        # 输入区域
        input_group = QGroupBox("软件信息")
        input_layout = QVBoxLayout()
        
        # 别名输入
        alias_layout = QHBoxLayout()
        alias_layout.addWidget(QLabel("软件别名:"))
        self.alias_entry = QLineEdit()
        alias_layout.addWidget(self.alias_entry)
        input_layout.addLayout(alias_layout)
        
        # 软件路径输入
        path_layout = QHBoxLayout()
        path_layout.addWidget(QLabel("软件路径:"))
        self.path_entry = QLineEdit()
        path_layout.addWidget(self.path_entry)
        self.select_button = QPushButton("选择应用程序")
        self.select_button.clicked.connect(self.select_app)
        path_layout.addWidget(self.select_button)
        input_layout.addLayout(path_layout)
        
        input_group.setLayout(input_layout)
        left_layout.addWidget(input_group)
        
        # 按钮区域
        button_layout = QHBoxLayout()
        self.update_button = QPushButton("更新")
        self.update_button.clicked.connect(self.update_entry)
        self.delete_button = QPushButton("删除")
        self.delete_button.clicked.connect(self.delete_entry)
        self.refresh_button = QPushButton("刷新列表")
        self.refresh_button.clicked.connect(self.refresh_alias_list)
        
        button_layout.addWidget(self.update_button)
        button_layout.addWidget(self.delete_button)
        button_layout.addWidget(self.refresh_button)
        left_layout.addLayout(button_layout)
        
        # 别名列表
        alias_group = QGroupBox("当前字典内容")
        alias_layout = QVBoxLayout()
        self.alias_list = QListWidget()
        alias_layout.addWidget(self.alias_list)
        alias_group.setLayout(alias_layout)
        left_layout.addWidget(alias_group)
        
        # 右侧面板 - 本机应用程序列表
        right_panel = QWidget()
        right_layout = QVBoxLayout(right_panel)
        
        app_group = QGroupBox("本机已安装应用程序")
        app_layout = QVBoxLayout()
        self.app_list = QListWidget()
        app_layout.addWidget(self.app_list)
        app_group.setLayout(app_layout)
        right_layout.addWidget(app_group)
        
        # 添加面板到分割器
        splitter.addWidget(left_panel)
        splitter.addWidget(right_panel)
        splitter.setSizes([450, 450])
        
        # 初始化列表
        self.refresh_alias_list()
        self.refresh_app_list()
        
        # 绑定双击事件
        self.app_list.itemDoubleClicked.connect(self.on_app_double_click)
        self.alias_list.itemDoubleClicked.connect(self.on_alias_double_click)
    
    def refresh_alias_list(self):
        """刷新别名列表"""
        self.alias_list.clear()
        for alias, path in self.alias_dict.items():
            self.alias_list.addItem(f"{alias} -> {path}")
    
    def refresh_app_list(self):
        """刷新应用程序列表"""
        self.app_list.clear()
        apps = get_installed_apps()
        for app in apps:
            # 只显示应用程序名称，不显示完整路径
            app_name = os.path.basename(app)
            item = QListWidgetItem(app_name)
            item.setData(Qt.UserRole, app)  # 存储完整路径
            self.app_list.addItem(item)
    
    def on_app_double_click(self, item):
        """双击应用程序列表项时，将其路径填入路径输入框"""
        app_path = item.data(Qt.UserRole)
        if app_path:
            self.path_entry.setText(app_path)
    
    def on_alias_double_click(self, item):
        """双击别名列表项时，将其信息填入输入框"""
        text = item.text()
        if " -> " in text:
            alias, path = text.split(" -> ", 1)
            self.alias_entry.setText(alias)
            self.path_entry.setText(path)
    
    def select_app(self):
        """选择应用程序"""
        if os.name == 'posix':  # macOS
            initial_dir = "/Applications"
        else:  # Windows
            initial_dir = "C:\\"
        
        file_path, _ = QFileDialog.getOpenFileName(self, "选择应用程序", initial_dir)
        
        if file_path:
            self.path_entry.setText(file_path)
    
    def update_entry(self):
        """更新字典条目"""
        alias = self.alias_entry.text().strip()
        path = self.path_entry.text().strip()
        
        if not alias or not path:
            QMessageBox.warning(self, "错误", "请输入软件别名和软件路径!")
            return
        
        # 更新字典
        self.alias_dict[alias] = path
        
        # 保存字典
        if save_dict(self.alias_dict):
            # 刷新列表
            self.refresh_alias_list()
            # 清空输入框
            self.alias_entry.clear()
            self.path_entry.clear()
            QMessageBox.information(self, "成功", "字典条目已成功添加/更新!")
        else:
            QMessageBox.critical(self, "错误", "保存字典失败，请检查文件权限!")
    
    def delete_entry(self):
        """删除选中的字典条目"""
        current_item = self.alias_list.currentItem()
        if not current_item:
            QMessageBox.warning(self, "警告", "请先选择要删除的条目!")
            return
        
        text = current_item.text()
        if " -> " in text:
            alias = text.split(" -> ", 1)[0]
            
            # 确认删除
            reply = QMessageBox.question(self, "确认删除", 
                                        f"确定要删除别名 '{alias}' 吗?",
                                        QMessageBox.Yes | QMessageBox.No)
            
            if reply == QMessageBox.Yes:
                # 从字典中删除
                if alias in self.alias_dict:
                    del self.alias_dict[alias]
                    
                    # 保存字典
                    if save_dict(self.alias_dict):
                        # 刷新列表
                        self.refresh_alias_list()
                        # 清空输入框
                        self.alias_entry.clear()
                        self.path_entry.clear()
                        QMessageBox.information(self, "成功", "字典条目已成功删除!")
                    else:
                        QMessageBox.critical(self, "错误", "保存字典失败，请检查文件权限!")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = DictManagerApp()
    window.show()
    sys.exit(app.exec_())