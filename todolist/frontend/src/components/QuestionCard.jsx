import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';

const QuestionCard = () => {
  const { 
    questions, 
    answers, 
    projectEvaluation,
    architectureData,
    setAnswer, 
    generateTodoList, 
    loading,
    summarizedRequirement,
    summarizeAnswers,
    precisionMode
  } = useAppStore();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const handleGenerateTodoList = async () => {
    // 先总结用户回答
    await summarizeAnswers();
    setShowSummary(true);
  };

  const handleContinueToGLM = async () => {
    // 使用总结后的需求生成待办事项
    await generateTodoList();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (value) => {
    setAnswer(questions[currentQuestionIndex].id, value);
  };

  const getCurrentAnswer = () => {
    return answers[questions[currentQuestionIndex]?.id] || '';
  };

  const allQuestionsAnswered = () => {
    return questions.every(q => answers[q.id] && answers[q.id].trim() !== '');
  };

  if (!questions || questions.length === 0) return null;

  // 如果有architectureData，说明已经完成了整个流程，不显示QuestionCard
  if (architectureData) return null;

  // 显示总结结果
  if (showSummary) {
    return (
      <section className="official-card">
        <div className="red-header-title">
          需求总结
        </div>
        <p className="text-sub-text text-sm font-serif mb-6 leading-relaxed">
          <strong className="text-ink">系统已根据您的回答整理出以下需求文档</strong>
        </p>
        
        <div className="space-y-4">
          <div>
            <div className="font-bold text-ink mb-2 font-sans text-md">
              需求文档
            </div>
            <textarea
              value={summarizedRequirement}
              readOnly
              className="w-full min-h-[200px] p-4 border border-gray-300 rounded-md font-serif text-ink bg-gray-50"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button 
            onClick={() => setShowSummary(false)}
            disabled={loading.todo}
            className="btn-outline text-lg px-6 py-3"
          >
            返回修改
          </button>
          <button 
            onClick={handleContinueToGLM}
            disabled={loading.todo}
            className="btn-official text-lg px-6 py-3"
          >
            {loading.todo ? '生成中...' : '继续生成架构设计'}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="official-card">
      <div className="red-header-title flex justify-between items-center">
        <span>专项调研</span>
        <span className="text-sm font-normal text-gray-600">
          当前模式: <span className="text-china-red font-bold">{precisionMode}</span>
        </span>
      </div>
      
      {/* 项目评估信息 */}
      {projectEvaluation && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="font-bold text-blue-800 mb-2 font-sans text-md">
            项目评估
          </div>
          <p className="text-blue-700 text-sm font-serif leading-relaxed">
            {projectEvaluation}
          </p>
        </div>
      )}
      
      <p className="text-sub-text text-sm font-serif mb-6 leading-relaxed">
        <strong className="text-ink">编者按：</strong> 为确保项目工程高质量落地，需对以下关键技术指标进行深入分析与确认。请各相关单位（用户）认真如实填写。({currentQuestionIndex + 1}/{questions.length})
      </p>

      <div className="space-y-4 border border-gray-300 p-6">
        <div>
          <div className="font-bold text-ink mb-2 font-sans text-md">
            问题 {currentQuestionIndex + 1}
          </div>
          <div className="p-3 bg-gray-50 rounded-md mb-4">
            {questions[currentQuestionIndex]?.text || '问题加载中...'}
          </div>
        </div>
        
        <div>
          <div className="font-bold text-ink mb-2 font-sans text-md">
            您的回答
          </div>
          <textarea
            value={getCurrentAnswer()}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="（请在此处填写具体情况）"
            className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md font-serif text-ink focus:border-china-red focus:outline-none transition-colors"
          />
        </div>

        {/* 问题导航 */}
        <div className="flex justify-center space-x-2 py-4">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentQuestionIndex
                  ? 'bg-china-red'
                  : answers[questions[index]?.id]
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
              onClick={() => setCurrentQuestionIndex(index)}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="btn-outline text-lg px-6 py-3 disabled:opacity-50"
        >
          上一题
        </button>
        
        <div className="flex space-x-2">
          {currentQuestionIndex < questions.length - 1 ? (
            <button 
              onClick={handleNextQuestion}
              className="btn-official text-lg px-6 py-3"
            >
              下一题
            </button>
          ) : (
            <button
              onClick={handleGenerateTodoList}
              disabled={!allQuestionsAnswered() || loading.summary}
              className="btn-official text-lg px-6 py-3"
            >
              {loading.summary ? '总结中...' : '生成需求文档'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default QuestionCard;