#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pyautogui
import time

# 硬编码的凭证信息（请勿泄露）
USERNAME = "2407380101"
PASSWORD = "Mjf2004092812"

# 精确点击坐标
USERNAME_INPUT_POS = (1196.66796875, 357.73828125)  # 用户名输入框坐标
PASSWORD_INPUT_POS = (1176.25, 405.890625)          # 密码输入框坐标
LOGIN_BUTTON_POS = (1275.58203125, 525.76171875)   # 登录按钮坐标

# 操作参数
OPERATION_DELAY = 0.3  # 操作间隔时间（秒）
LOGIN_DELAY = 1.0      # 登录前延迟时间（秒）
INPUT_INTERVAL = 0.005  # 加快输入速度，5ms/字符

def orange():
    """校园网自动连接程序主函数"""
    print("=== 校园网自动连接程序 ===")
    print("请确保已打开校园网登录页面并在前台显示...")
    time.sleep(1)
    
    # --------------------------
    # 用户名输入流程：点击 → 输入
    # --------------------------
    print("\n[步骤1] 点击用户名输入框")
    pyautogui.click(USERNAME_INPUT_POS)
    time.sleep(OPERATION_DELAY)
    
    print(f"[步骤2] 输入用户名: {USERNAME}")
    pyautogui.write(USERNAME, interval=INPUT_INTERVAL)
    time.sleep(OPERATION_DELAY)
    
    # --------------------------
    # 密码输入流程：点击 → 输入
    # --------------------------
    print("\n[步骤3] 点击密码输入框")
    pyautogui.click(PASSWORD_INPUT_POS)
    time.sleep(OPERATION_DELAY)
    
    print("[步骤4] 逐字符输入密码:")
    print("  输入过程: ", end="", flush=True)
    
    for char in PASSWORD:
        if char.isupper():
            pyautogui.hotkey('shift', char.lower())
        else:
            pyautogui.press(char)
        print(char, end="", flush=True)
        time.sleep(INPUT_INTERVAL)
    
    print()  # 换行
    time.sleep(OPERATION_DELAY)
    
    # --------------------------
    # 自动点击登录按钮
    # --------------------------
    print("\n[步骤5] 等待登录...")
    print(f"等待 {LOGIN_DELAY} 秒后自动点击登录按钮")
    time.sleep(LOGIN_DELAY)
    
    print(f"[步骤6] 点击登录按钮: {LOGIN_BUTTON_POS}")
    pyautogui.click(LOGIN_BUTTON_POS)
    time.sleep(OPERATION_DELAY)
    
    # --------------------------
    # 新增点击操作
    # --------------------------
    print("\n[步骤7] 等待1秒后执行额外点击")
    time.sleep(1.0)
    
    new_click_pos = (523.31640625, 139.1640625)
    print(f"[步骤8] 点击坐标: {new_click_pos}")
    pyautogui.click(new_click_pos)
    time.sleep(OPERATION_DELAY)
    
    # 操作完成
    print("\n=== 操作完成！ ===")
    print("校园网凭证已自动填写并点击登录按钮，额外点击操作已执行。")

def main():
    """主函数，调用orange函数"""
    orange()


if __name__ == "__main__":
    main()
