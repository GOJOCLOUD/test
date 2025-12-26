import React, { useState, useRef, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import ProgressBar from './ProgressBar';
import { 
  PenTool, 
  Target, 
  ChevronDown, 
  Zap, 
  Layers, 
  CheckCircle // 新增图标
} from 'lucide-react';

// 定义四种模式的配置
const PRECISION_MODES = [
  { 
    id: 'simple', 
    label: '简单模式', 
    icon: Zap, 
    desc: '快速概览，抓取核心' 
  },
  { 
    id: 'normal', 
    label: '普通模式', 
    icon: Target, 
    desc: '标准流程，均衡调研' 
  },
  { 
    id: 'deep', 
    label: '深度模式', 
    icon: Layers, 
    desc: '全面挖掘，多维剖析' 
  },
  { 
    id: 'complete', 
    label: '我有完整思路', 
    icon: CheckCircle, 
    desc: '跳过提问，直接生成' // 新增模式描述
  }
];

const InputPanel = () => {
  const { 
    userInput, 
    setUserInput, 
    executeFullTask,
    loading, 
    taskProgress,
    precisionMode,
    setPrecisionMode
  } = useAppStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 默认回退到普通模式，防止未匹配情况
  const selectedMode = PRECISION_MODES.find(mode => mode.id === precisionMode) || PRECISION_MODES[1];
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModeSelect = (mode) => {
    setPrecisionMode(mode.id);
    setIsDropdownOpen(false);
  };

  // 动态计算按钮文字
  const getButtonText = () => {
    if (loading.questions || loading.report) return "正在执行..."; // 假设store里有loading.report
    if (selectedMode.id === 'complete') return "直接生成报告";
    return "下达调研任务";
  };

  return (
    <section className="mb-10">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-ink mb-2 tracking-tight">
          全面推进智能化工程架构建设
        </h2>
        <div className="flex items-center justify-center gap-4 text-sm text-sub-text font-serif">
          <span>本报评论员</span>
          <span>|</span>
          <span>{new Date().toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      <div className="official-card border-t-4 border-t-china-red overflow-visible">
        
        {/* --- 标题与精度选择栏 --- */}
        <div className="flex items-center justify-between mb-4 relative z-20">
          <div className="flex items-center gap-2">
            <PenTool className="text-china-red w-5 h-5" />
            <h3 className="text-lg font-bold text-china-red tracking-widest">
              工作部署
            </h3>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all duration-200
                ${isDropdownOpen 
                  ? 'bg-red-50 border-china-red text-china-red' 
                  : 'bg-transparent border-transparent hover:bg-gray-50 text-gray-600'
                }`}
            >
              <selectedMode.icon className="w-4 h-4" />
              <span className="font-serif font-bold text-sm tracking-wide">
                {selectedMode.label}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* 下拉菜单 */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="py-1">
                  {PRECISION_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleModeSelect(mode)}
                      className={`w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-red-50 transition-colors group
                        ${selectedMode.id === mode.id ? 'bg-red-50/50' : ''}
                      `}
                    >
                      <mode.icon className={`w-4 h-4 mt-0.5 ${selectedMode.id === mode.id ? 'text-china-red' : 'text-gray-400 group-hover:text-china-red'}`} />
                      <div>
                        <div className={`text-sm font-serif font-medium ${selectedMode.id === mode.id ? 'text-china-red' : 'text-gray-700'}`}>
                          {mode.label}
                        </div>
                        <div className="text-xs text-gray-400 scale-90 origin-top-left mt-0.5">
                          {mode.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 输入框 */}
        <div className="bg-news-bg border border-gray-300 p-4 mb-4 relative z-10">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={
              selectedMode.id === 'complete' 
              ? "请输入完整的项目思路和详细要求，系统将直接基于此生成方案..." 
              : `请输入项目建设需求（当前为${selectedMode.label}）...`
            }
            className="w-full bg-transparent border-none outline-none text-lg leading-loose font-serif text-ink placeholder:text-gray-400 min-h-[140px] resize-none"
          />
        </div>

        {/* 底部按钮栏 */}
        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
          <span className="text-xs text-gray-400 font-sans">
            {selectedMode.id === 'complete' 
              ? "* 此模式下不再进行AI追问，请确保输入信息足够完整。"
              : "* 请详细描述建设目标，确保任务落实到位。"
            }
          </span>
          <button 
            onClick={executeFullTask}
            disabled={loading.questions || !userInput}
            className="btn-official"
          >
            {getButtonText()}
          </button>
        </div>

        <ProgressBar 
          progress={taskProgress.progress}
          isVisible={taskProgress.isVisible}
          currentStep={taskProgress.currentStep}
        />
      </div>
    </section>
  );
};

export default InputPanel;