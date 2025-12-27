import axios from "axios";
import { CONFIG } from "./config.js";

// 简单重试包装：同一个请求失败后再试一次
async function withRetry(fn, retries = 1) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    return await withRetry(fn, retries - 1);
  }
}

// 这里导出的 http 对象，保持你原本的命名不变
export const http = {
  get(url, config = {}) {
    // 强制超时兜底，防止某些外部 API 卡死
    const finalCfg = {
      timeout: CONFIG.TIMEOUT_MS || 10000,
      ...config
    };
    return withRetry(() => axios.get(url, finalCfg));
  }
};

export function ok(data) {
  return { ok: true, data };
}
export function fail(message, code = 500) {
  return { ok: false, error: { message, code } };
}
