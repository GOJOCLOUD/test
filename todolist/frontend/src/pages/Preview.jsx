import React from 'react';
import useAppStore from '../store/useAppStore';
import TodoListCard from '../components/TodoListCard';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Preview = () => {
  const { todoList } = useAppStore();

  if (!todoList) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <p className="mb-4">暂无生成内容</p>
        <Link to="/" className="btn-black gap-2">
          <ArrowLeft size={16} />
          返回生成
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
         <Link to="/" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1 text-sm">
          <ArrowLeft size={14} />
          返回工作台
        </Link>
      </div>
      <TodoListCard />
    </div>
  );
};

export default Preview;