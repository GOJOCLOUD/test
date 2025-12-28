import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router
from app.core.manager import manager


def create_app() -> FastAPI:
    """
    创建并配置 FastAPI 应用实例
    
    Returns:
        FastAPI: 配置好的应用实例
    """
    app = FastAPI(
        title="跨屏输入服务",
        description="接收手机消息并通过 WebSocket 或系统通知显示",
        version="1.0.0"
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(router)
    
    @app.on_event("startup")
    async def startup_event():
        print("=" * 50)
        print("跨屏输入服务已启动")
        print("=" * 50)
        print(f"WebSocket 端点: ws://localhost:8000/ws")
        print(f"HTTP API 端点: http://localhost:8000/api/message")
        print(f"Web 界面: http://localhost:8000/")
        print("=" * 50)
    
    @app.on_event("shutdown")
    async def shutdown_event():
        print("=" * 50)
        print("跨屏输入服务正在关闭...")
        print(f"当前活跃连接数: {manager.get_connection_count()}")
        print("=" * 50)
    
    return app


app = create_app()


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
