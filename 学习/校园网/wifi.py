#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pyautogui
import time
import json
import os

# 快速回放模式下，每个步骤之间的固定延时（秒）
# 这个延时确保目标程序有时间响应操作
FAST_PLAYBACK_DELAY = 0.2

# 输入每个字符的延迟，模拟真实打字速度
INPUT_INTERVAL = 0.05 

def replay_steps(json_path):
    """
    读取指定的 JSON 文件并以最快速度回放其中记录的所有步骤。
    
    参数:
        json_path: str - JSON 文件的路径
    """
    print("="*20)
    print("  自动化脚本回放程序 (快速模式)")
    print("="*20)

    # 1. 检查并读取JSON文件
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        steps = data.get('steps', [])
        if not steps:
            print(f"❌ 文件 '{json_path}' 中没有找到可执行的步骤。")
            print("请先使用录制工具录制脚本。")
            return
    except FileNotFoundError:
        print(f"❌ 脚本文件 '{json_path}' 不存在。")
        print("请先使用录制工具生成脚本。")
        return
    except json.JSONDecodeError:
        print(f"❌ 脚本文件 '{json_path}' 格式错误，无法解析。")
        return
    except Exception as e:
        print(f"❌ 读取脚本文件时发生未知错误: {e}")
        return

    # 2. 准备开始回放
    total_steps = len(steps)
    print(f"▶️  准备回放，共 {total_steps} 个步骤。")
    # 3. 遍历并执行每一步
    for i, step in enumerate(steps, 1):
        step_type = step.get('type')
        
        print(f"\n[步骤 {i}/{total_steps}]")

        try:
            if step_type == 'click':
                x, y = step['x'], step['y']
                print(f"  -> 执行点击: 坐标 ({x}, {y})")
                pyautogui.click(x, y)
                
                # 检查同一步骤中是否有关联的文本输入
                if 'text' in step and step['text']:
                    text = step['text']
                    # 在点击和输入之间增加一个短暂的延时，确保UI已准备好接收输入
                    print(f"  -> 等待 {FAST_PLAYBACK_DELAY} 秒后执行输入...")
                    time.sleep(FAST_PLAYBACK_DELAY)
                    print(f"  -> 执行输入: \"{text}\"")
                    pyautogui.write(text, interval=INPUT_INTERVAL)
            
            else:
                print(f"  -> 跳过未知步骤类型: {step_type}")

        except KeyError as e:
            print(f"  ❌ 步骤 {i} 数据不完整，缺少关键字段: {e}，跳过此步骤。")
        except Exception as e:
            print(f"  ❌ 执行步骤 {i} 时发生错误: {e}，终止执行。")
            break
    
    print("\n" + "="*20)
    print("  🎉 所有步骤执行完毕！")
    print("="*20)


def main(json_path=None):
    """主函数，调用回放功能"""
    if json_path is None:
        # 如果没有提供路径，从 launcher 模块导入 get_data_path 函数
        from launcher import get_data_path
        json_path = get_data_path()
    replay_steps(json_path)


if __name__ == "__main__":
    import sys
    # 支持命令行参数，如果提供了路径则使用，否则使用默认路径
    json_path = sys.argv[1] if len(sys.argv) > 1 else None
    main(json_path)
