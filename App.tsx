import React, { useState } from 'react';
import { 
  Map, Users, Leaf, Heart, DollarSign, 
  Scale, Infinity as InfinityIcon, Menu, Calculator
} from 'lucide-react';
import { DATA_SOURCE_OF_TRUTH } from './data';
import IndicatorRenderer from './components/IndicatorRenderer';
import StoryBox from './components/StoryBox';
import { Indicator } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('geografia');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'geografia', label: '1. Geografía', icon: Map },
    { id: 'poblacion', label: '2. Población', icon: Users },
    { id: 'ambiental', label: '3. Ambiental', icon: Leaf },
    { id: 'social', label: '4. Social', icon: Heart },
    { id: 'economica', label: '5. Economía', icon: DollarSign },
    { id: 'gobernanza', label: '6. Gobernanza', icon: Scale },
    { id: 'sostenibilidad', label: '7. Sostenibilidad', icon: InfinityIcon },
    { id: 'sroi', label: '8. SROI', icon: Calculator }, 
  ];

  const currentCategory = DATA_SOURCE_OF_TRUTH[activeTab];

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 font-sans overflow-hidden selection:bg-emerald-500/30">
        
      {/* Sidebar Navigation */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#0f172a] border-r border-slate-800 transition-all duration-300 flex flex-col z-30 shadow-2xl`}>
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
          {isSidebarOpen && (
             <div className="flex items-center gap-2 animate-in fade-in duration-300">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-1.5 rounded-lg shadow-lg shadow-emerald-900/40">
                   <Leaf size={18} className="text-white" />
                </div>
                <div>
                   <h1 className="font-bold text-lg tracking-tight text-white leading-none">BanCO2</h1>
                   <p className="text-[10px] text-slate-500 font-medium tracking-wide">DASHBOARD</p>
                </div>
             </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <Menu size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group relative overflow-hidden text-sm mb-1
                ${activeTab === item.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:pl-4'}`}
            >
              <item.icon size={18} className={`transition-transform duration-300 ${activeTab === item.id ? 'text-emerald-400 scale-110' : 'group-hover:text-slate-200'}`} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              {activeTab === item.id && <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_10px_#34d399]"></div>}
            </button>
          ))}
        </nav>
          
        {isSidebarOpen && (
           <div className="p-4 mt-auto border-t border-slate-800 bg-[#0b1120]">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">FUENTE: ENCUESTA PSA</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                 Esta visualización refleja el estado real de 80 familias guardabosques.
              </p>
           </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="px-8 py-8 z-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800/40 bg-[#020617]/80 backdrop-blur-md sticky top-0 transition-all duration-300">
          <div className="animate-in slide-in-from-left-2 duration-500">
             <div className="flex items-center gap-2 mb-1">
                <span className="text-emerald-500 font-mono text-xs px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10">CATALOG-{currentCategory.id}</span>
             </div>
             <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">{currentCategory.title}</h2>
             <p className="text-slate-400 text-sm mt-1 max-w-2xl font-light">{currentCategory.description}</p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-500">
             <span>TOTAL INDICADORES: <span className="text-slate-300">{currentCategory.indicators.length}</span></span>
             <span className="text-slate-700">|</span>
             <span>ACTUALIZADO: <span className="text-slate-300">NOV 2025</span></span>
          </div>
        </header>

        {/* Scrollable Content - Grid System */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 z-10 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
            {currentCategory.indicators.map((indicator: Indicator, index: number) => (
              <div 
                key={indicator.id} 
                className={`bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-lg hover:shadow-2xl hover:border-slate-600 transition-all duration-300 group flex flex-col relative overflow-hidden hover:-translate-y-1 ${indicator.type === 'sroi_evidence_table' || indicator.id === 'SR3' || indicator.id === 'SR4' || indicator.id === 'SR5' ? 'xl:col-span-2' : ''} ${indicator.type === 'sroi_balance_chart' ? 'xl:col-span-3 bg-slate-900/50' : ''}`}
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s backwards` }}
              >
                {/* Header Card */}
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-800/50">
                  <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 bg-slate-800 rounded text-slate-400 text-xs font-bold border border-slate-700 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                        {indicator.id}
                      </span>
                      <h3 className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors leading-tight">{indicator.title}</h3>
                  </div>
                  {/* Status Dot */}
                  <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)] ${indicator.isAlert ? 'bg-red-500 animate-pulse shadow-red-500/50' : 'bg-slate-700'}`}></div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col justify-center min-h-[180px]">
                   <IndicatorRenderer indicator={indicator} />
                </div>

                {/* Insight Footer */}
                <div className="mt-5 pt-2">
                   <StoryBox 
                     title={indicator.story.title} 
                     text={indicator.story.text} 
                     type={indicator.story.type || (indicator.isAlert ? 'alert' : 'info')} 
                   />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
          
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
      `}</style>
    </div>
  );
}