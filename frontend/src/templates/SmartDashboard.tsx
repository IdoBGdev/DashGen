import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Card } from '../components/Card';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Sparkles, BrainCircuit, Activity, ChevronRight, Info, Menu, X, Download } from 'lucide-react';

interface WidgetConfig {
    id: string;
    type: string;
    title: string;
    data_key: string;
    description?: string;
    width: string;
}

interface SidebarItem {
    id: string;
    label: string;
    icon: string;
}

interface PageConfig {
    id: string;
    title: string;
    summary: string;
    widgets: WidgetConfig[];
}

interface ShellConfig {
    navbar_title: string;
    sidebar_items: SidebarItem[];
    primary_color: string;
}

interface MultiPageConfig {
    shell: ShellConfig;
    pages: PageConfig[];
}

interface SmartDashboardProps {
    data: any;
    config: MultiPageConfig;
    onExportCSV: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const IconRenderer = ({ name, className }: { name: string, className?: string }) => {
    const Icon = (LucideIcons as any)[name];
    return Icon ? <Icon className={className || "w-5 h-5"} /> : <Activity className={className || "w-5 h-5"} />;
};

const SmartDashboard: React.FC<SmartDashboardProps> = ({ data, config, onExportCSV }) => {
    const [activePageId, setActivePageId] = useState(config?.pages?.[0]?.id || "");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    if (!config || !config.pages) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-[2.5rem] border border-slate-100 shadow-sm animate-pulse">
                <BrainCircuit className="w-12 h-12 text-blue-100 mb-4" />
                <p className="text-slate-400 font-bold tracking-tight">AI is designing your dashboard project...</p>
            </div>
        );
    }

    const activePage = config.pages.find(p => p.id === activePageId) || config.pages[0];

    if (!activePage) return <div className="p-10 text-center font-bold">No pages generated.</div>;

    const renderWidget = (widget: WidgetConfig) => {
        // Smart Lookup: Check top level, then chart_data, then leaderboard
        const widgetData = data[widget.data_key] ||
            (data.chart_data && data.chart_data[widget.data_key]) ||
            (data.leaderboard && data.leaderboard[widget.data_key]) ||
            [];

        const colSpan = widget.width === 'full' ? 'lg:col-span-3' : widget.width === 'half' ? 'lg:col-span-1.5' : 'lg:col-span-1';

        switch (widget.type) {
            case 'kpi':
                const kpiKey = widget.title.toLowerCase().replace(/\s+/g, '_');
                const kpiValue = widget.data_key === 'stats'
                    ? (data.stats[kpiKey] !== undefined ? data.stats[kpiKey] : data.stats.mean)
                    : 0;
                return (
                    <div key={widget.id} className={`${colSpan} glass p-8 rounded-[2rem] border border-white/20 shadow-xl`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Metric</span>
                        </div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{widget.title}</h3>
                        <p className="text-4xl font-black mt-2 tracking-tighter text-slate-900">
                            {typeof kpiValue === 'number' ? kpiValue.toLocaleString(undefined, { maximumFractionDigits: 1 }) : kpiValue}
                        </p>
                    </div>
                );

            case 'bar':
                return (
                    <Card key={widget.id} title={widget.title} subtitle={widget.description} className={colSpan}>
                        <div className="h-[300px] w-full mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={widgetData}>
                                    <defs>
                                        <linearGradient id={`barGrad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" fill={`url(#barGrad-${widget.id})`} radius={[6, 6, 0, 0]}>
                                        {widgetData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={`url(#barGrad-${widget.id})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                );

            case 'pie':
                return (
                    <Card key={widget.id} title={widget.title} subtitle={widget.description} className={colSpan}>
                        <div className="h-[300px] w-full mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={widgetData}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name }) => name}
                                    >
                                        {widgetData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                );

            case 'insight':
                return (
                    <div key={widget.id} className={`${colSpan} bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group`}>
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center space-x-2 mb-4">
                                <BrainCircuit className="w-5 h-5 text-blue-200" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">AI Recommendation</span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight mb-4">{widget.title}</h3>
                            <p className="text-blue-50 font-medium leading-relaxed">
                                {widget.description || "The data suggests a strong correlation between these metrics. Consider optimizing the workflow to improve overall efficiency."}
                            </p>
                        </div>
                    </div>
                );

            case 'line':
                return (
                    <Card key={widget.id} title={widget.title} subtitle={widget.description} className={colSpan}>
                        <div className="h-[300px] w-full mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={widgetData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="label" fontSize={10} fontWeight={700} stroke="#94a3b8" axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: '#3b82f6' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                );

            case 'area':
                return (
                    <Card key={widget.id} title={widget.title} subtitle={widget.description} className={colSpan}>
                        <div className="h-[300px] w-full mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={widgetData}>
                                    <defs>
                                        <linearGradient id={`grad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="label" fontSize={10} fontWeight={700} stroke="#94a3b8" axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill={`url(#grad-${widget.id})`} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                );

            case 'leaderboard':
                const sortedData = [...widgetData].sort((a: any, b: any) => b.value - a.value).slice(0, 5);
                return (
                    <Card key={widget.id} title={widget.title} subtitle={widget.description} className={colSpan}>
                        <div className="space-y-4 mt-6">
                            {sortedData.map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                                            {i + 1}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex h-[800px] bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl animate-fade-in-up">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-slate-900 transition-all duration-300 flex flex-col`}>
                <div className="p-6 flex items-center justify-between text-white border-b border-white/10">
                    {isSidebarOpen && <span className="text-xl font-black tracking-tighter">DashFlow.</span>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {config.shell.sidebar_items.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActivePageId(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all
                                ${activePageId === item.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <IconRenderer name={item.icon} className="w-5 h-5" />
                            {isSidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/10">
                    <button
                        onClick={onExportCSV}
                        className="w-full flex items-center justify-center space-x-2 bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-all"
                    >
                        <Download className="w-4 h-4" />
                        {isSidebarOpen && <span>Export Data</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto">
                <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shadow-sm">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">{config.shell.navbar_title}</h2>
                    <div className="flex items-center space-x-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                            ))}
                        </div>
                        <button onClick={() => window.print()} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                        </button>
                    </div>
                </header>

                <div className="p-10 space-y-10">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Page Analysis</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{activePage.title}</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900">{activePage.title}</h1>
                        <p className="text-slate-500 font-medium max-w-3xl leading-relaxed italic">
                            "{activePage.summary}"
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                        {activePage.widgets?.map(renderWidget)}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SmartDashboard;
