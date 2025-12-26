const config = require('../config');
const kimiService = require('../services/kimi');

// 处理需求完善对话
const processRequirementConversation = async (conversation, apiKey) => {
  try {
    // 检查对话轮次是否超过限制
    if (conversation.length > config.requirementEngine.maxConversationTurns * 2) {
      return {
        status: 'error',
        message: `对话轮次超过限制 (${config.requirementEngine.maxConversationTurns})`,
        conversation
      };
    }
    
    // 格式化对话历史为字符串
    const historyString = conversation.map(msg => {
      return `${msg.role}: ${msg.content}`;
    }).join('\n');
    
    // 构建提示词
    const prompt = config.requirementEngine.promptTemplate.replace('{{history}}', historyString);
    
    // 调用 Kimi 服务
    const response = await kimiService.call(apiKey, prompt);
    
    // 检查是否是最终需求
    if (response.includes('FINAL')) {
      // 提取最终需求内容
      const finalRequirement = extractFinalRequirement(response);
      
      return {
        status: 'completed',
        message: '需求收集完成',
        finalRequirement,
        conversation: [...conversation, { role: 'assistant', content: response }]
      };
    } else {
      // 继续对话
      return {
        status: 'continue',
        message: '需要更多信息',
        question: response,
        conversation: [...conversation, { role: 'assistant', content: response }]
      };
    }
  } catch (error) {
    console.error('需求完善处理错误:', error);
    return {
      status: 'error',
      message: error.message || '处理需求完善时发生错误',
      conversation
    };
  }
};

// 批量生成问题
const generateBatchQuestions = async (userInput, apiKey, questionCount = 5, questionDepth = 'standard', depthDescription = '') => {
  try {
    // 根据精度模式调整问题数量和深度
    let count = questionCount || 5;
    let instruction = depthDescription || '';
    
    // 如果没有提供深度描述，根据不同的深度设置问题数量和指令
    if (!instruction) {
      if (questionDepth === 'comprehensive' || questionDepth === 'deep') {
        count = questionCount || 10;
        instruction = '【重要指令】请处于"深度工程模式"。除了核心功能，必须深入挖掘边缘情况、数据一致性、高并发下的性能需求、安全性（权限/加密）以及未来的扩展性接口。';
      } else if (questionDepth === 'simple' || questionDepth === 'basic') {
        count = questionCount || 3;
        instruction = '【重要指令】请处于"快速验证模式"。只关注最核心的业务闭环，忽略次要功能、后台管理和非关键细节。问题必须简短、直接，直击核心痛点。';
      } else {
        // standard 模式
        count = questionCount || 6;
        instruction = '【重要指令】请处于"标准开发模式"。涵盖主要的功能模块、用户交互流程以及核心数据结构。保持广度和深度的平衡。';
      }
    }
    
    // 构建批量问题生成提示词，包含精度参数
    const prompt = config.requirementEngine.batchQuestionsPromptTemplate
      .replace('{{userInput}}', userInput)
      .replace('生成5-8个最有意义的关键问题', `生成${count}个最有意义的关键问题`)
      .replace('请生成一个JSON格式的响应', `${instruction}\n\n请生成一个JSON格式的响应`);
    
    // 调用 Kimi 服务
    const response = await kimiService.call(apiKey, prompt);
    
    // 解析响应，提取评估和问题列表
    const { evaluation, questions } = parseQuestionsAndEvaluation(response);
    
    return {
      status: 'success',
      message: '问题生成成功',
      evaluation,
      questions,
      originalResponse: response
    };
  } catch (error) {
    console.error('批量问题生成错误:', error);
    return {
      status: 'error',
      message: error.message || '生成问题时发生错误'
    };
  }
};

// 从响应中解析评估和问题列表
const parseQuestionsAndEvaluation = (response) => {
  let evaluation = "";
  let questions = [];
  
  console.log('=== 开始解析响应 ===');
  console.log('原始响应:', response);
  console.log('响应长度:', response.length);
  
  // 尝试解析JSON格式的响应
  try {
    if (response.includes('{') && response.includes('}')) {
      console.log('尝试查找JSON对象...');
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('找到JSON对象:', jsonMatch[0]);
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // 提取评估信息
        if (parsedData.evaluation) {
          evaluation = parsedData.evaluation;
          console.log('从JSON对象中提取评估:', evaluation);
        }
        
        // 提取问题列表
        if (parsedData.questions && Array.isArray(parsedData.questions)) {
          questions = parsedData.questions.map(q => ({
            ...q,
            answered: false
          }));
          console.log('从JSON对象中提取问题数量:', questions.length);
        }
      }
    }
    
    // 如果没有找到JSON对象，尝试解析JSON数组
    if (questions.length === 0 && response.includes('[') && response.includes(']')) {
      console.log('尝试查找JSON数组...');
      const jsonArrayMatch = response.match(/\[[\s\S]*\]/);
      if (jsonArrayMatch) {
        console.log('找到JSON数组:', jsonArrayMatch[0]);
        const parsedArray = JSON.parse(jsonArrayMatch[0]);
        
        if (Array.isArray(parsedArray)) {
          questions = parsedArray.map(q => ({
            ...q,
            answered: false
          }));
          console.log('从JSON数组中提取问题数量:', questions.length);
          
          // 从响应文本中提取评估信息
          // 查找"评估"或"evaluation"关键词后的内容
          console.log('尝试从响应文本中提取评估信息...');
          const evaluationMatch = response.match(/(?:评估|evaluation|项目分析)[:：]\s*([\s\S]*?)(?:\n\s*\n|\n\s*问题|\n\s*questions|```|$)/i);
          if (evaluationMatch) {
            evaluation = evaluationMatch[1].trim();
            console.log('通过关键词匹配找到评估:', evaluation);
          } else {
            console.log('通过关键词匹配未找到评估信息');
          }
          
          // 如果没有找到评估信息，尝试从响应文本中提取
          if (!evaluation) {
            console.log('尝试从JSON数组之前的文本提取评估信息...');
            // 查找JSON数组之前的文本
            const beforeArray = response.substring(0, response.indexOf(jsonArrayMatch[0]));
            console.log('JSON数组之前的文本:', beforeArray);
            // 提取可能的评估信息
            const lines = beforeArray.split('\n').filter(line => line.trim() && !line.includes('```'));
            console.log('过滤后的行数:', lines.length);
            if (lines.length > 0) {
              evaluation = lines.join('\n').trim();
              console.log('从JSON数组之前的文本提取评估:', evaluation);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('解析JSON格式响应失败:', error);
  }
  
  // 如果JSON解析失败，尝试解析文本格式
  if (questions.length === 0) {
    console.log('JSON解析失败，尝试解析文本格式...');
    questions = parseQuestionsFromResponse(response);
    console.log('从文本格式解析问题数量:', questions.length);
    
    // 尝试从响应中提取评估信息
    console.log('尝试从响应中提取评估信息...');
    const evaluationMatch = response.match(/(?:评估|evaluation|项目分析)[:：]\s*([\s\S]*?)(?:\n\s*\n|\n\s*问题|\n\s*questions|$)/i);
    if (evaluationMatch) {
      evaluation = evaluationMatch[1].trim();
      console.log('通过关键词匹配找到评估:', evaluation);
    } else {
      console.log('通过关键词匹配未找到评估信息');
    }
  }
  
  // 如果没有找到评估信息，创建一个默认评估
  if (!evaluation) {
    console.log('未找到评估信息，使用默认评估');
    evaluation = "已根据您的项目描述生成了相关问题，以帮助进一步明确需求。";
  }
  
  console.log('=== 解析结果 ===');
  console.log('评估:', evaluation);
  console.log('问题数量:', questions.length);
  
  return { evaluation, questions };
};

// 从响应中解析问题列表
const parseQuestionsFromResponse = (response) => {
  // 尝试解析JSON格式的问题列表
  try {
    if (response.includes('[') && response.includes(']')) {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.error('解析JSON格式问题失败:', error);
  }
  
  // 如果JSON解析失败，尝试解析文本格式的问题
  const questions = [];
  const lines = response.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过空行和明显不是问题的行
    if (!line || line.length < 10) continue;
    
    // 检查是否包含问号或疑问词
    if (line.includes('?') || line.includes('？') || 
        line.includes('什么') || line.includes('如何') || 
        line.includes('为什么') || line.includes('是否') ||
        line.includes('哪些') || line.includes('怎样')) {
      
      questions.push({
        id: questions.length + 1,
        text: line.replace(/^\d+\.?\s*/, ''), // 移除开头的数字序号
        answered: false
      });
    }
  }
  
  // 如果没有找到任何问题，创建一个默认问题
  if (questions.length === 0) {
    questions.push({
      id: 1,
      text: "请提供更多关于项目的详细信息",
      answered: false
    });
  }
  
  return questions;
};

// 总结用户回答
const summarizeUserAnswers = async (questions, answers, originalInput, apiKey) => {
  try {
    // 构建回答总结提示词
    const answersText = questions.map(q => {
      const answer = answers[q.id] || "未回答";
      return `问题: ${q.text}\n回答: ${answer}`;
    }).join('\n\n');
    
    const prompt = config.requirementEngine.summaryPromptTemplate
      .replace('{{originalInput}}', originalInput)
      .replace('{{answersText}}', answersText);
    
    // 调用 Kimi 服务
    const response = await kimiService.call(apiKey, prompt);
    
    // 解析响应，提取结构化需求
    const structuredRequirement = extractFinalRequirement(response);
    
    // 将结构化需求转换为可读的总结文本
    let summaryText = response;
    if (typeof structuredRequirement === 'object') {
      summaryText = `项目定位：${structuredRequirement.projectPosition || ''}\n\n` +
                   `功能范围：${structuredRequirement.functionalScope || ''}\n\n` +
                   `用户流程：${structuredRequirement.userFlow || ''}\n\n` +
                   `关键约束：${structuredRequirement.keyConstraints || ''}\n\n` +
                   `非功能性需求：${structuredRequirement.nonFunctionalRequirements || ''}\n\n` +
                   `API 需求：${structuredRequirement.apiRequirements || ''}\n\n` +
                   `输出目标：${structuredRequirement.outputGoals || ''}\n\n` +
                   `总结：${structuredRequirement.summaryForGLM || ''}`;
    }
    
    return {
      status: 'success',
      message: '回答总结成功',
      summary: summaryText, // 添加summary字段，确保前端可以正确获取
      structuredRequirement,
      originalResponse: response
    };
  } catch (error) {
    console.error('回答总结错误:', error);
    return {
      status: 'error',
      message: error.message || '总结回答时发生错误'
    };
  }
};

// 从响应中提取最终需求
const extractFinalRequirement = (response) => {
  // 查找 FINAL 标记之后的内容
  const finalIndex = response.indexOf('FINAL');
  if (finalIndex === -1) {
    return response;
  }
  
  // 提取 FINAL 之后的内容
  let finalContent = response.substring(finalIndex + 5).trim();
  
  // 尝试解析结构化内容
  try {
    // 如果内容包含 JSON 格式，尝试解析
    if (finalContent.includes('{') && finalContent.includes('}')) {
      const jsonMatch = finalContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    
    // 否则尝试解析为结构化文本
    return parseStructuredText(finalContent);
  } catch (error) {
    console.error('解析最终需求失败:', error);
    // 如果解析失败，返回原始内容
    return finalContent;
  }
};

// 解析结构化文本
const parseStructuredText = (text) => {
  const sections = {
    projectPosition: '',
    functionalScope: '',
    userFlow: '',
    keyConstraints: '',
    nonFunctionalRequirements: '',
    apiRequirements: '',
    outputGoals: '',
    summaryForGLM: ''
  };
  
  // 尝试提取各个部分
  const lines = text.split('\n');
  let currentSection = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 检查是否是标题行
    if (trimmedLine.includes('项目定位') || trimmedLine.includes('Project Position')) {
      currentSection = 'projectPosition';
      continue;
    } else if (trimmedLine.includes('功能范围') || trimmedLine.includes('Functional Scope')) {
      currentSection = 'functionalScope';
      continue;
    } else if (trimmedLine.includes('用户流程') || trimmedLine.includes('User Flow')) {
      currentSection = 'userFlow';
      continue;
    } else if (trimmedLine.includes('关键约束') || trimmedLine.includes('Key Constraints')) {
      currentSection = 'keyConstraints';
      continue;
    } else if (trimmedLine.includes('非功能性需求') || trimmedLine.includes('Non-functional Requirements')) {
      currentSection = 'nonFunctionalRequirements';
      continue;
    } else if (trimmedLine.includes('API 需求') || trimmedLine.includes('API Requirements')) {
      currentSection = 'apiRequirements';
      continue;
    } else if (trimmedLine.includes('输出目标') || trimmedLine.includes('Output Goals')) {
      currentSection = 'outputGoals';
      continue;
    } else if (trimmedLine.includes('总结') || trimmedLine.includes('Summary')) {
      currentSection = 'summaryForGLM';
      continue;
    }
    
    // 添加内容到当前部分
    if (currentSection && trimmedLine) {
      if (sections[currentSection]) {
        sections[currentSection] += '\n' + trimmedLine;
      } else {
        sections[currentSection] = trimmedLine;
      }
    }
  }
  
  return sections;
};

// 评估需求完整性
const assessRequirementCompleteness = (conversation) => {
  // 这里可以实现更复杂的逻辑来评估需求完整性
  // 目前简单地基于对话轮次和内容长度进行评估
  
  const totalMessages = conversation.length;
  const totalLength = conversation.reduce((sum, msg) => sum + msg.content.length, 0);
  
  // 基于消息数量和内容长度计算完整性分数
  const messageScore = Math.min(totalMessages / 10, 1); // 最多 10 轮对话
  const lengthScore = Math.min(totalLength / 2000, 1); // 最多 2000 字符
  
  const completenessScore = (messageScore + lengthScore) / 2;
  
  return {
    score: completenessScore,
    isComplete: completenessScore >= config.requirementEngine.finalRequirementThreshold
  };
};

module.exports = {
  processRequirementConversation,
  extractFinalRequirement,
  assessRequirementCompleteness,
  generateBatchQuestions,
  parseQuestionsFromResponse,
  parseQuestionsAndEvaluation,
  summarizeUserAnswers
};