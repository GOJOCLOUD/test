import React, { useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import TemplateCard from '../components/TemplateCard';
import { Plus } from 'lucide-react';

const Templates = () => {
  const { templates, fetchTemplates, loading } = useAppStore();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">策略模板库</h1>
          <p className="text-slate-500">选择预设的架构模式来加速生成</p>
        </div>
        <button className="btn-black gap-2">
          <Plus size={18} />
          自定义模板
        </button>
      </div>

      {loading.templates ? (
        <div className="text-center py-20 text-slate-400">加载模板中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(t => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Templates;