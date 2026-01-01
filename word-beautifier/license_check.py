# license_check.py - 授权验证（读取 license.key）# license_check.py - 简单授权验证（后期可改为 HMAC）
import os

def verify_license(path):
    if not os.path.exists(path):
        return False
    with open(path, "r", encoding="utf-8") as f:
        key = f.read().strip()
    # 简单验证：固定字符串
    return key == "WORD-BEAUTIFIER-AUTHORIZED"
