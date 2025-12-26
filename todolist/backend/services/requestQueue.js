const EventEmitter = require('events');

class RequestQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    this.maxConcurrent = options.maxConcurrent || 5; // 最大并发请求数
    this.maxQueueSize = options.maxQueueSize || 100; // 最大队列长度
    this.timeout = options.timeout || 120000; // 请求超时时间(毫秒)
    this.queue = []; // 请求队列
    this.processing = new Set(); // 正在处理的请求集合
    this.requestCounter = 0; // 请求计数器
    this.stats = {
      total: 0,
      completed: 0,
      failed: 0,
      queued: 0,
      processing: 0,
      avgProcessingTime: 0
    };
  }

  // 添加请求到队列
  enqueue(requestFn, priority = 0) {
    return new Promise((resolve, reject) => {
      // 检查队列是否已满
      if (this.queue.length >= this.maxQueueSize) {
        return reject(new Error('请求队列已满，请稍后再试'));
      }

      const requestId = ++this.requestCounter;
      const request = {
        id: requestId,
        fn: requestFn,
        priority,
        resolve,
        reject,
        createdAt: Date.now(),
        timeoutId: null
      };

      // 设置请求超时
      request.timeoutId = setTimeout(() => {
        this.removeFromQueue(requestId);
        reject(new Error('请求处理超时'));
      }, this.timeout);

      // 按优先级插入队列
      this.insertByPriority(request);
      this.stats.queued++;
      this.stats.total++;
      
      // 尝试处理队列
      this.processQueue();
      
      console.log(`[队列] 请求 #${requestId} 已加入队列，当前队列长度: ${this.queue.length}`);
    });
  }

  // 按优先级插入队列
  insertByPriority(request) {
    let inserted = false;
    for (let i = 0; i < this.queue.length; i++) {
      if (this.queue[i].priority < request.priority) {
        this.queue.splice(i, 0, request);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.queue.push(request);
    }
  }

  // 处理队列中的请求
  async processQueue() {
    // 如果正在处理的请求数已达上限，或队列为空，则返回
    if (this.processing.size >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    // 从队列中取出请求
    const request = this.queue.shift();
    if (!request) return;

    // 添加到处理集合
    this.processing.add(request);
    this.stats.queued--;
    this.stats.processing++;
    
    console.log(`[队列] 开始处理请求 #${request.id}，当前并发数: ${this.processing.size}`);

    try {
      // 执行请求函数
      const startTime = Date.now();
      const result = await request.fn();
      const processingTime = Date.now() - startTime;
      
      // 更新平均处理时间
      this.updateAvgProcessingTime(processingTime);
      
      // 清除超时定时器
      if (request.timeoutId) {
        clearTimeout(request.timeoutId);
      }
      
      // 从处理集合中移除
      this.processing.delete(request);
      this.stats.processing--;
      this.stats.completed++;
      
      // 返回结果
      request.resolve(result);
      
      console.log(`[队列] 请求 #${request.id} 处理完成，耗时: ${processingTime}ms`);
      
      // 继续处理队列中的下一个请求
      this.processQueue();
      
    } catch (error) {
      // 清除超时定时器
      if (request.timeoutId) {
        clearTimeout(request.timeoutId);
      }
      
      // 从处理集合中移除
      this.processing.delete(request);
      this.stats.processing--;
      this.stats.failed++;
      
      console.error(`[队列] 请求 #${request.id} 处理失败:`, error.message);
      
      // 返回错误
      request.reject(error);
      
      // 继续处理队列中的下一个请求
      this.processQueue();
    }
  }

  // 从队列中移除请求
  removeFromQueue(requestId) {
    const index = this.queue.findIndex(req => req.id === requestId);
    if (index !== -1) {
      const request = this.queue[index];
      if (request.timeoutId) {
        clearTimeout(request.timeoutId);
      }
      this.queue.splice(index, 1);
      this.stats.queued--;
      this.stats.total--;
      return true;
    }
    return false;
  }

  // 更新平均处理时间
  updateAvgProcessingTime(processingTime) {
    const totalCompleted = this.stats.completed;
    if (totalCompleted === 0) {
      this.stats.avgProcessingTime = processingTime;
    } else {
      this.stats.avgProcessingTime = 
        (this.stats.avgProcessingTime * (totalCompleted - 1) + processingTime) / totalCompleted;
    }
  }

  // 获取队列状态
  getStatus() {
    return {
      queueLength: this.queue.length,
      processingCount: this.processing.size,
      maxConcurrent: this.maxConcurrent,
      maxQueueSize: this.maxQueueSize,
      stats: { ...this.stats }
    };
  }

  // 清空队列
  clear() {
    // 清除所有超时定时器
    this.queue.forEach(request => {
      if (request.timeoutId) {
        clearTimeout(request.timeoutId);
      }
    });
    
    this.queue = [];
    console.log('[队列] 队列已清空');
  }
}

module.exports = RequestQueue;