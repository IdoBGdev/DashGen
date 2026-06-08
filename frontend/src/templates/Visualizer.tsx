import React, { useState } from 'react';
import { ChartGradients, CustomTooltip } from '../components/ChartAssets';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Filter, Download } from 'lucide-react';
import { Card } from '../components/Card';

interface VisualizerProps {
    data: any;
    onExportCSV: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4'];

const Visualizer: React.FC<VisualizerProps> = ({ data, onExportCSV }) => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans relative">
            <ChartGradients />

            {/* Top Left: Pie Chart */}
            <Card className="h-[450px] !rounded-[2.5rem] relative">
                <button
                    onClick={onExportCSV}
                    className="absolute top-8 right-8 z-20 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                    title="Export Data"
                >
                    <Download className="w-4 h-4" />
                </button>
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
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-xs font-bold text-slate-500">{value}</span>} />
                    </PieChart>
                </ResponsiveContainer>
            </Card>

            {/* Top Right: Bar Chart */}
            <Card className="h-[450px] !rounded-[2.5rem]">
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Magnitudes</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 text-emerald-600">Discrete Comparison</p>
                <ResponsiveContainer width="100%" height="70%">
                    <BarChart data={chart_data} barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" fontSize={10} fontWeight={800} stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} />
                        <YAxis fontSize={10} fontWeight={800} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="value" fill="url(#colorEmerald)" radius={[8, 8, 8, 8]} />
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
                        <XAxis dataKey="label" fontSize={10} fontWeight={800} stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} />
                        <YAxis fontSize={10} fontWeight={800} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="value" stroke="url(#colorViolet)" strokeWidth={4} dot={{ r: 4, strokeWidth: 0, fill: '#8b5cf6' }} activeDot={{ r: 6, strokeWidth: 2, fill: 'white', stroke: '#8b5cf6' }} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Bottom Right: Area Chart */}
            <Card className="h-[450px] !rounded-[2.5rem]">
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Volumes</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 text-rose-600">Cumulative Density</p>
                <ResponsiveContainer width="100%" height="70%">
                    <AreaChart data={chart_data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" fontSize={10} fontWeight={800} stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} />
                        <YAxis fontSize={10} fontWeight={800} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorRose)" />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export default Visualizer;
