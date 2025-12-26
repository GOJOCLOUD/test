import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2,
  BookOpen,
  Cpu,
  BarChart3
} from 'lucide-react';

const EngineeringSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('architecture');

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
                后端开发专栏
              </h2>
            </div>
            <div className="text-xs text-gray-400 font-serif border border-gray-200 px-2 py-1 rounded bg-gray-50">
              第 B-01 版：后端技术
            </div>
          </div>

          {/* 分类导航 */}
          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'architecture', name: '架构设计' },
              { id: 'development', name: '开发实践' },
              { id: 'optimization', name: '性能优化' },
              { id: 'standards', name: '工程规范' }
            ].map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  px-5 py-1.5 rounded-sm border-2 font-serif font-bold text-sm
                  transition-all duration-300
                  ${selectedCategory === category.id
                    ? 'bg-china-red border-china-red text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-china-red hover:text-china-red'}
                `}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* 内容区域 */}
          <div className="space-y-6">
            {/* 架构设计内容 */}
            {selectedCategory === 'architecture' && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-china-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="text-china-red w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-ink font-serif mb-2">分布式系统架构演进</h3>
                    <p className="text-gray-700 font-serif leading-relaxed">
                      随着业务规模的不断扩大，传统的单体架构已经无法满足系统的高可用性和可扩展性需求。分布式系统架构通过将系统拆分为多个独立的服务，实现了服务的独立部署、扩展和维护，从而提高了系统的整体性能和可靠性。
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                      <span>作者：架构设计团队</span>
                      <span>·</span>
                      <span>2025-11-29</span>
                      <span>·</span>
                      <span>阅读时长：5 分钟</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 border-l-4 border-china-red">
                  <h4 className="font-bold text-gray-800 font-serif mb-2">核心要点</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 font-serif text-sm">
                    <li>服务拆分原则：按业务领域划分，避免过度拆分</li>
                    <li>通信机制：同步调用与异步消息的合理选择</li>
                    <li>数据一致性：CAP 理论与最终一致性的实践</li>
                    <li>服务治理：注册中心、配置中心、熔断降级</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 开发实践内容 */}
            {selectedCategory === 'development' && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-china-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="text-china-red w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-ink font-serif mb-2">现代后端开发最佳实践</h3>
                    <p className="text-gray-700 font-serif leading-relaxed">
                      现代后端开发已经从简单的API编写演变为复杂的系统设计，涉及到微服务架构、容器化部署、DevOps实践等多个方面。本文将介绍现代后端开发的最佳实践，帮助开发者提高开发效率和系统质量。
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                      <span>作者：后端开发团队</span>
                      <span>·</span>
                      <span>2025-11-28</span>
                      <span>·</span>
                      <span>阅读时长：4 分钟</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 p-3">
                    <h4 className="font-bold text-gray-800 font-serif mb-1 text-sm">微服务架构</h4>
                    <p className="text-gray-600 font-serif text-xs leading-relaxed">
                      采用微服务架构，将系统拆分为多个独立的服务，提高系统的可扩展性和可维护性。
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 p-3">
                    <h4 className="font-bold text-gray-800 font-serif mb-1 text-sm">容器化部署</h4>
                    <p className="text-gray-600 font-serif text-xs leading-relaxed">
                      使用Docker和Kubernetes进行容器化部署，提高部署效率和环境一致性。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 性能优化内容 */}
            {selectedCategory === 'optimization' && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-china-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Cpu className="text-china-red w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-ink font-serif mb-2">后端性能优化策略</h3>
                    <p className="text-gray-700 font-serif leading-relaxed">
                      性能优化是后端开发过程中的重要环节，直接影响系统的吞吐量和响应时间。本文将介绍后端性能优化的常用策略和方法，帮助开发者识别和解决系统性能瓶颈。
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                      <span>作者：性能优化团队</span>
                      <span>·</span>
                      <span>2025-11-27</span>
                      <span>·</span>
                      <span>阅读时长：6 分钟</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4">
                  <h4 className="font-bold text-gray-800 font-serif mb-2">优化步骤</h4>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700 font-serif text-sm">
                    <li>性能测试与瓶颈识别</li>
                    <li>代码层面优化</li>
                    <li>数据库优化</li>
                    <li>缓存策略优化</li>
                    <li>服务器配置优化</li>
                    <li>负载均衡与扩容</li>
                  </ol>
                </div>
              </div>
            )}

            {/* 工程规范内容 */}
            {selectedCategory === 'standards' && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-china-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="text-china-red w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-ink font-serif mb-2">后端开发规范手册</h3>
                    <p className="text-gray-700 font-serif leading-relaxed">
                      统一的后端开发规范是保证团队协作效率和代码质量的重要基础。本文将介绍后端开发的各项规范，包括代码规范、命名规范、API设计规范等，帮助开发者养成良好的开发习惯。
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                      <span>作者：质量管理团队</span>
                      <span>·</span>
                      <span>2025-11-26</span>
                      <span>·</span>
                      <span>阅读时长：7 分钟</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white border border-gray-200 p-3">
                    <h4 className="font-bold text-gray-800 font-serif mb-1 text-sm">代码规范</h4>
                    <p className="text-gray-600 font-serif text-xs leading-relaxed">
                      统一的代码格式和风格，提高代码的可读性和可维护性。
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 p-3">
                    <h4 className="font-bold text-gray-800 font-serif mb-1 text-sm">API设计</h4>
                    <p className="text-gray-600 font-serif text-xs leading-relaxed">
                      RESTful API设计原则，统一的接口规范和版本管理。
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 p-3">
                    <h4 className="font-bold text-gray-800 font-serif mb-1 text-sm">文档规范</h4>
                    <p className="text-gray-600 font-serif text-xs leading-relaxed">
                      完整、准确的文档，便于团队协作和知识传承。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 右侧侧边栏 - 占 25% */}
      <aside className="lg:w-1/4 space-y-6">
        
        {/* 侧栏卡片 1：后端动态 */}
        <div className="bg-white border-t-4 border-t-china-red border-l border-r border-b border-gray-200 p-5 shadow-paper">
          <div className="text-china-red font-bold text-lg mb-4 pb-2 border-b border-gray-100 font-serif">
            后端动态
          </div>
          <ul className="space-y-3 text-sm font-serif text-ink leading-snug">
            <li className="hover:text-china-red cursor-pointer">· 分布式系统架构升级完成</li>
            <li className="hover:text-china-red cursor-pointer">· 微服务治理平台正式上线</li>
            <li className="hover:text-china-red cursor-pointer">· 数据库性能优化项目取得阶段性成果</li>
            <li className="hover:text-china-red cursor-pointer">· 后端开发规范手册 V2.0 发布</li>
          </ul>
        </div>

        {/* 引用装饰 */}
        <div className="bg-china-red p-4 text-center">
          <p className="italic text-white font-serif text-xs leading-loose">
            "优秀的后端工程师，不仅要能写出高效的代码，更要能设计出可靠、可扩展的系统。"
            <br/>
            <span className="not-italic text-red-200 mt-1 block transform scale-90">—— 后端开发理念</span>
          </p>
        </div>
      </aside>
    </div>
  );
};

export default EngineeringSection;