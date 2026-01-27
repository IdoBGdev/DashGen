import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card } from '../components/Card';
import { Table, Search, Filter, Download, Database, ChevronRight } from 'lucide-react';

interface AnalystProps {
    data: any;
}

const Analyst: React.FC<AnalystProps> = ({ data }) => {
    const { stats, distribution_data, raw_preview } = data;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                <div className="glass-dark rounded-[2.5rem] p-8 text-white">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center">
                        <Database className="w-3 h-3 mr-2 text-blue-400" /> Statistical Core
                    </h3>
                    <div className="space-y-8">
                        <div className="group">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Standard Deviation</p>
                            <p className="text-3xl font-black tracking-tighter">{stats.std_dev != null ? stats.std_dev.toFixed(4) : "N/A"}</p>
                        </div>
                        <div className="group">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Data Variance</p>
                            <p className="text-3xl font-black tracking-tighter">{stats.std_dev != null ? (stats.std_dev ** 2).toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="group">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Range Delta</p>
                            <p className="text-3xl font-black tracking-tighter">{(stats.max != null && stats.min != null) ? (stats.max - stats.min).toFixed(1) : "N/A"}</p>
                        </div>
                    </div>
                </div>

                <Card title="Distribution" subtitle="Data density mapping" className="!rounded-[2.5rem]">
                    <div className="h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distribution_data}>
                                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                                <XAxis dataKey="label" hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Main Area */}
            <div className="lg:col-span-3 space-y-8">
                <div className="glass !bg-white/80 rounded-[2.5rem] overflow-hidden">
                    <div className="px-10 py-8 border-b border-slate-100/50 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center">
                                <Table className="w-6 h-6 mr-3 text-blue-600" />
                                Raw Data Lake
                            </h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">Inspecting first {(raw_preview || []).length} localized nodes</p>
                        </div>
                        <div className="flex space-x-3">
                            <button className="btn-secondary !py-2 !px-4 !rounded-xl flex items-center text-xs font-bold">
                                <Filter className="w-3.5 h-3.5 mr-2" /> Filter
                            </button>
                            <button className="btn-primary !py-2 !px-4 !rounded-xl flex items-center text-xs font-bold">
                                <Download className="w-3.5 h-3.5 mr-2" /> Export
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    {Object.keys((raw_preview || [])[0] || {}).map((key) => (
                                        <th key={key} className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(raw_preview || []).map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                                        {Object.values(row).map((val: any, j: number) => (
                                            <td key={j} className="px-8 py-5 whitespace-nowrap text-sm text-slate-600 font-bold tracking-tight">
                                                {typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center">
                        View all {stats.count} records <ChevronRight className="w-3 h-3 ml-2" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analyst;
