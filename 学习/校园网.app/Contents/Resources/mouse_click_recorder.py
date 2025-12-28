#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from pynput import mouse
from PySide6.QtCore import QObject, Signal, Slot

class MouseClickRecorder(QObject):
    # Signal to emit when a click is recorded: (x, y)
    click_recorded = Signal(float, float)

    def __init__(self):
        super().__init__()
        self.is_recording = False
        self.ignore_rect = None

    @Slot(object)
    def set_ignore_rect(self, rect):
        """接收并存储GUI窗口的几何信息。"""
        self.ignore_rect = rect

    def on_click(self, x, y, button, pressed):
        """鼠标点击回调函数。如果点击有效则发出信号。"""
        if pressed and self.is_recording:
            # 检查点击是否在工具界面内，如果是则忽略
            if self.ignore_rect and (self.ignore_rect.x() <= x <= self.ignore_rect.x() + self.ignore_rect.width() and \
                                      self.ignore_rect.y() <= y <= self.ignore_rect.y() + self.ignore_rect.height()):
                return  # 忽略工具界面内的点击
            # 发出坐标信号
            self.click_recorded.emit(x, y)

    def start(self):
        """将录制标志设置为true。"""
        self.is_recording = True

    def stop(self):
        """将录制标志设置为false。"""
        self.is_recording = False
