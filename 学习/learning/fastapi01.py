from fastapi import FastAPI
from threading import Thread
import time
import uuid

app = FastAPI()

# ========= 状态仓库（先用内存） =========
tasks = {}
# tasks = {
#   task_id: {"status": "pending/running/done", "progress": int}
# }

# ========= 真正干活的函数 =========
def do_work(task_id: str):
    tasks[task_id]["status"] = "running"

    for i in range(5):
        time.sleep(1)          # 模拟慢活
        tasks[task_id]["progress"] += 20

    tasks[task_id]["status"] = "done"

# ========= 启动接口（你熟悉的 get） =========
@app.get("/run")
def run():
    task_id = uuid.uuid4().hex

    # 初始化状态
    tasks[task_id] = {
        "status": "pending",
        "progress": 0
    }

    # 丢到后台线程跑
    Thread(target=do_work, args=(task_id,)).start()

    return {
        "task_id": task_id,
        "msg": "task accepted"
    }

# ========= 查状态接口 =========
@app.get("/status/{task_id}")
def status(task_id: str):
    task = tasks.get(task_id)
    if not task:
        return {"error": "task not found"}

    return {
        "task_id": task_id,
        **task
    }
