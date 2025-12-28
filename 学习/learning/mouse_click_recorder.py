#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from pynput import mouse
import pyautogui
import sys

class MouseClickRecorder:
    def __init__(self):
        # 记录点击次数和坐标
        self.clicks = []
        # 获取屏幕尺寸
        self.screen_width, self.screen_height = pyautogui.size()
        print(f"屏幕尺寸: {self.screen_width}x{self.screen_height}")
        print(f"当前鼠标位置: {pyautogui.position()}")
    
    def on_click(self, x, y, button, pressed):
        """鼠标点击事件回调函数"""
        if pressed:
            # 记录点击次数和坐标
            click_num = len(self.clicks) + 1
            pos = (x, y)
            self.clicks.append((click_num, pos))
            
            # 计算相对位置百分比
            rel_x = round((x / self.screen_width) * 100, 2)
            rel_y = round((y / self.screen_height) * 100, 2)
            
            # 输出点击信息
            print(f"第 {click_num} 次点击:")
            print(f"  屏幕坐标: X={x}, Y={y}")
            print(f"  相对位置: X={rel_x}%, Y={rel_y}%")
            print(f"  坐标: {pos}")
            print(f"  点击按钮: {button}")
            print("=" * 30)
    
    def run(self):
        print("\n=== 鼠标点击记录器 ===")
        print("开始记录整个屏幕的鼠标点击事件...")
        print("按 Ctrl+C 退出程序")
        print("=" * 30)
        
        try:
            # 创建鼠标监听器
            listener = mouse.Listener(on_click=self.on_click)
            
            # 启动监听器
            listener.start()
            
            # 等待用户中断
            listener.join()
            
        except KeyboardInterrupt:
            print("\n=== 程序结束 ===")
            self.save_clicks()
            sys.exit()
        except Exception as e:
            print(f"\n=== 程序异常结束 ===")
            print(f"错误信息: {e}")
            self.save_clicks()
            sys.exit()
    
    def save_clicks(self, filename="mouse_clicks.txt"):
        """保存点击记录到文件"""
        with open(filename, "w") as f:
            f.write("鼠标点击记录\n")
            f.write(f"屏幕尺寸: {self.screen_width}x{self.screen_height}\n")
            f.write("=" * 30 + "\n")
            for click_num, pos in self.clicks:
                # 计算相对位置百分比
                rel_x = round((pos[0] / self.screen_width) * 100, 2)
                rel_y = round((pos[1] / self.screen_height) * 100, 2)
                f.write(f"第 {click_num} 次点击: X={pos[0]}, Y={pos[1]} (相对位置: X={rel_x}%, Y={rel_y}%)\n")
        print(f"点击记录已保存到 {filename}")
        print(f"共记录了 {len(self.clicks)} 次点击")

def main():
    recorder = MouseClickRecorder()
    recorder.run()

if __name__ == "__main__":
    main()
