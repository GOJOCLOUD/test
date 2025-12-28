#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

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
    # 获取用户主目录
    home_dir = os.path.expanduser("~")
    # 创建应用支持目录
    app_support_dir = os.path.join(home_dir, "Library", "Application Support", "CampusWiFiTool")
    # 确保目录存在
    if not os.path.exists(app_support_dir):
        os.makedirs(app_support_dir)
    # 返回完整的 JSON 文件路径
    return os.path.join(app_support_dir, "mouse_clicks.json")
