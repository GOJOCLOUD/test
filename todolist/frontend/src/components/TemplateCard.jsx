import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ArrowRight } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';

const TemplateCard = ({ template }) => {
  const { applyTemplate } = useAppStore();
  const navigate = useNavigate();

  const handleApply = () => {
    applyTemplate(template);
    navigate('/');
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="panel p-5 flex flex-col justify-between h-full"
    >
      <div>
        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 mb-4">
          <Layers size={20} />
        </div>
        <h3 className="font-bold text-lg text-zinc-900 mb-2">{template.name}</h3>
        <p className="text-zinc-500 text-sm mb-4">{template.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {template.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-md font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <button 
        onClick={handleApply}
        className="btn-ghost w-full group hover:border-zinc-300 hover:text-zinc-900"
      >
        应用此模板
        <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
      </button>
    </motion.div>
  );
};

export default TemplateCard;