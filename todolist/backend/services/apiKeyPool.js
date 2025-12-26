const EventEmitter = require('events');

class APIKeyPool extends EventEmitter {
  constructor(keys = [], options = {}) {
    super();
    this.keys = keys.map(key => ({
      key,
      inUse: false,
      lastUsed: 0,
      requestCount: 0,
      errorCount: 0,
      lastError: null,
      lastErrorTime: 0,
      cooldownUntil: 0
    }));
    
    this.currentIndex = 0;
    this.cooldownTime = options.cooldownTime || 60 * 1000; // 冷却时间1分钟
    this.maxErrors = options.maxErrors || 3; // 最大错误次数
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      keyRotations: 0
    };
  }

  // 添加新的API密钥
  addKey(key) {
    this.keys.push({
      key,
      inUse: false,
      lastUsed: 0,
      requestCount: 0,
      errorCount: 0,
      lastError: null,
      lastErrorTime: 0,
      cooldownUntil: 0
    });
    console.log(`[密钥池] 添加新密钥: ${key.substring(0, 8)}...`);
  }

  // 获取可用的API密钥
  getKey() {
    // 过滤出可用的密钥（未在使用中且不在冷却期）
    const availableKeys = this.keys.filter(k => 
      !k.inUse && 
      (k.cooldownUntil === 0 || Date.now() > k.cooldownUntil)
    );
    
    if (availableKeys.length === 0) {
      throw new Error('没有可用的API密钥');
    }
    
    // 选择请求次数最少的密钥
    let selectedKey = availableKeys[0];
    for (const key of availableKeys) {
      if (key.requestCount < selectedKey.requestCount) {
        selectedKey = key;
      }
    }
    
    // 标记为使用中
    selectedKey.inUse = true;
    selectedKey.lastUsed = Date.now();
    selectedKey.requestCount++;
    this.stats.totalRequests++;
    
    console.log(`[密钥池] 获取密钥: ${selectedKey.key.substring(0, 8)}..., 使用次数: ${selectedKey.requestCount}`);
    return selectedKey.key;
  }

  // 释放API密钥
  releaseKey(key, success = true) {
    const keyObj = this.keys.find(k => k.key === key);
    if (!keyObj) {
      console.warn(`[密钥池] 尝试释放不存在的密钥: ${key.substring(0, 8)}...`);
      return;
    }
    
    keyObj.inUse = false;
    
    if (success) {
      // 成功请求，重置错误计数
      if (keyObj.errorCount > 0) {
        console.log(`[密钥池] 密钥 ${key.substring(0, 8)}... 错误计数重置: ${keyObj.errorCount} -> 0`);
      }
      keyObj.errorCount = 0;
      keyObj.lastError = null;
      keyObj.lastErrorTime = 0;
      keyObj.cooldownUntil = 0;
      this.stats.successfulRequests++;
    } else {
      // 失败请求，增加错误计数
      keyObj.errorCount++;
      keyObj.lastErrorTime = Date.now();
      
      // 如果错误次数超过阈值，将密钥放入冷却期
      if (keyObj.errorCount >= this.maxErrors) {
        keyObj.cooldownUntil = Date.now() + this.cooldownTime;
        console.warn(`[密钥池] 密钥 ${key.substring(0, 8)}... 错误次数过多(${keyObj.errorCount})，进入冷却期至 ${new Date(keyObj.cooldownUntil).toLocaleTimeString()}`);
        this.emit('keyCooldown', key);
      }
      
      this.stats.failedRequests++;
    }
  }

  // 记录密钥错误
  recordError(key, error) {
    const keyObj = this.keys.find(k => k.key === key);
    if (!keyObj) {
      console.warn(`[密钥池] 尝试记录不存在密钥的错误: ${key.substring(0, 8)}...`);
      return;
    }
    
    keyObj.lastError = error;
    keyObj.lastErrorTime = Date.now();
    console.error(`[密钥池] 密钥 ${key.substring(0, 8)}... 错误: ${error}`);
  }

  // 获取密钥池状态
  getStatus() {
    const availableKeys = this.keys.filter(k => 
      !k.inUse && 
      (k.cooldownUntil === 0 || Date.now() > k.cooldownUntil)
    );
    
    const inUseKeys = this.keys.filter(k => k.inUse);
    const cooldownKeys = this.keys.filter(k => 
      k.cooldownUntil > 0 && Date.now() <= k.cooldownUntil
    );
    
    return {
      totalKeys: this.keys.length,
      availableKeys: availableKeys.length,
      inUseKeys: inUseKeys.length,
      cooldownKeys: cooldownKeys.length,
      keys: this.keys.map(k => ({
        key: k.key.substring(0, 8) + '...',
        inUse: k.inUse,
        requestCount: k.requestCount,
        errorCount: k.errorCount,
        lastError: k.lastError,
        lastErrorTime: k.lastErrorTime,
        cooldownUntil: k.cooldownUntil,
        isCooldown: k.cooldownUntil > 0 && Date.now() <= k.cooldownUntil
      })),
      stats: { ...this.stats }
    };
  }

  // 重置密钥错误计数
  resetKeyErrors(key) {
    const keyObj = this.keys.find(k => k.key === key);
    if (!keyObj) {
      console.warn(`[密钥池] 尝试重置不存在密钥的错误: ${key.substring(0, 8)}...`);
      return;
    }
    
    keyObj.errorCount = 0;
    keyObj.lastError = null;
    keyObj.lastErrorTime = 0;
    keyObj.cooldownUntil = 0;
    console.log(`[密钥池] 重置密钥 ${key.substring(0, 8)}... 的错误计数`);
  }

  // 重置所有密钥错误计数
  resetAllKeyErrors() {
    this.keys.forEach(k => {
      k.errorCount = 0;
      k.lastError = null;
      k.lastErrorTime = 0;
      k.cooldownUntil = 0;
    });
    console.log('[密钥池] 重置所有密钥的错误计数');
  }

  // 手动将密钥放入冷却期
  setKeyCooldown(key, customCooldownTime) {
    const keyObj = this.keys.find(k => k.key === key);
    if (!keyObj) {
      console.warn(`[密钥池] 尝试冷却不存在的密钥: ${key.substring(0, 8)}...`);
      return;
    }
    
    const cooldownTime = customCooldownTime || this.cooldownTime;
    keyObj.cooldownUntil = Date.now() + cooldownTime;
    console.log(`[密钥池] 手动冷却密钥 ${key.substring(0, 8)}... 至 ${new Date(keyObj.cooldownUntil).toLocaleTimeString()}`);
  }
}

module.exports = APIKeyPool;