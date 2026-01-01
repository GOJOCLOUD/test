#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Word文档美化助手核心功能测试脚本
"""

import sys
import os
import json

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from beautifier import beautify_document
from config.default import load_config

def test_core_functionality():
    """测试核心功能"""
    print("开始测试Word文档美化助手核心功能...")
    
    # 1. 测试配置文件加载
    print("1. 测试配置文件加载...")
    try:
        config = load_config()
        print("   ✅ 配置文件加载成功")
    except Exception as e:
        print(f"   ❌ 配置文件加载失败: {e}")
        return False
    
    # 2. 测试文档美化功能
    print("2. 测试文档美化功能...")
    input_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "input", "demo.docx")
    
    if not os.path.exists(input_file):
        print(f"   ❌ 输入文件不存在: {input_file}")
        return False
    
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "output")
    output_file = os.path.join(output_dir, "Test_Beautified_demo.docx")
    
    try:
        beautify_document(input_file, output_file, config)
        print("   ✅ 文档美化功能测试通过")
    except Exception as e:
        print(f"   ❌ 文档美化功能测试失败: {e}")
        return False
    
    # 3. 验证输出文件
    print("3. 验证输出文件...")
    if os.path.exists(output_file):
        print("   ✅ 输出文件生成成功")
        # 清理测试文件
        os.remove(output_file)
        print("   ✅ 测试文件清理完成")
    else:
        print("   ❌ 输出文件未生成")
        return False
    
    print("\n🎉 所有核心功能测试通过!")
    return True

if __name__ == "__main__":
    success = test_core_functionality()
    sys.exit(0 if success else 1)