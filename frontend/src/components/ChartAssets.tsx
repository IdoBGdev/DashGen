import React from 'react';

export const ChartGradients = () => (
    <svg style={{ height: 0, width: 0, position: 'absolute' }} aria-hidden="true">
        <defs>
            <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorViolet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
        </defs>
    </svg>
);

export const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm font-bold text-slate-700">
                            {entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};
