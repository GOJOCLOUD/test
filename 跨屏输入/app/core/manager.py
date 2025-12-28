from typing import List, Set
from fastapi import WebSocket, WebSocketDisconnect
import asyncio
import json
from datetime import datetime


class ConnectionManager:
    """
    WebSocket 连接管理器
    负责管理所有活跃的 WebSocket 连接，实现消息广播功能
    """

    def __init__(self):
        """
        初始化连接管理器
        active_connections: 存储所有活跃的 WebSocket 连接
        """
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        """
        接受新的 WebSocket 连接
        
        Args:
            websocket: WebSocket 连接对象
        """
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 新连接已建立，当前连接数: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """
        断开 WebSocket 连接
        
        Args:
            websocket: WebSocket 连接对象
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 连接已断开，当前连接数: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        """
        向所有连接的客户端广播消息
        
        Args:
            message: 要广播的消息内容
        """
        if not self.active_connections:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 没有活跃连接，消息未广播")
            return

        disconnected_connections = set()
        
        for connection in self.active_connections:
            try:
                await connection.send_json({
                    "type": "message",
                    "content": message,
                    "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })
            except Exception as e:
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 发送消息失败: {e}")
                disconnected_connections.add(connection)

        for connection in disconnected_connections:
            self.disconnect(connection)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """
        向特定连接发送消息
        
        Args:
            message: 要发送的消息内容
            websocket: 目标 WebSocket 连接对象
        """
        try:
            await websocket.send_json({
                "type": "message",
                "content": message,
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        except Exception as e:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 发送个人消息失败: {e}")
            self.disconnect(websocket)

    def get_connection_count(self) -> int:
        """
        获取当前活跃连接数
        
        Returns:
            int: 活跃连接数量
        """
        return len(self.active_connections)


manager = ConnectionManager()
