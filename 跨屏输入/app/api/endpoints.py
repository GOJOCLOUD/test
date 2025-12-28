from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.core.manager import manager
from app.utils.system import send_cross_device_notification


router = APIRouter()
templates = Jinja2Templates(directory="templates")


class MessageRequest(BaseModel):
    """
    消息请求模型
    用于验证接收到的 HTTP POST 请求体
    """
    message: str = Field(..., min_length=1, max_length=1000, description="要发送的消息内容")
    mode: Optional[str] = Field("both", description="通知模式: 'web', 'system', 或 'both'")


@router.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    """
    获取主页 HTML 页面
    
    Args:
        request: FastAPI Request 对象
    
    Returns:
        HTMLResponse: 渲染后的 HTML 页面
    """
    return templates.TemplateResponse("index.html", {"request": request})


@router.post("/api/message")
async def receive_message(request: MessageRequest):
    """
    接收来自手机的 HTTP POST 消息
    
    Args:
        request: 包含消息内容和模式的请求体
    
    Returns:
        dict: 操作结果响应
    """
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] 收到消息: {request.message}")
    print(f"[{timestamp}] 通知模式: {request.mode}")
    
    mode = request.mode.lower()
    web_sent = False
    system_sent = False
    
    if mode in ["web", "both"]:
        await manager.broadcast(request.message)
        web_sent = True
        print(f"[{timestamp}] 消息已广播到 WebSocket 客户端")
    
    if mode in ["system", "both"]:
        system_sent = send_cross_device_notification(request.message)
        print(f"[{timestamp}] 系统通知发送{'成功' if system_sent else '失败'}")
    
    return {
        "status": "success",
        "message": request.message,
        "timestamp": timestamp,
        "web_sent": web_sent,
        "system_sent": system_sent,
        "active_connections": manager.get_connection_count()
    }


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket 端点
    处理客户端的 WebSocket 连接，支持实时消息推送
    
    Args:
        websocket: WebSocket 连接对象
    """
    await manager.connect(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 收到 WebSocket 客户端消息: {data}")
            
            await manager.send_personal_message(
                f"服务器已收到您的消息: {data}",
                websocket
            )
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] WebSocket 连接异常: {e}")
        manager.disconnect(websocket)


@router.get("/api/status")
async def get_status():
    """
    获取服务状态信息
    
    Returns:
        dict: 当前服务状态，包括活跃连接数等
    """
    return {
        "status": "running",
        "active_connections": manager.get_connection_count(),
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }


@router.post("/api/test-notification")
async def test_notification():
    """
    测试系统通知功能
    
    Returns:
        dict: 测试结果
    """
    from app.utils.system import test_notification
    success = test_notification()
    
    return {
        "status": "success" if success else "failed",
        "message": "测试通知已发送" if success else "测试通知发送失败",
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
