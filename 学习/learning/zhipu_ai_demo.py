import os
import sys
from langchain_community.chat_models import ChatZhipuAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.memory import ConversationBufferMemory
import json
import re

openapp_path = os.path.join(os.path.dirname(__file__), "openapp.py")
sys.path.insert(0, os.path.dirname(openapp_path))

llm = ChatZhipuAI(
    model="glm-4.6",
    temperature=0,
    api_key="c8b50bb7e7d342edb66b293636342059.VpGbzEj6uamxt01l"
)

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

prompt = ChatPromptTemplate.from_messages([
    ("system", """你是紫涵，一个擅长一步步引导完成任务的助手。

你有一个工具可以打开Mac电脑上的应用程序。当用户想要打开某个软件时，你需要：
1. 识别用户想要打开的应用名称
2. 返回一个JSON格式的响应，格式为：{{"action": "open_app", "app_name": "应用名称"}}
3. 如果用户只是聊天或询问问题，则正常回答，不需要返回JSON

示例：
- 用户说"帮我打开微信" -> 返回 {{"action": "open_app", "app_name": "微信"}}
- 用户说"打开Safari浏览器" -> 返回 {{"action": "open_app", "app_name": "Safari"}}
- 用户说"什么是机器学习" -> 直接回答问题，不需要JSON"""),
    ("user", "{question}")
])

chain = prompt | llm | StrOutputParser()

def parse_response(response):
    """解析模型响应，判断是否需要执行操作"""
    try:
        json_match = re.search(r'\{[^{}]*"action"[^{}]*\}', response)
        if json_match:
            action_data = json.loads(json_match.group())
            if action_data.get("action") == "open_app":
                return {
                    "is_action": True,
                    "action": "open_app",
                    "app_name": action_data.get("app_name", ""),
                    "original_response": response
                }
    except:
        pass
    return {
        "is_action": False,
        "original_response": response
    }

def open_app_from_name(app_name):
    """调用openapp.py的功能打开应用"""
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("openapp", openapp_path)
        openapp_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(openapp_module)
        
        print(f"\n正在尝试打开应用: {app_name}")
        print("=" * 50)
        
        openapp_module.find_and_open_app(app_name)
        
        print("=" * 50)
        return True
    except Exception as e:
        print(f"打开应用时出错: {e}")
        return False

def chat_loop():
    """交互式对话循环"""
    print("=== 紫涵 - 智能助手 ===")
    print("我可以帮你打开Mac电脑上的应用程序")
    print("输入 'quit' 或 'exit' 退出程序")
    print("=" * 50)
    
    while True:
        try:
            user_input = input("\n你: ").strip()
            
            if user_input.lower() in ['quit', 'exit', '退出']:
                print("再见！")
                break
                
            if not user_input:
                continue
            
            print("\n紫涵: ", end="", flush=True)
            
            result = chain.invoke({
                "question": user_input
            })
            
            parsed = parse_response(result)
            
            if parsed["is_action"]:
                print(f"好的，我来帮你打开 {parsed['app_name']}...")
                success = open_app_from_name(parsed["app_name"])
                if success:
                    print(f"已尝试打开 {parsed['app_name']}")
                else:
                    print(f"抱歉，无法打开 {parsed['app_name']}")
            else:
                print(parsed["original_response"])
            
            memory.save_context({"input": user_input}, {"output": result})
            
        except KeyboardInterrupt:
            print("\n再见！")
            break
        except Exception as e:
            print(f"\n发生错误: {e}")
            continue

if __name__ == "__main__":
    chat_loop()
