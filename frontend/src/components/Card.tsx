import React from 'react';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, title, subtitle, className = "", noPadding = false }) => {
    return (
        <div className={`glass rounded-[2rem] overflow-hidden card-hover animate-fade-in-up shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-white/40 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl ${className}`}>
            {(title || subtitle) && (
                <div className="px-8 py-6 border-b border-slate-100/50">
                    {title && <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h3>}
                    {subtitle && <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>}
                </div>
            )}
            <div className={noPadding ? '' : 'p-8'}>
                {children}
            </div>
        </div>
    );
};

interface MetricCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'blue' | 'green' | 'purple' | 'orange';
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, subValue, trend, color = "blue" }) => {
    const themes = {
        blue: "from-blue-50 to-indigo-50 text-blue-600 border-blue-100",
        green: "from-emerald-50 to-teal-50 text-emerald-600 border-emerald-100",
        purple: "from-purple-50 to-fuchsia-50 text-purple-600 border-purple-100",
        orange: "from-orange-50 to-amber-50 text-orange-600 border-orange-100",
    };

    const trendColors = {
        up: "text-emerald-600 bg-emerald-100",
        down: "text-rose-600 bg-rose-100",
        neutral: "text-slate-500 bg-slate-100",
    };

    return (
        <div className={`bg-gradient-to-br ${themes[color]} rounded-3xl p-8 border shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in-up`}>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</h4>
            <div className="mt-4 flex items-end justify-between">
                <div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter">{value}</div>
                    {subValue && <p className="mt-1 text-sm font-semibold opacity-70">{subValue}</p>}
                </div>
                {trend && (
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${trendColors[trend]}`}>
                        {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trend}
                    </div>
                )}
            </div>
        </div>
    );
};
