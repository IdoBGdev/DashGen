import React from 'react';
import { ChartGradients, CustomTooltip } from '../components/ChartAssets';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { MetricCard, Card } from '../components/Card';
import { TrendingUp, Zap, Target, Layers, Download } from 'lucide-react';

interface ExecutiveProps {
    data: any;
    onExportCSV: () => void;
}

const Executive: React.FC<ExecutiveProps> = ({ data, onExportCSV }) => {
    const { stats, chart_data } = data;

    const displayStability = (stats.std_dev && stats.mean && stats.mean !== 0)
        ? ((1 - (stats.std_dev / stats.mean)) * 100).toFixed(1)
        : '-';

    return (
        <div className="space-y-10 font-sans relative">
            <ChartGradients />

            {/* Header & Scorecards */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900">Executive Overview</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">High-Level Performance Metrics</p>
                </div>
                <button
                    onClick={onExportCSV}
                    className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    label="Total Volumne"
                    value={stats.count?.toLocaleString() ?? '0'}
                    color="blue"
                    trend="neutral"
                />
                <MetricCard
                    label="Performance Mean"
                    value={stats.mean?.toFixed(2) ?? '-'}
                    color="green"
                    trend="up"
                />
                <MetricCard
                    label="Median Baseline"
                    value={stats.median?.toFixed(2) ?? '-'}
                    color="purple"
                />
                <MetricCard
                    label="Peak Threshold"
                    value={stats.max?.toFixed(2) ?? '-'}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trend Area */}
                <Card title="Structural Trend" subtitle="Dynamic metric progression across components" className="lg:col-span-2 !rounded-[2.5rem]">
                    <div className="h-[400px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chart_data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} fontWeight={800} tickLine={false} axisLine={false} dy={10} />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorBlue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Quick Stats Sidebar */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="text-blue-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center">
                            <Zap className="w-3 h-3 mr-2" /> Stability Index
                        </h4>
                        <div className="text-5xl font-black tracking-tighter">
                            {displayStability}%
                        </div>
                        <p className="mt-4 text-slate-400 text-sm font-medium leading-relaxed">
                            Based on a standard deviation of <span className="text-white font-bold">{stats.std_dev?.toFixed(2) ?? '-'}</span>, your dataset shows high structural integrity.
                        </p>
                        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 uppercase font-black">Min</p>
                                <p className="text-lg font-bold">{stats.min?.toFixed(1) ?? '-'}</p>
                            </div>
                            <div className="text-center border-x border-slate-800 px-6">
                                <p className="text-[10px] text-slate-500 uppercase font-black">Range</p>
                                <p className="text-lg font-bold">{(stats.max && stats.min) ? (stats.max - stats.min).toFixed(1) : '-'}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 uppercase font-black">Coeff</p>
                                <p className="text-lg font-bold">{(stats.std_dev && stats.mean) ? (stats.std_dev / stats.mean).toFixed(2) : '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <Target className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Target Reached</p>
                                <p className="text-sm font-black text-slate-800">84.2% Optimization</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <Layers className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Data Density</p>
                                <p className="text-sm font-black text-slate-800">{stats.count} Distinct Nodes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Executive;