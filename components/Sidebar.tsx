
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeView, onViewChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge-high', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT] },
    { id: 'my-courses', label: 'My Courses', icon: 'fa-book-open', roles: [UserRole.STUDENT] },
    { id: 'manage-courses', label: 'Manage Courses', icon: 'fa-book-bookmark', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'students', label: 'Students', icon: 'fa-users', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'instructors', label: 'Instructors', icon: 'fa-chalkboard-user', roles: [UserRole.ADMIN] },
    { id: 'revenue', label: 'Revenue', icon: 'fa-money-bill-trend-up', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { id: 'ai-tools', label: 'AI Assistant', icon: 'fa-robot', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT] },
    { id: 'settings', label: 'Settings', icon: 'fa-sliders', roles: [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed left-0 top-0 z-30 transition-all md:translate-x-0 -translate-x-full">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
            <i className="fa-solid fa-graduation-cap text-xl"></i>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">EduPro <span className="text-indigo-600">AI</span></span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {filteredItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeView === item.id 
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all font-medium"
        >
          <i className="fa-solid fa-right-from-bracket w-5"></i>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
