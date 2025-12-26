import { mockDelay, mockQuestions, mockTodoList, mockTemplates } from '../mock/handlers';

// 模拟 fetch 请求封装
const mockFetch = async (endpoint, method, body) => {
  console.log(`[API Mock] ${method} ${endpoint}`, body);
  await mockDelay(1500); // 模拟网络延迟
  
  if (endpoint === '/api/generate_questions') {
    return { questions: mockQuestions };
  }
  
  if (endpoint === '/api/complete_missing') {
    return { 
      answer: "根据上下文推断，建议使用 PostgreSQL 作为数据库。",
      nextQuestion: { id: 99, text: "需要集成 Stripe 支付吗？", answered: false }
    };
  }
  
  if (endpoint === '/api/generate_todolist') {
    return { todoList: mockTodoList };
  }

  if (endpoint === '/api/templates' && method === 'GET') {
    return { templates: mockTemplates };
  }

  return {};
};

// 真实的后端API调用
const API_BASE_URL = 'http://localhost:3001/api';

const apiFetch = async (endpoint, method, body) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json'
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  console.log(`[API] ${method} ${endpoint}`, body);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const generateAPI = {
  // 获取 AI Provider 列表
  getAIProviders: () => apiFetch('/provider/list', 'GET'),
  
  // 调用 AI Provider
  callAIProvider: (provider, message, mode, apiKey, conversation = null) => {
    const body = {
      provider,
      message,
      mode,
      apiKey,
      prompt: message
    };
    
    if (conversation) {
      body.conversation = conversation;
    }
    
    return apiFetch('/provider/call', 'POST', body);
  },
  
  // 批量生成问题
  generateBatchQuestions: (userInput, apiKey, params = {}) => {
    return apiFetch('/provider/batch-questions', 'POST', {
      userInput,
      apiKey,
      ...params
    });
  },
  
  // 总结用户回答
  summarizeAnswers: (questions, answers, originalInput, apiKey) => {
    return apiFetch('/provider/summarize-answers', 'POST', {
      questions,
      answers,
      originalInput,
      apiKey
    });
  },
  
  // GLM 架构设计
  generateArchitectureWithGLM: (requirement, apiKey, params = {}) => {
    return apiFetch('/provider/glm/architecture', 'POST', {
      finalRequirement: requirement,
      apiKey,
      ...params
    });
  },
  
  // 获取模板列表
  getTemplates: () => apiFetch('/templates', 'GET'),
  
  // 保存模板
  saveTemplate: (template) => apiFetch('/templates', 'POST', { template }),
  
  // 工程语言转译
  translateToEngineering: (data) => {
    return apiFetch('/translation/translate', 'POST', data);
  },
};