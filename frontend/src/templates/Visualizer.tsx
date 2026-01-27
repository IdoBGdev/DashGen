import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Filter } from 'lucide-react';
import { Card } from '../components/Card';

interface VisualizerProps {
    data: any;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4'];

const Visualizer: React.FC<VisualizerProps> = ({ data }) => {
    const availableKeys = Object.keys(data.chart_data || {}).filter(k => k.includes(' by '));
    // If no complex keys, fall back to simple ones
    const keysToShow = availableKeys.length > 0 ? availableKeys : Object.keys(data.chart_data || {});

    const [activeKey, setActiveKey] = useState(keysToShow[0] || '');
    const chart_data = (data.chart_data && data.chart_data[activeKey]) || data.chart_data_legacy || [];

    const CustomHeader = ({ title, icon: Icon, color }: any) => (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-slate-800 tracking-tight">{title}</h4>
            </div>
            {keysToShow.length > 1 && title === 'Composition' && (
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={activeKey}
                        onChange={(e) => setActiveKey(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        {keysToShow.map(key => (
                            <option key={key} value={key}>{key}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Top Left: Pie Chart */}
            <Card className="h-[450px] !rounded-[2.5rem]">
                <CustomHeader title="Composition" icon={(() => null)} color="bg-blue-500" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 text-blue-600">Proportional Analysis</p>
                <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                        <Pie
                            data={chart_data}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={8}
                        >
                            {(chart_data || []).map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </Card>

            {/* Top Right: Bar Chart */}
            <Card className="h-[450px] !rounded-[2.5rem]">
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Magnitudes</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 text-emerald-600">Discrete Comparison</p>
                <ResponsiveContainer width="100%" height="70%">
                    <BarChart data={chart_data}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" fontSize={10} fontWeight={800} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} fontWeight={800} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 8, 8]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Bottom Left: Line Chart */}
            <Card className="h-[450px] !rounded-[2.5rem]">
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Continuity</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 text-indigo-600">Sequence Mapping</p>
                <ResponsiveContainer width="100%" height="70%">
                    <LineChart data={chart_data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" fontSize={10} fontWeight={800} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} fontWeight={800} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, strokeWidth: 0, fill: '#6366f1' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Bottom Right: Area Chart */}
            <Card className="h-[450px] !rounded-[2.5rem]">
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Volumes</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 text-rose-600">Cumulative Density</p>
                <ResponsiveContainer width="100%" height="70%">
                    <AreaChart data={chart_data}>
                        <defs>
                            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" fontSize={10} fontWeight={800} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} fontWeight={800} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorArea)" />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export default Visualizer;
