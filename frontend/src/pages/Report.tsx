'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import {
  Brain, ShieldCheck, Activity, Award, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Clock, Target, BarChart3,
  Sparkles, Shield, AlertTriangle, Eye, ArrowLeft, Printer, Share2,
  FileText
} from 'lucide-react';
import { FluidCounter } from '../components/FluidCounter';

// 3D Digital Twin
function DigitalTwinSphere({ score }: { score: number }) {
  const ref = useRef<any>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.12;
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });
  const color = score > 75 ? '#3b82f6' : score > 50 ? '#eab308' : '#ef4444';
  const distort = score > 75 ? 0.2 : score > 50 ? 0.4 : 0.6;
  return (
    <Sphere ref={ref} args={[1, 100, 100]} scale={2.2}>
      <MeshDistortMaterial color={color} attach="material" distort={distort} speed={1} roughness={0.1} metalness={0.95} />
    </Sphere>
  );
}

export default function ReportPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [proctorData, setProctorData] = useState<any>({});
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [weights, setWeights] = useState<any>({ accuracy: 20, clarity: 20, depth: 20, relevance: 20, timeEfficiency: 20 });
  const [finalReport, setFinalReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const h = localStorage.getItem('zs_history');
    const p = localStorage.getItem('zs_proctor');
    const w = localStorage.getItem('zs_weights');
    const cached = localStorage.getItem('zs_final_report_data');
    
    let histData = [];
    if (h) {
      histData = JSON.parse(h);
      setHistory(histData);
    }
    if (p) setProctorData(JSON.parse(p));
    if (w) setWeights(JSON.parse(w));

    if (cached) {
      setFinalReport(JSON.parse(cached));
    } else if (histData.length > 0) {
      setIsGenerating(true);
      fetch('/api/final-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: localStorage.getItem('zs_resume') || '',
          jd: localStorage.getItem('zs_jd') || '',
          history: histData
        })
      })
      .then(res => res.json())
      .then(data => {
        setFinalReport(data);
        localStorage.setItem('zs_final_report_data', JSON.stringify(data));
      })
      .catch(console.error)
      .finally(() => setIsGenerating(false));
    }
  }, []);

  const calcAvg = (key: string) => {
    if (history.length === 0) return 0;
    return Math.round(history.reduce((s, i) => s + (i.evaluation?.[key] || 0), 0) / history.length * 10);
  };

  const finalScore = (() => {
    if (history.length === 0) return 0;
    const totalWeights = Object.values(weights).reduce((a: any, b: any) => a + b, 0) || 100;
    let total = 0;
    history.forEach(item => {
      const e = item.evaluation || {};
      const weightedScore = (
        (e.accuracy || 0) * (weights.accuracy / 100) +
        (e.clarity || 0) * (weights.clarity / 100) +
        (e.depth || 0) * (weights.depth / 100) +
        (e.relevance || 0) * (weights.relevance / 100) +
        (e.timeEfficiency || 0) * (weights.timeEfficiency / 100)
      ) * (100 / (totalWeights as number));
      total += weightedScore;
    });
    return Math.round((total / history.length) * 10);
  })();

  const radarData = [
    { subject: 'Accuracy', A: calcAvg('accuracy'), fullMark: 100 },
    { subject: 'Clarity', A: calcAvg('clarity'), fullMark: 100 },
    { subject: 'Depth', A: calcAvg('depth'), fullMark: 100 },
    { subject: 'Relevance', A: calcAvg('relevance'), fullMark: 100 },
    { subject: 'Speed', A: calcAvg('timeEfficiency'), fullMark: 100 },
  ];

  const barData = history.map((item, idx) => {
    const e = item.evaluation || {};
    const totalWeights = Object.values(weights).reduce((a: any, b: any) => a + b, 0) || 100;
    const weightedScore = (
      (e.accuracy || 0) * (weights.accuracy / 100) +
      (e.clarity || 0) * (weights.clarity / 100) +
      (e.depth || 0) * (weights.depth / 100) +
      (e.relevance || 0) * (weights.relevance / 100) +
      (e.timeEfficiency || 0) * (weights.timeEfficiency / 100)
    ) * (100 / (totalWeights as number));
    return {
      name: `Q${idx + 1}`,
      score: Math.round(weightedScore * 10),
      difficulty: item.difficulty || 'Medium',
    };
  });

  const barColors = barData.map(d => d.score > 75 ? '#22c55e' : d.score > 50 ? '#eab308' : '#ef4444');

  const getGrade = (s: number) => {
    if (s >= 80) return { label: 'Strong', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', emoji: '🏆' };
    if (s >= 50) return { label: 'Average', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', emoji: '⚠️' };
    return { label: 'Needs Improvement', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', emoji: '❌' };
  };

  const grade = getGrade(finalScore);
  const avgTime = history.length > 0 ? Math.round(history.reduce((s, i) => s + (i.timeTaken || 0), 0) / history.length) : 0;
  const totalFlags = (proctorData.tabSwitchCount || 0) + (proctorData.copyAttemptCount || 0);
  const integrityStatus = totalFlags === 0 ? 'Clean' : totalFlags <= 2 ? 'Minor Flags' : 'Flagged';

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-white/30 hover:text-white/60 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-6 h-6 flex items-center justify-center">
            <img src="/onyx-logo.png" alt="ONYX Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-lg">ONYX<span className="text-[#06B6D4]">.ai</span></span>
          <div className="w-px h-5 bg-white/10" />
          <span className="text-xs text-white/30 font-medium">Evaluation Report</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 text-xs font-semibold text-white/40 bg-white/5 hover:bg-white/8 px-4 py-2 rounded-lg border border-white/8 transition-all">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button className="flex items-center gap-2 text-xs font-semibold text-white/40 bg-white/5 hover:bg-white/8 px-4 py-2 rounded-lg border border-white/8 transition-all">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-6 h-6 text-yellow-500" />
                <h1 className="text-4xl font-extrabold tracking-tight">Interview Evaluation Report</h1>
              </div>
              <p className="text-white/35 text-base">Multi-agent deterministic analysis complete. All scores are explainable, auditable, and tamper-proof.</p>
            </div>
            <div className="text-right flex-shrink-0 ml-8">
              <div className="text-[10px] font-bold text-white/25 tracking-widest uppercase mb-1.5">Final Interview Readiness Score</div>
              <div className={`text-7xl font-black tabular-nums leading-none ${grade.color}`}>
                <FluidCounter value={finalScore} /><span className="text-xl text-white/15">/100</span>
              </div>
              <div className={`inline-flex items-center gap-1.5 mt-3 text-xs font-bold px-3 py-1.5 rounded-full border ${grade.bg} ${grade.color}`}>
                <span>{grade.emoji}</span>
                {grade.label}
              </div>
              <div className="mt-2 text-[10px] text-white/30 font-medium">Hiring Readiness Indicator for JD</div>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Questions', value: history.length, icon: Target, accent: 'text-blue-400' },
            { label: 'Avg Time', value: `${avgTime}s`, icon: Clock, accent: 'text-purple-400' },
            { label: 'Best Score', value: barData.length > 0 ? `${Math.max(...barData.map(d => d.score))}%` : '—', icon: TrendingUp, accent: 'text-green-400' },
            { label: 'Worst Score', value: barData.length > 0 ? `${Math.min(...barData.map(d => d.score))}%` : '—', icon: TrendingDown, accent: 'text-red-400' },
            { label: 'Integrity', value: integrityStatus, icon: Shield, accent: totalFlags === 0 ? 'text-green-400' : 'text-yellow-400' },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg bg-white/[0.03] flex items-center justify-center ${stat.accent}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-white/25 font-medium uppercase tracking-wider">{stat.label}</div>
                <div className="text-lg font-bold">{stat.value}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Proctor Warnings (if any) */}
        {totalFlags > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 glass rounded-xl p-5 border-l-4 border-l-yellow-500">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-yellow-400">Proctoring Integrity Report</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                <span className="text-[10px] text-white/30 uppercase tracking-widest">Tab Switches</span>
                <div className="text-xl font-bold text-yellow-400">{proctorData.tabSwitchCount || 0}</div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                <span className="text-[10px] text-white/30 uppercase tracking-widest">Copy/Paste Attempts</span>
                <div className="text-xl font-bold text-red-400">{proctorData.copyAttemptCount || 0}</div>
              </div>
            </div>
            {proctorData.warnings && proctorData.warnings.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {proctorData.warnings.map((w: string, i: number) => (
                  <p key={i} className="text-xs text-white/30 font-mono">{w}</p>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-5 mb-8">

          {/* 3D Digital Twin */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-5 relative overflow-hidden h-[400px] flex flex-col">
            <h3 className="text-[10px] font-bold text-white/25 tracking-widest uppercase mb-2 flex items-center gap-2 relative z-10">
              <Brain className="w-3.5 h-3.5 text-blue-400" /> Digital Candidate Twin
            </h3>
            <div className="absolute inset-0 z-0">
              <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} />
                <pointLight position={[-5, -5, -5]} intensity={0.5} color="#8b5cf6" />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.6} />
                <DigitalTwinSphere score={finalScore} />
              </Canvas>
            </div>
            <div className="mt-auto relative z-10 bg-black/60 backdrop-blur-xl p-3 rounded-lg border border-white/5">
              <p className="text-[10px] text-white/35 leading-relaxed">
                Blue = strong competency. Yellow = moderate gaps. Red = critical deficiency. Distortion = score variance.
              </p>
            </div>
          </motion.div>

          {/* Radar Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-5 h-[400px] flex flex-col">
            <h3 className="text-[10px] font-bold text-white/25 tracking-widest uppercase mb-2 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-purple-400" /> Competency Radar
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-5 h-[400px] flex flex-col">
            <h3 className="text-[10px] font-bold text-white/25 tracking-widest uppercase mb-2 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-green-400" /> Per-Question Trend
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barCategoryGap="25%">
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '11px' }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {barData.map((_, idx) => (<Cell key={idx} fill={barColors[idx]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* XAI Audit Trail */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center gap-3 mb-5">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">XAI Audit Trail — Full Breakdown</h2>
          </div>

          <div className="space-y-3">
            {history.map((item, idx) => {
              const e = item.evaluation || {};
              const qScore = Math.round(((e.accuracy || 0) + (e.clarity || 0) + (e.depth || 0) + (e.relevance || 0) + (e.timeEfficiency || 0)) / 5 * 10);
              const expanded = expandedQ === idx;

              return (
                <div key={idx} className="glass rounded-xl overflow-hidden transition-all">
                  <button onClick={() => setExpandedQ(expanded ? null : idx)}
                    className="w-full flex items-center justify-between p-5 hover:bg-white/[0.01] transition-colors text-left">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        qScore > 75 ? 'bg-green-500/10 text-green-400 border border-green-500/15'
                        : qScore > 50 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15'
                        : 'bg-red-500/10 text-red-400 border border-red-500/15'
                      }`}>
                        Q{idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white/75 line-clamp-1">{item.question}</p>
                        <p className="text-[11px] text-white/25 mt-0.5">
                          {item.difficulty} · {item.timeTaken}s · {e.integrityWarnings?.length > 0 ? `⚠️ ${e.integrityWarnings.length} flags` : '✅ Clean'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xl font-bold tabular-nums ${qScore > 75 ? 'text-green-400' : qScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>{qScore}%</span>
                      {expanded ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
                    </div>
                  </button>

                  {expanded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-white/5 p-6 space-y-5 bg-black/20">
                      {/* Answer */}
                      <div>
                        <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2">Candidate Response</p>
                        <p className="text-sm text-white/50 leading-relaxed bg-white/[0.02] p-4 rounded-lg border border-white/5 italic">"{item.answer}"</p>
                      </div>

                      {/* Score Grid */}
                      <div>
                        <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2">Score Breakdown</p>
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { label: 'Accuracy', val: e.accuracy },
                            { label: 'Clarity', val: e.clarity },
                            { label: 'Depth', val: e.depth },
                            { label: 'Relevance', val: e.relevance },
                            { label: 'Speed', val: e.timeEfficiency },
                          ].map((s, i) => (
                            <div key={i} className="bg-white/[0.02] rounded-lg p-3 text-center border border-white/5">
                              <div className="text-[9px] text-white/25 mb-1 uppercase tracking-wider">{s.label}</div>
                              <div className={`text-lg font-bold ${(s.val || 0) > 7 ? 'text-green-400' : (s.val || 0) > 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {s.val || 0}<span className="text-white/15 text-xs">/10</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strength / Weakness Tags */}
                      {(e.strengthTags?.length > 0 || e.weaknessTags?.length > 0) && (
                        <div className="flex flex-wrap gap-2">
                          {e.strengthTags?.map((t: string, i: number) => (
                            <span key={`s-${i}`} className="text-[10px] px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/15 rounded-full font-medium">✓ {t}</span>
                          ))}
                          {e.weaknessTags?.map((t: string, i: number) => (
                            <span key={`w-${i}`} className="text-[10px] px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/15 rounded-full font-medium">✗ {t}</span>
                          ))}
                        </div>
                      )}

                      {/* SHAP Feedback */}
                      <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/8 rounded-lg p-4">
                        <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-blue-400 mb-1 uppercase tracking-widest">SHAP Explainability Report</p>
                          <p className="text-xs text-white/40 leading-relaxed">{e.feedback || 'No feedback.'}</p>
                        </div>
                      </div>

                      {/* Reasoning Check */}
                      {e.reasoningCheck && (
                        <div className="flex items-start gap-3 bg-purple-500/5 border border-purple-500/8 rounded-lg p-4">
                          <Eye className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-purple-400 mb-1 uppercase tracking-widest">AI Authenticity Check</p>
                            <p className="text-xs text-white/40 leading-relaxed">{e.reasoningCheck}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* AI Final Comprehensive Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-gradient-to-br from-[#00D4FF]/5 to-[#8b5cf6]/5 border border-[#8b5cf6]/20 rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-[0_0_60px_#8b5cf610]"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00D4FF]/[0.05] rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#8b5cf6]/[0.05] rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-10">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00D4FF] to-[#8b5cf6] flex items-center justify-center shadow-[0_0_20px_#00D4FF40]">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Final AI Synthesis & Action Plan</h2>
                <p className="text-white/40 text-sm mt-1">Deep-dive comprehensive analysis of your entire interview loop</p>
              </div>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-8 h-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/40 text-sm animate-pulse tracking-widest uppercase">Synthesizing global interview data...</p>
              </div>
            ) : finalReport ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column */}
                <div className="space-y-10">
                  {/* Overall Analysis */}
                  <div>
                    <h3 className="text-[10px] font-bold text-[#00D4FF] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" /> Performance Breakdown
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                      {finalReport.overallAnalysis}
                    </p>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-5">
                      <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-4">Core Strengths</h3>
                      <ul className="space-y-3">
                        {finalReport.strengths?.map((s: string, i: number) => (
                          <li key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed">
                            <span className="text-green-400 font-bold">✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5">
                      <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-4">Critical Weaknesses</h3>
                      <ul className="space-y-3">
                        {finalReport.weaknesses?.map((w: string, i: number) => (
                          <li key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed">
                            <span className="text-red-400 font-bold">✗</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-10">
                  {/* Action Plan */}
                  <div>
                    <h3 className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5" /> Next Steps Action Plan
                    </h3>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                      <p className="text-sm text-white/70 leading-relaxed">
                        {finalReport.actionPlan}
                      </p>
                    </div>
                  </div>

                  {/* Upgrades */}
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-[#00D4FF]/5 border border-[#00D4FF]/10 rounded-2xl p-5">
                      <h3 className="text-[10px] font-bold text-[#00D4FF] uppercase tracking-widest mb-4">Resume Gap Upgrades</h3>
                      <ul className="space-y-3">
                        {finalReport.resumeUpgrades?.map((r: string, i: number) => (
                          <li key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed">
                            <span className="text-[#00D4FF] font-bold">→</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-[#8b5cf6]/5 border border-[#8b5cf6]/10 rounded-2xl p-5">
                      <h3 className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-widest mb-4">Technical Upgrades Needed</h3>
                      <ul className="space-y-3">
                        {finalReport.technicalUpgrades?.map((t: string, i: number) => (
                          <li key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed">
                            <span className="text-[#8b5cf6] font-bold">→</span> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-white/40 text-sm">Report could not be generated.</div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <p className="text-[10px] text-white/15 font-mono">
            Generated by ONYX.ai — The Onyx Engine v1.0
          </p>
          <div className="text-[10px] text-[#00D4FF]/40 font-mono tracking-widest uppercase mt-4 flex items-center justify-center gap-1.5 transition-colors">
            <a href="https://github.com/lakshanmuruganandam" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#00D4FF]">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.5 5.5 0 0 0-1.5-3.8 5.5 5.5 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.5 5.5 0 0 0-.1 3.8A5.5 5.5 0 0 0 3.4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path></svg>
              Architected by Lakshan Muruganandam
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
