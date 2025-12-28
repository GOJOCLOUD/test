from pydantic import BaseModel, Field
from typing import Optional

#1.定义模型
class AITask(BaseModel):
    # 强制要求是int，如果是字符串"1"，会自动转化成1
    task_id: int
    # 强制要求是字符串，Field 用于添加额外的元数据（这对 AI 识别非常有用）
    name: str = Field(description="任务名称")
    # 可选字段，带默认值
    priority: int = Field(default=1, ge=1, le=5, description="任务优先级，1-5")
    # 可选字段，默认为 None
    model_name: Optional[str] = None


# 实战

# 情况A
data = {
    "task_id": "101",  # 会自动转化成101
    "name": "生成代码段",
    "priority": 3,
}

task = AITask(**data)
print(f"解析成功：{task.name}, ID类型: {type(task.task_id)}")

# 情况B: 数据不合法（比如优先级超标）
try:
    invalid_data = {"task_id": 102, "name": "测试", "priority": 10}  # 10 超过了 le=5 的限制
    AITask(**invalid_data)
except Exception as e:
    print(f"数据验证失败：\n{e}")

# 情况C：V2 核心方法
print(f"\n转为字典: {task.model_dump()}")
print(f"转为JSON ：{task.model_dump_json()}")
    