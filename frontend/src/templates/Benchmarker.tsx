import React, { useState } from 'react';
import { ChartGradients, CustomTooltip } from '../components/ChartAssets';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card } from '../components/Card';
import { Trophy, ArrowUp, ArrowDown, Activity, Star, Download } from 'lucide-react';

interface BenchmarkerProps {
    data: any;
    onExportCSV: () => void;
}

const Benchmarker: React.FC<BenchmarkerProps> = ({ data, onExportCSV }) => {
    const { stats } = data;

    // Get keys that have leaderboard data
    const availableKeys = Object.keys(data.leaderboard || {}).filter(k => k.includes(' by '));
    const keysToShow = availableKeys.length > 0 ? availableKeys : Object.keys(data.leaderboard || {});

    const [activeKey, setActiveKey] = useState(keysToShow[0] || '');

    const leaderboard = (data.leaderboard && data.leaderboard[activeKey]) || data.leaderboard_legacy || [];

    // Calculate a dynamic median if we are in a sub-group if possible, else fallback to global
    // Ideally backend would provide stats per group too, but for now we stick to global or just calc on fly
    // simplifying: just use the global median for now as "Benchmark"

    const enhancedLeaderboard = (leaderboard || []).map((item: any) => {
        const value = Object.values(item).find(v => typeof v === 'number') as number;
        const label = Object.values(item).find(v => typeof v === 'string') as string;
        return {
            label,
            value,
            diff: (value != null && stats.median != null) ? value - stats.median : 0
        };
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans relative">
            <ChartGradients />
            {/* Left: Horizontal Bar Chart Leaderboard */}
            <Card title="Market Standings" subtitle="Entity comparison against median performance" className="!rounded-[2.5rem] relative">
                <button
                    onClick={onExportCSV}
                    className="absolute top-8 right-32 flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all z-20"
                >
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                </button>
                {keysToShow.length > 1 && (
                    <div className="absolute top-8 right-8 flex items-center space-x-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm z-10">
                        <select
                            value={activeKey}
                            onChange={(e) => setActiveKey(e.target.value)}
                            className="bg-transparent text-slate-600 text-xs font-bold uppercase tracking-wider pr-2 outline-none cursor-pointer"
                        >
                            {keysToShow.map(key => (
                                <option key={key} value={key}>{key}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="h-[550px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={enhancedLeaderboard}
                            margin={{ left: 20, right: 20 }}
                        >
                            <defs>
                                <linearGradient id="posGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                                </linearGradient>
                                <linearGradient id="negGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#d97706" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="label" type="category" fontSize={10} fontWeight={800} width={100} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                            <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={24}>
                                {enhancedLeaderboard.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.diff >= 0 ? 'url(#posGradient)' : 'url(#negGradient)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Right: Insights & Comparison */}
            <div className="space-y-8">
                <div className="glass-dark rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>

                    <div className="relative z-10">
                        <div className="bg-blue-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/30">
                            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        </div>
                        <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Prime Entity</h3>
                        <p className="text-5xl font-black tracking-tighter leading-tight">
                            {enhancedLeaderboard[0]?.label || 'Unranked'}
                        </p>
                        <div className="mt-6 flex items-center bg-white/5 w-fit px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
                            <ArrowUp className="w-4 h-4 mr-2 text-emerald-400" />
                            <span className="text-sm font-bold text-slate-200">
                                +{enhancedLeaderboard[0]?.diff.toFixed(2) || '0'} above median
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="glass rounded-[2rem] p-8">
                        <div className="flex items-center text-emerald-600 font-black text-[10px] mb-6 uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-lg shadow-emerald-500/50"></div>
                            Leading Alpha
                        </div>
                        <div className="space-y-4">
                            {enhancedLeaderboard.filter((i: any) => i.diff > 0).slice(0, 3).map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{item.label}</span>
                                    <span className="text-sm font-black text-emerald-600">+{item.diff.toFixed(1)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-[2rem] p-8">
                        <div className="flex items-center text-orange-600 font-black text-[10px] mb-6 uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mr-2 shadow-lg shadow-orange-500/50"></div>
                            Delta Lows
                        </div>
                        <div className="space-y-4">
                            {enhancedLeaderboard.filter((i: any) => i.diff <= 0).slice(-3).reverse().map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{item.label}</span>
                                    <span className="text-sm font-black text-orange-600">{item.diff.toFixed(1)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-inner">
                    <h4 className="font-black flex items-center text-white text-sm uppercase tracking-widest mb-4">
                        <Activity className="w-4 h-4 mr-2 text-blue-500" />
                        Benchmarking Protocol
                    </h4>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">
                        Entities are ranked against the global median of {stats.median != null ? stats.median.toFixed(2) : "N/A"}.
                        Positive delta indicates efficiency optimization, while negative delta suggests
                        a transition opportunity.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Benchmarker;
