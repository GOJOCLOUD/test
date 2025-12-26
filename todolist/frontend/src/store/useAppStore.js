import { create } from 'zustand';
import { generateAPI } from '../api/generate';

const useAppStore = create((set, get) => ({
  // State
  userInput: "",
  isAutoMode: false,
  precisionMode: "normal", // 'simple', 'normal', 'deep' - 默认为普通模式
  questions: [],
  answers: {}, // Keyed by question ID
  projectEvaluation: "", // Kimi对项目的评估
  summarizedRequirement: "",
  finalRequirement: "", // 用于存储最终的需求描述
  todoList: null,
  architectureData: null, // 存储GLM生成的架构设计数据
  templates: [],
  // 任务进度状态
  taskProgress: {
    isVisible: false,
    progress: 0,
    currentStep: "",
  },
  // 文档生成进度状态
  documentProgress: {
    isVisible: false,
    progress: 0,
    currentStep: "",
  },
  loading: {
    questions: false,
    todo: false,
    templates: false,
    summary: false,
  },
  activeTemplate: null,
  settings: {
    // 使用默认的API密钥，用户无需自己提供
    kimiApiKey: 'sk-l4sWDbgst16BXm7oNVHyTCLGYKrWz252hvMSSoN5DRgJAzUH',
    glmApiKey: 'c8b50bb7e7d342edb66b293636342059.VpGbzEj6uamxt01l',
    defaultProvider: 'kimi',
  },
  showSettings: false,

  // 任务进度管理
  updateTaskProgress: (progress, currentStep) => set((state) => ({
    taskProgress: {
      ...state.taskProgress,
      progress,
      currentStep,
    }
  })),

  showTaskProgress: () => set((state) => ({
    taskProgress: {
      ...state.taskProgress,
      isVisible: true,
      progress: 0,
      currentStep: "开始任务...",
    }
  })),

  hideTaskProgress: () => set((state) => ({
    taskProgress: {
      ...state.taskProgress,
      isVisible: false,
    }
  })),

  // 完整的任务流程，包含进度更新
  executeFullTask: async () => {
    const { userInput, precisionMode } = get();
    if (!userInput.trim()) return;

    // 显示进度条
    get().showTaskProgress();
    
    try {
      // 检查是否是"complete"模式
      if (precisionMode === 'complete') {
        // 跳过问题生成，直接生成报告
        get().updateTaskProgress(30, "准备生成需求文档...");
        
        // 将用户输入直接设置为最终需求
        set({ finalRequirement: userInput });
        
        // 更新进度到100%
        get().updateTaskProgress(100, "准备完成，即将生成需求文档");
        
        // 1秒后隐藏进度条并直接调用生成报告
        setTimeout(() => {
          get().hideTaskProgress();
          // 直接调用生成报告函数
          get().generateTodoList();
        }, 1000);
      } else {
        // 原有逻辑：生成问题 (50%)
        get().updateTaskProgress(50, "分析需求，生成问题...");
        await get().generateQuestions();
        
        // 完成 (100%)
        get().updateTaskProgress(100, "问题生成完成，请回答问题后点击生成需求文档");
        
        // 2秒后隐藏进度条
        setTimeout(() => {
          get().hideTaskProgress();
        }, 2000);
      }
    } catch (error) {
      console.error('执行完整任务流程错误:', error);
      get().updateTaskProgress(0, "任务执行失败");
      
      // 3秒后隐藏进度条
      setTimeout(() => {
        get().hideTaskProgress();
      }, 3000);
    }
  },

  // Actions
  setUserInput: (text) => set({ userInput: text }),
  
  toggleAutoMode: () => set((state) => ({ isAutoMode: !state.isAutoMode })),
  
  setPrecisionMode: (mode) => set({ precisionMode: mode }),

  clearInput: () => set({ 
    userInput: "", 
    isAutoMode: false,
    precisionMode: "normal", // 重置为普通模式
    questions: [], 
    todoList: null, 
    answers: {},
    projectEvaluation: "",
    summarizedRequirement: "",
    finalRequirement: "",
    architectureData: null,
    taskProgress: {
      isVisible: false,
      progress: 0,
      currentStep: "",
    }
  }),

  setAnswer: (qId, text) => set((state) => ({
    answers: { ...state.answers, [qId]: text }
  })),

  fetchTemplates: async () => {
    set((state) => ({ loading: { ...state.loading, templates: true } }));
    try {
      const res = await generateAPI.getTemplates();
      set({ templates: res.templates });
    } finally {
      set((state) => ({ loading: { ...state.loading, templates: false } }));
    }
  },

  applyTemplate: (template) => set({ activeTemplate: template, userInput: `基于 ${template.name} 模板：` }),

  generateQuestions: async () => {
    const { userInput, settings, precisionMode } = get();
    if (!userInput.trim()) return;

    set((state) => ({ loading: { ...state.loading, questions: true } }));
    try {
      // 使用批量问题生成API，传入精度模式参数
      const apiKey = settings.kimiApiKey;
      const res = await generateAPI.generateBatchQuestions(userInput, apiKey, { mode: precisionMode });
      
      if (res.success && res.data) {
        set({ 
          questions: res.data.questions,
          projectEvaluation: res.data.evaluation || ""
        });
      } else {
        console.error('生成问题失败:', res.error || '未知错误');
        // 如果批量生成失败，回退到单问题模式
        const singleRes = await generateAPI.callAIProvider(
          settings.defaultProvider, 
          userInput, 
          'requirement', 
          apiKey
        );
        set({ 
          questions: [{ id: 1, text: singleRes.data, answered: false }],
          projectEvaluation: "已生成问题以帮助明确项目需求。"
        });
      }
    } catch (error) {
      console.error('生成问题错误:', error);
      // 如果批量生成失败，回退到单问题模式
      try {
        const { settings } = get();
        const apiKey = settings.kimiApiKey;
        const singleRes = await generateAPI.callAIProvider(
          settings.defaultProvider, 
          userInput, 
          'requirement', 
          apiKey
        );
        set({ 
          questions: [{ id: 1, text: singleRes.data, answered: false }],
          projectEvaluation: "已生成问题以帮助明确项目需求。"
        });
      } catch (fallbackError) {
        console.error('回退模式也失败:', fallbackError);
        set({ 
          questions: [{ id: 1, text: "生成问题失败，请重试", answered: false }],
          projectEvaluation: "生成问题遇到问题，请重试。"
        });
      }
    } finally {
      set((state) => ({ loading: { ...state.loading, questions: false } }));
    }
  },

  autoComplete: async () => {
    // 模拟自动填充所有未回答的问题
    const { questions } = get();
    const newAnswers = {};
    questions.forEach(q => {
      newAnswers[q.id] = "AI 自动推断的回答：建议采用最流行的技术方案。";
    });
    set({ answers: newAnswers });
  },

  // 总结用户回答
  summarizeAnswers: async () => {
    const { questions, answers, userInput, settings } = get();
    if (questions.length === 0 || answers.length === 0) return;

    set((state) => ({ loading: { ...state.loading, summary: true } }));
    try {
      const apiKey = settings.kimiApiKey;
      const res = await generateAPI.summarizeAnswers(questions, answers, userInput, apiKey);
      
      if (res.data.status === 'success') {
        set({ 
          summarizedRequirement: res.data.summary,
          // 将总结后的需求设置为最终需求
          finalRequirement: res.data.summary
        });
      } else {
        console.error('总结回答失败:', res.data.message);
        // 如果总结失败，使用简单的合并
        const simpleSummary = `原始需求: ${userInput}\n\n用户回答:\n${answers.map((answer, index) => 
          `问题${index + 1}: ${questions[index]?.text || '未知问题'}\n回答: ${answer}`
        ).join('\n\n')}`;
        set({ 
          summarizedRequirement: simpleSummary,
          finalRequirement: simpleSummary
        });
      }
    } catch (error) {
      console.error('总结回答错误:', error);
      // 如果总结失败，使用简单的合并
      const { questions, answers, userInput } = get();
      const simpleSummary = `原始需求: ${userInput}\n\n用户回答:\n${answers.map((answer, index) => 
        `问题${index + 1}: ${questions[index]?.text || '未知问题'}\n回答: ${answer}`
      ).join('\n\n')}`;
      set({ 
        summarizedRequirement: simpleSummary,
        finalRequirement: simpleSummary
      });
    } finally {
      set((state) => ({ loading: { ...state.loading, summary: false } }));
    }
  },

  generateTodoList: async () => {
    const { userInput, settings, summarizedRequirement, precisionMode, finalRequirement } = get();
    if (!userInput.trim()) return;

    set((state) => ({ loading: { ...state.loading, todo: true } }));
    
    // 显示文档生成进度条
    get().showDocumentProgress();
    
    try {
      // 步骤1: 分析需求 (25%)
      get().updateDocumentProgress(25, "分析用户需求...");
      
      // 步骤2: 设计架构 (50%)
      get().updateDocumentProgress(50, "设计项目架构...");
      
      // 对于"complete"模式，使用finalRequirement（即用户输入）
      // 对于其他模式，使用总结后的需求或原始输入
      const requirementForGeneration = precisionMode === 'complete' 
        ? finalRequirement || userInput 
        : (summarizedRequirement || userInput);
      
      // 调用API生成架构设计，传入精度模式参数
      const apiKey = settings.glmApiKey;
      const res = await generateAPI.generateArchitectureWithGLM(requirementForGeneration, apiKey, { mode: precisionMode });
      
      if (res && (res.success !== false) && res.data) {
        // 步骤3: 生成待办事项 (75%)
        get().updateDocumentProgress(75, "生成待办事项...");
        
        // 步骤4: 整合文档 (95%)
        get().updateDocumentProgress(95, "整合需求文档...");
        
        set({ 
          architectureData: res.data,
          todoList: null, // 清空旧的todoList，因为我们现在使用architectureData
          finalRequirement: requirementForGeneration
        });
        
        // 完成 (100%)
        get().updateDocumentProgress(100, "需求文档生成完成！");
        
        // 2秒后隐藏进度条
        setTimeout(() => {
          get().hideDocumentProgress();
        }, 2000);
      } else {
        const errorMsg = res?.error || res?.message || '未知错误';
        console.error('生成架构设计失败:', errorMsg);
        get().updateDocumentProgress(0, `生成需求文档失败: ${errorMsg}`);
        
        // 3秒后隐藏进度条
        setTimeout(() => {
          get().hideDocumentProgress();
        }, 3000);
      }
    } catch (error) {
      console.error('生成架构设计错误:', error);
      get().updateDocumentProgress(0, "生成需求文档失败");
      
      // 3秒后隐藏进度条
      setTimeout(() => {
        get().hideDocumentProgress();
      }, 3000);
    } finally {
      set((state) => ({ loading: { ...state.loading, todo: false } }));
    }
  },

  // 需求完善对话
  continueRequirementConversation: async (message, conversation = []) => {
    const { settings } = get();
    
    try {
      const apiKey = settings.kimiApiKey;
      const res = await generateAPI.callAIProvider(
        'kimi', 
        message, 
        'requirement', 
        apiKey,
        conversation
      );
      
      return res.data;
    } catch (error) {
      console.error('需求完善对话失败:', error);
      throw error;
    }
  },

  // 设置相关方法
  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
  
  updateSettings: (newSettings) => set({ settings: { ...get().settings, ...newSettings } }),
  // 文档进度管理
  updateDocumentProgress: (progress, currentStep) => set((state) => ({
    documentProgress: {
      ...state.documentProgress,
      progress,
      currentStep,
    }
  })),

  showDocumentProgress: () => set((state) => ({
    documentProgress: {
      ...state.documentProgress,
      isVisible: true,
      progress: 0,
      currentStep: "开始生成需求文档...",
    }
  })),

  hideDocumentProgress: () => set((state) => ({
    documentProgress: {
      ...state.documentProgress,
      isVisible: false,
    }
  })),
}));

export default useAppStore;