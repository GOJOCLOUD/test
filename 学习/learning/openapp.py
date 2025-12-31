import os
import re
import json
import subprocess
from pathlib import Path

# 字典文件路径 - 存储在当前目录下的app_aliases.json文件中
DICT_FILE = "app_aliases.json"
# 完整路径: /Users/wutiaoyun/Desktop/学习/app_aliases.json

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

def get_all_apps():
    """获取Mac上所有应用程序的路径"""
    app_paths = []
    
    # 搜索路径
    search_paths = [
        "/Applications",
        "/System/Applications",
        os.path.expanduser("~/Applications")
    ]
    
    for base_path in search_paths:
        if os.path.exists(base_path):
            for item in os.listdir(base_path):
                item_path = os.path.join(base_path, item)
                if item.endswith(".app"):
                    app_paths.append(item_path)
                elif os.path.isdir(item_path) and not item.startswith("."):
                    # 递归查找子目录中的app
                    for sub_item in os.listdir(item_path):
                        if sub_item.endswith(".app"):
                            app_paths.append(os.path.join(item_path, sub_item))
    
    return app_paths

def lowercase_english_in_path(path):
    """
    只将路径中的英文部分转换为小写，中文部分保持不变
    
    Args:
        path (str): 原始路径
        
    Returns:
        str: 处理后的路径
    """
    def lower_match(match):
        return match.group(0).lower()
    
    # 使用正则表达式匹配英文字符串，只转换英文字符为小写
    result = re.sub(r'[a-zA-Z]+', lower_match, path)
    return result

def clean_app_name(app_name):
    """
    清理应用名称，去除所有符号和".app"后缀
    
    Args:
        app_name (str): 原始应用名称
        
    Returns:
        str: 清理后的应用名称
    """
    # 去除.app后缀
    if app_name.endswith('.app'):
        app_name = app_name[:-4]
    
    # 使用正则表达式去除所有符号（只保留字母、数字和中文）
    cleaned_name = re.sub(r'[^\w\u4e00-\u9fff]', '', app_name)
    
    return cleaned_name

def create_alias_dict():
    """
    创建自定义名称与实际软件名称的对应关系字典
    从文件加载用户自定义的字典
    
    Returns:
        dict: 自定义名称与实际软件名称的映射字典
    """
    # 从文件加载用户自定义字典
    user_dict = load_dict()
    
    return user_dict

def launch_dict_manager():
    """启动字典管理界面"""
    try:
        import subprocess
        import sys
        
        # 获取当前脚本所在目录
        script_dir = os.path.dirname(os.path.abspath(__file__))
        dict_manager_path = os.path.join(script_dir, "dict_manager_pyqt.py")
        
        # 检查字典管理程序是否存在
        if not os.path.exists(dict_manager_path):
            print("找不到字典管理程序: dict_manager_pyqt.py")
            return
        
        # 使用子进程启动字典管理程序
        subprocess.run([sys.executable, dict_manager_path])
        
    except Exception as e:
        print(f"启动字典管理界面时出错: {e}")

def find_and_open_app(app_name):
    """
    根据输入的软件名称查找并打开应用
    
    Args:
        app_name (str): 要查找的应用名称（可以是自定义名称）
    """
    # 获取自定义名称字典
    alias_dict = create_alias_dict()
    
    # 检查输入是否是自定义名称
    if app_name in alias_dict:
        actual_app_path = alias_dict[app_name]
        print(f"识别自定义名称: '{app_name}' -> '{actual_app_path}'")
        print(f"正在打开应用: {actual_app_path}")
        print("=" * 50)
        
        # 直接使用字典中的路径打开应用
        if os.path.exists(actual_app_path):
            subprocess.run(['open', actual_app_path])
            print("应用已打开")
            return
        else:
            print(f"错误: 路径不存在: {actual_app_path}")
            print("请使用字典管理器更新正确的应用路径")
            return
    
    # 如果不是自定义名称，则按原来的方式搜索
    # 获取所有应用路径
    all_apps = get_all_apps()
    
    # 将输入的应用名称转换为小写用于比较
    app_name_lower = app_name.lower()
    
    print(f"正在搜索应用: {app_name}")
    print("=" * 50)
    
    # 遍历所有应用路径进行匹配
    found_apps = []
    for app_path in all_apps:
        # 只保留路径的最后一部分（应用名称）
        app_name_only = os.path.basename(app_path)
        # 清理应用名称（去除符号和.app后缀）
        cleaned_app_name = clean_app_name(app_name_only)
        # 只将应用名称中的英文部分转换为小写
        app_name_only_lower = lowercase_english_in_path(cleaned_app_name).lower()
        
        # 检查输入的应用名称是否在应用名称中
        if app_name_lower in app_name_only_lower:
            found_apps.append((app_path, app_name_only, cleaned_app_name))
    
    # 如果找到匹配的应用
    if found_apps:
        if len(found_apps) == 1:
            # 只找到一个应用，直接打开
            app_path, app_name_only, cleaned_app_name = found_apps[0]
            print(f"找到应用: {cleaned_app_name}")
            print(f"完整路径: {app_path}")
            subprocess.run(['open', app_path])
            print("应用已打开")
        else:
            # 找到多个应用，让用户选择
            print("找到多个匹配的应用:")
            for i, (app_path, app_name_only, cleaned_app_name) in enumerate(found_apps, 1):
                print(f"{i}. {cleaned_app_name}")
            
            try:
                choice = input("请选择要打开的应用编号 (回车取消): ")
                if choice.isdigit() and 1 <= int(choice) <= len(found_apps):
                    selected_app_path, selected_app_name, selected_cleaned_name = found_apps[int(choice) - 1]
                    print(f"正在打开: {selected_cleaned_name}")
                    print(f"完整路径: {selected_app_path}")
                    subprocess.run(['open', selected_app_path])
                    print("应用已打开")
                else:
                    print("取消操作")
            except (ValueError, KeyboardInterrupt):
                print("取消操作")
    else:
        print("未找到匹配的应用")

def interactive_mode():
    """交互式模式，让用户输入应用名称"""
    print("=== Mac应用启动器 ===")
    print("输入应用名称来打开应用（支持自定义名称）")
    print("输入 'alias' 查看所有自定义名称映射")
    print("输入 'dict' 启动字典管理界面")
    print("输入 'quit' 或 'exit' 退出程序")
    print("=" * 50)
    
    while True:
        try:
            app_name = input("\n请输入应用名称: ").strip()
            
            if app_name.lower() in ['quit', 'exit', '退出']:
                print("程序已退出")
                break
                
            if app_name.lower() == 'alias':
                alias_dict = create_alias_dict()
                print("\n自定义名称映射:")
                print("=" * 50)
                for alias, actual_name in sorted(alias_dict.items()):
                    print(f"{alias:<15} -> {actual_name}")
                print("=" * 50)
                continue
                
            if app_name.lower() == 'dict':
                print("\n启动字典管理界面...")
                launch_dict_manager()
                continue
                
            if not app_name:
                print("请输入有效的应用名称")
                continue
                
            find_and_open_app(app_name)
            
        except KeyboardInterrupt:
            print("\n程序已退出")
            break

if __name__ == "__main__":
    # 可以直接运行交互式模式
    interactive_mode()
    
    # 或者直接调用函数打开特定应用
    # find_and_open_app("Microsoft Word")