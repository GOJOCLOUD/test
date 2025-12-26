import React, { useState } from 'react';
import { 
  FileText, 
  ArrowRightLeft, 
  Copy, 
  Sparkles, 
  BookOpen, 
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { generateAPI } from '../api/generate';

const SupplementSection = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState('normal'); // 新增模式状态

  // 调用后端API进行工程语言转译
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsTranslating(true);
    setOutputText(''); // 清空之前的结果
    
    try {
      const response = await generateAPI.translateToEngineering({
        inputText,
        mode
      });
      
      if (response.success) {
        setOutputText(response.data);
      } else {
        setOutputText(`转译失败: ${response.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('转译请求失败:', error);
      setOutputText(`转译请求失败: ${error.message || '网络错误'}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 mb-12">
      {/* 左侧主版面 - 占 75% */}
      <div className="lg:w-3/4">
        <div className="bg-white border-t-4 border-t-china-red border-l border-r border-b border-gray-200 p-6 shadow-paper relative overflow-hidden">
          
          {/* 报纸栏目标题 */}
          <div className="flex items-center justify-between mb-6 border-b-2 border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="text-china-red w-6 h-6" />
              <h2 className="text-2xl font-black text-ink tracking-tight font-serif">
                工程语言转译专栏
              </h2>
            </div>
            <div className="text-xs text-gray-400 font-serif border border-gray-200 px-2 py-1 rounded bg-gray-50">
              第 A-02 版：技术规范化
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* 输入区域 */}
            <div className="relative group">
              <label className="block text-sm font-bold text-gray-700 mb-2 font-serif flex items-center gap-2">
                <span className="w-2 h-2 bg-china-red rounded-full"></span>
                自然语言输入 (Natural Language)
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="在此输入您的口语化需求。例如：'我想做一个按钮，点了以后能保存数据，如果没网了要提示用户。'"
                className="w-full h-32 p-4 bg-gray-50 border border-gray-300 focus:border-china-red focus:ring-1 focus:ring-china-red outline-none transition-all font-serif text-gray-700 resize-none text-base leading-relaxed"
              />
              <div className="absolute right-2 bottom-2 text-xs text-gray-400">
                {inputText.length} 字符
              </div>
            </div>

            {/* 模式选择区域 */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-bold text-gray-700 font-serif flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-800 rounded-full"></span>
                转译模式
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 focus:border-china-red focus:ring-1 focus:ring-china-red outline-none transition-all font-serif text-sm text-gray-700 bg-white"
              >
                <option value="simple">简洁模式</option>
                <option value="normal">标准模式</option>
                <option value="comprehensive">详细模式</option>
              </select>
            </div>

            {/* 转换操作区 */}
            <div className="flex justify-center -my-2 z-10">
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !inputText}
                className={`
                  flex items-center gap-2 px-8 py-2 rounded-sm border-2 
                  transition-all duration-300 font-serif font-bold text-lg shadow-sm
                  ${isTranslating 
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                    : 'bg-china-red border-china-red text-white hover:bg-red-700 hover:shadow-md active:scale-95'}
                `}
              >
                {isTranslating ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    正在转译...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-5 h-5" />
                    标准化转译
                  </>
                )}
              </button>
            </div>

            {/* 输出区域 */}
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2 font-serif flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-800 rounded-full"></span>
                工程化规约输出 (Engineering Output)
              </label>
              
              <div className={`
                w-full min-h-[160px] p-4 border border-gray-300 bg-[#f8f9fa] 
                font-mono text-sm leading-relaxed text-gray-800 relative
                transition-all duration-500
                ${isTranslating ? 'opacity-50 blur-[1px]' : 'opacity-100 blur-0'}
              `}>
                {outputText ? (
                  <pre className="whitespace-pre-wrap font-mono">{outputText}</pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400 italic font-serif">
                    <FileText className="w-8 h-8 mb-2 opacity-20" />
                    等待转译指令...
                  </div>
                )}

                {/* 复制按钮 */}
                {outputText && (
                  <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded hover:border-china-red hover:text-china-red transition-colors"
                    title="复制内容"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
              
              {/* 装饰性页脚 */}
              <div className="mt-2 text-right">
                 <span className="text-[10px] text-gray-400 font-serif tracking-widest">
                   SYSTEM_GENERATED_CONTENT // VER: 1.0.4
                 </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧侧边栏 - 占 25% */}
      <aside className="lg:w-1/4 space-y-6">
        
        {/* 侧栏卡片 1：转译规范 */}
        <div className="bg-white border-t-4 border-t-gray-800 border-l border-r border-b border-gray-200 p-5 shadow-paper">
          <div className="flex items-center gap-2 text-gray-800 font-bold text-lg mb-4 pb-2 border-b border-gray-100 font-serif">
            <BookOpen className="w-5 h-5" />
            <span>转译规范</span>
          </div>
          <ul className="space-y-4 text-sm font-serif text-ink leading-snug">
            <li className="flex gap-2">
              <span className="text-china-red font-bold">01.</span>
              <span className="text-gray-600">消除模棱两可的形容词，转换为可量化的技术指标。</span>
            </li>
            <li className="flex gap-2">
              <span className="text-china-red font-bold">02.</span>
              <span className="text-gray-600">补充隐性需求，如错误处理、加载状态及权限校验。</span>
            </li>
            <li className="flex gap-2">
              <span className="text-china-red font-bold">03.</span>
              <span className="text-gray-600">统一使用领域驱动设计 (DDD) 术语进行描述。</span>
            </li>
          </ul>
        </div>

        {/* 侧栏卡片 2：词汇对照 */}
        <div className="bg-[#fffdf5] border border-gray-200 p-4 shadow-paper">
          <div className="text-china-red font-bold text-sm mb-3 text-center tracking-widest font-serif border-b border-china-red/20 pb-2">
            常用词汇对照表
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-xs font-serif">
            <div className="text-gray-500">点一下</div>
            <div className="text-right font-bold text-gray-800">Trigger Event</div>
            
            <div className="text-gray-500 border-t border-dashed border-gray-200 col-span-2 my-1"></div>

            <div className="text-gray-500">存起来</div>
            <div className="text-right font-bold text-gray-800">Persistence</div>

            <div className="text-gray-500 border-t border-dashed border-gray-200 col-span-2 my-1"></div>

            <div className="text-gray-500">卡住了</div>
            <div className="text-right font-bold text-gray-800">Latency / Block</div>
          </div>
        </div>

        {/* 引用装饰 */}
        <div className="bg-gray-800 p-4 text-center">
          <p className="italic text-gray-300 font-serif text-xs leading-loose">
            "代码是写给人看的，只是顺便能被机器执行。"
            <br/>
            <span className="not-italic text-gray-500 mt-1 block transform scale-90">—— 计算机科学箴言</span>
          </p>
        </div>
      </aside>
    </div>
  );
};

export default SupplementSection;