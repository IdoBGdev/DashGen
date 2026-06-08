import React, { useState } from 'react';
import axios from 'axios';
import { FileUpload } from './components/FileUpload';
import { Card } from './components/Card';
import ExecutiveTemplate from './templates/Executive';
import AnalystTemplate from './templates/Analyst';
import BenchmarkerTemplate from './templates/Benchmarker';
import VisualizerTemplate from './templates/Visualizer';
import SmartDashboardTemplate from './templates/SmartDashboard';
import { LayoutDashboard, BarChart3, PieChart, LineChart, Settings2, RefreshCw, UploadCloud, ChevronRight, Play, Sparkles, Download } from 'lucide-react';

const API_BASE = 'http://localhost:8001';

const App = () => {
    const [step, setStep] = useState<'IDLE' | 'UPLOADED' | 'RENDERED'>('IDLE');
    const [isProcessing, setIsProcessing] = useState(false);

    const [schema, setSchema] = useState<any>(null);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [fileName, setFileName] = useState<string>('');

    const [targetCols, setTargetCols] = useState<string[]>([]);
    const [groupByCol, setGroupByCol] = useState<string>('');
    const [activeTemplate, setActiveTemplate] = useState('executive');
    const [smartConfig, setSmartConfig] = useState<any>(null);

    const handleFileUpload = async (file: File) => {
        setIsProcessing(true);
        setFileName(file.name);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${API_BASE}/upload`, formData);
            setSchema(res.data);
            const numerics = res.data.columns.filter((c: any) => c.type === 'numeric');
            if (numerics.length > 0) setTargetCols([numerics[0].name]);
            const firstCat = res.data.columns.find((c: any) => c.type === 'categorical');
            if (firstCat) setGroupByCol(firstCat.name);
            setStep('UPLOADED');
        } catch (err) {
            console.error(err);
            alert("Connection error. Ensure backend is at http://localhost:8000");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleProcess = async () => {
        if (targetCols.length === 0) return alert("Please select at least one KPI");
        setIsProcessing(true);
        try {
            const res = await axios.post(`${API_BASE}/process`, {
                target_columns: targetCols,
                group_by: groupByCol || null
            });
            setDashboardData(res.data);

            // Fetch LLM Config
            try {
                const configRes = await axios.post(`${API_BASE}/generate-config`, {
                    target_columns: targetCols,
                    group_by: groupByCol || null,
                    stats: res.data.stats, // Ensure this matches the Dict expected by backend
                    data_preview: res.data.raw_preview.slice(0, 5),
                    full_schema: res.data.full_schema,
                    chart_keys: Object.keys(res.data.chart_data || {})
                });
                setSmartConfig(configRes.data);
            } catch (llmErr) {
                console.error("LLM Config failed", llmErr);
            }

            setTimeout(() => setStep('RENDERED'), 300); // Smoother transition
        } catch (err) {
            console.error(err);
            alert("Processing failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExportCSV = async () => {
        if (!dashboardData) return;
        try {
            const res = await axios.post(`${API_BASE}/export-csv`, dashboardData);
            const blob = new Blob([res.data.csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = res.data.filename;
            a.click();
        } catch (err) {
            console.error(err);
            alert("Export failed");
        }
    };

    const renderTemplate = () => {
        if (!dashboardData) return null;
        switch (activeTemplate) {
            case 'executive': return <ExecutiveTemplate data={dashboardData} onExportCSV={handleExportCSV} />;
            case 'analyst': return <AnalystTemplate data={dashboardData} onExportCSV={handleExportCSV} />;
            case 'benchmarker': return <BenchmarkerTemplate data={dashboardData} onExportCSV={handleExportCSV} />;
            case 'visualizer': return <VisualizerTemplate data={dashboardData} onExportCSV={handleExportCSV} />;
            case 'smart': return <SmartDashboardTemplate data={dashboardData} config={smartConfig} onExportCSV={handleExportCSV} />;
            default: return <ExecutiveTemplate data={dashboardData} onExportCSV={handleExportCSV} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 overflow-x-hidden">
            {/* Nav */}
            <nav className="h-20 glass sticky top-0 z-[100] border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setStep('IDLE')}>
                        <div className="bg-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:rotate-6 transition-transform">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent tracking-tighter">
                            DashGen.
                        </span>
                    </div>

                    {step !== 'IDLE' && (
                        <div className="flex items-center space-x-6 animate-fade-in-up">
                            <div className="hidden md:flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>Active: {fileName}</span>
                            </div>
                            <button
                                onClick={() => setStep('IDLE')}
                                className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-blue-600 transition-colors"
                            >
                                New Project
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-16 px-6">
                {step === 'IDLE' && (
                    <div className="max-w-3xl mx-auto mt-10 animate-fade-in-up">
                        <div className="text-center mb-16 space-y-6">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                                Premium Data Engine v2.0
                            </div>
                            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-[0.9]">
                                Visualize anything,<br /><span className="text-blue-600">instantly.</span>
                            </h1>
                            <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
                                Transform raw CSV and Excel data into high-performance, executive-grade dashboards with one click.
                            </p>
                        </div>
                        <FileUpload onUpload={handleFileUpload} isProcessing={isProcessing} />
                    </div>
                )}

                {step === 'UPLOADED' && (
                    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in-up">
                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter">Configuration.</h2>
                                <p className="text-slate-500 font-medium mt-2">Pick your metrics and dimensions to proceed.</p>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                                Step 02 / 03
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card title="Discovery" subtitle="Detected schema" className="lg:col-span-2">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Metrics (Multi-select)</label>
                                        <div className="max-h-48 overflow-y-auto space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                            {schema.columns.filter((c: any) => c.type === 'numeric').map((c: any) => (
                                                <label key={c.name} className="flex items-center space-x-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={targetCols.includes(c.name)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setTargetCols([...targetCols, c.name]);
                                                            } else {
                                                                setTargetCols(targetCols.filter(name => name !== c.name));
                                                            }
                                                        }}
                                                        className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500/10"
                                                    />
                                                    <span className={`font-bold transition-colors ${targetCols.includes(c.name) ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                                        {c.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dimension</label>
                                        <select
                                            value={groupByCol}
                                            onChange={(e) => setGroupByCol(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                        >
                                            <option value="">Full Dataset</option>
                                            {schema.columns.filter((c: any) => c.type === 'categorical').map((c: any) => (
                                                <option key={c.name} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </Card>

                            <div className="glass rounded-[2rem] p-8 flex flex-col justify-between border-blue-100 shadow-blue-500/5">
                                <div>
                                    <h4 className="font-extrabold text-lg tracking-tight">Generate.</h4>
                                    <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">We'll build 4 specialized view templates based on your current selection.</p>
                                </div>
                                <button
                                    onClick={handleProcess}
                                    disabled={isProcessing || targetCols.length === 0}
                                    className="btn-primary flex items-center justify-center mt-8"
                                >
                                    {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Play className="w-4 h-4 mr-2 fill-current" /> Start Engine</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'RENDERED' && (
                    <div className="space-y-12 animate-fade-in-up">
                        {/* Tab Switcher */}
                        <div className="flex bg-slate-200/50 p-1.5 rounded-[1.8rem] w-fit mx-auto shadow-inner">
                            {[
                                { id: 'executive', label: 'Executive', icon: LayoutDashboard },
                                { id: 'analyst', label: 'Analyst', icon: BarChart3 },
                                { id: 'visualizer', label: 'Visualizer', icon: PieChart },
                                { id: 'benchmarker', label: 'Benchmarker', icon: LineChart },
                                { id: 'smart', label: 'Smart View', icon: Sparkles },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTemplate(tab.id)}
                                    className={`flex items-center space-x-3 py-3 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300
                                        ${activeTemplate === tab.id
                                            ? 'bg-white text-blue-600 shadow-xl shadow-slate-200'
                                            : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <tab.icon className={`w-3.5 h-3.5 ${activeTemplate === tab.id ? 'text-blue-600' : 'text-slate-300'}`} />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-200/50">
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter capitalize">{activeTemplate} Report.</h3>
                                <p className="text-slate-500 font-medium">Insights and visual analytics from {fileName}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleExportCSV}
                                    className="btn-secondary flex items-center space-x-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>CSV Export</span>
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="btn-primary flex items-center space-x-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Download PDF</span>
                                </button>
                            </div>
                        </div>

                        {/* Rendering selected template */}
                        <div className="min-h-[800px]">
                            {renderTemplate()}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;