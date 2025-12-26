const crypto = require('crypto');

class ResponseCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000; // 最大缓存条目数
    this.defaultTTL = options.defaultTTL || 30 * 60 * 1000; // 默认TTL: 30分钟
    this.cache = new Map(); // 使用Map存储缓存
    this.accessTimes = new Map(); // 记录最后访问时间
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
  }

  // 生成缓存键
  generateKey(provider, prompt, options = {}) {
    // 创建一个包含所有相关参数的字符串
    const keyData = {
      provider,
      prompt,
      model: options.model,
      temperature: options.temperature,
      max_tokens: options.max_tokens
    };
    
    // 排序对象属性以确保一致性
    const sortedKeyData = Object.keys(keyData)
      .sort()
      .reduce((result, key) => {
        result[key] = keyData[key];
        return result;
      }, {});
    
    // 生成SHA256哈希作为键
    return crypto.createHash('sha256')
      .update(JSON.stringify(sortedKeyData))
      .digest('hex');
  }

  // 获取缓存
  get(provider, prompt, options = {}) {
    const key = this.generateKey(provider, prompt, options);
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // 更新访问时间
    this.accessTimes.set(key, Date.now());
    this.stats.hits++;
    
    console.log(`[缓存] 命中缓存，键: ${key.substring(0, 8)}...`);
    return item.data;
  }

  // 设置缓存
  set(provider, prompt, data, options = {}) {
    const key = this.generateKey(provider, prompt, options);
    const ttl = options.ttl || this.defaultTTL;
    
    // 如果缓存已满，执行LRU淘汰
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    const item = {
      data,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl
    };
    
    this.cache.set(key, item);
    this.accessTimes.set(key, Date.now());
    this.stats.sets++;
    
    console.log(`[缓存] 设置缓存，键: ${key.substring(0, 8)}..., TTL: ${ttl}ms`);
    return true;
  }

  // 淘汰最少使用的缓存项
  evictLRU() {
    if (this.accessTimes.size === 0) return;
    
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, time] of this.accessTimes.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessTimes.delete(oldestKey);
      this.stats.evictions++;
      console.log(`[缓存] 淘汰缓存，键: ${oldestKey.substring(0, 8)}...`);
    }
  }

  // 删除特定缓存
  delete(provider, prompt, options = {}) {
    const key = this.generateKey(provider, prompt, options);
    const deleted = this.cache.delete(key);
    this.accessTimes.delete(key);
    
    if (deleted) {
      console.log(`[缓存] 删除缓存，键: ${key.substring(0, 8)}...`);
    }
    
    return deleted;
  }

  // 清空所有缓存
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.accessTimes.clear();
    console.log(`[缓存] 清空所有缓存，共 ${size} 项`);
    return size;
  }

  // 获取缓存统计信息
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: `${hitRate}%`,
      stats: { ...this.stats }
    };
  }

  // 清理过期缓存
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.accessTimes.delete(key);
    });
    
    if (keysToDelete.length > 0) {
      console.log(`[缓存] 清理过期缓存，共 ${keysToDelete.length} 项`);
    }
    
    return keysToDelete.length;
  }

  // 设置定时清理
  startCleanupInterval(intervalMs = 5 * 60 * 1000) { // 默认5分钟清理一次
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, intervalMs);
    
    console.log(`[缓存] 启动定时清理，间隔: ${intervalMs}ms`);
  }

  // 停止定时清理
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('[缓存] 停止定时清理');
    }
  }
}

module.exports = ResponseCache;