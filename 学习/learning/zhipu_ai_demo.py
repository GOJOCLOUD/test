import base64
from PIL import Image, ImageDraw, ImageFont
import pytesseract
from langchain_community.chat_models import ChatZhipuAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.memory import ConversationBufferMemory

# 初始化模型
llm = ChatZhipuAI(
    model="glm-4.6",
    temperature=0,
    api_key="c8b50bb7e7d342edb66b293636342059.VpGbzEj6uamxt01l"
)

# 创建记忆
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

# 创建聊天提示
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是紫涵，一个擅长一步步引导完成任务的助手"),
    ("user", "{question}")
])

# 创建链式操作
chain = prompt | llm | StrOutputParser()

def text_to_image(text, img_path="response_image.png"):
    """将文字转化为图片并保存"""
    # 创建图像对象
    width, height = 800, 200  # 图像尺寸
    image = Image.new('RGB', (width, height), color=(255, 255, 255))
    
    # 创建绘制对象
    draw = ImageDraw.Draw(image)
    
    # 尝试加载更好的字体，如果失败则使用默认字体
    try:
        # macOS中文字体路径
        font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 20)
    except:
        try:
            # 备选字体路径
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 20)
        except:
            font = ImageFont.load_default()  # 默认字体
    
    # 处理长文本换行
    lines = []
    if len(text) > 50:  # 如果文本过长，进行换行处理
        words = text.split(' ')
        current_line = ""
        for word in words:
            if len(current_line + word) < 50:
                current_line += word + " "
            else:
                lines.append(current_line)
                current_line = word + " "
        lines.append(current_line)
    else:
        lines = [text]
    
    # 绘制文本
    y_position = 20
    for line in lines:
        draw.text((20, y_position), line, fill="black", font=font)
        y_position += 30
    
    # 保存图片
    image.save(img_path)
    
    # 返回图像文件路径
    return img_path

def save_image_to_memory(img_path):
    """将图片转为Base64编码并保存到记忆"""
    with open(img_path, "rb") as img_file:
        img_base64 = base64.b64encode(img_file.read()).decode("utf-8")
    return img_base64

def ocr_from_image(img_path):
    """从图片中提取文本"""
    img = Image.open(img_path)
    # 设置Tesseract参数，提高中文识别率
    custom_config = r'--oem 3 --psm 6 -l chi_sim+eng'
    ocr_text = pytesseract.image_to_string(img, config=custom_config)
    return ocr_text

# 模拟问答过程
question = "请解释一下机器学习的基本概念"

# 1. 模型回答
result = chain.invoke({
    "question": question
})

# 2. 将模型的回答转化为图片并保存
image_path = "response_image.png"
text_to_image(result, img_path=image_path)

# 3. 将图片保存到记忆（Base64编码）
image_base64 = save_image_to_memory(image_path)

# 4. 将对话内容和图像保存到记忆
memory.save_context({"input": question}, {"output": result, "image": image_base64})

# 5. 模拟下次提问，先提取图像中的文字并与记忆结合
ocr_text = ocr_from_image(image_path)
print("从图片中提取的文本:", ocr_text)

# 提问时参考图片和历史记忆
memory_variables = memory.load_memory_variables({})
print("记忆内容:", memory_variables)