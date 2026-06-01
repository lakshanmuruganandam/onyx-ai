'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Mic,
  Video,
  Zap,
  Clock,
  TrendingUp,
  AlertTriangle,
  Lock,
  Code2,
  Eye,
  BookOpen,
  FileText,
  Upload,
  Activity,
  Play,
} from 'lucide-react';
import { MagneticButton } from '../components/MagneticButton';
import { HeroCore3D } from '../components/HeroCore3D';
import { SpotlightCard } from '../components/SpotlightCard';

/* ─── Feature Data ─── */
const FEATURES = [
  { icon: Video, title: 'Live Video Interview', desc: 'Real-time webcam session with an AI interviewer avatar and facial analysis.' },
  { icon: Mic, title: 'Voice Recognition', desc: 'Speak naturally — live transcription, NLP analysis, and sentiment scoring.' },
  { icon: TrendingUp, title: 'Adaptive Difficulty', desc: 'AI scales questions Easy → Medium → Hard based on live performance.' },
  { icon: Clock, title: 'Strict Time Constraints', desc: '120-second timer per question with auto-submit and time-decay penalties.' },
  { icon: AlertTriangle, title: 'Early Termination', desc: 'Consecutive poor answers trigger auto-stop to simulate real rejection.' },
  { icon: BarChart3, title: '5-Axis Scoring', desc: 'Accuracy, Clarity, Depth, Relevance, and Speed — scored deterministically.' },
  { icon: ShieldCheck, title: 'XAI Audit Trail', desc: 'Explainable AI reasoning with a full audit trail for every single score.' },
  { icon: Brain, title: 'Swarm Intelligence', desc: 'Multi-agent debate and consensus protocol before final score assignment.' },
  { icon: Lock, title: 'Anti-Cheating Proctoring', desc: 'Tab-switch detection, gaze tracking, and clipboard monitoring in real-time.' },
  { icon: Code2, title: 'Code Sandbox', desc: 'Embedded live code editor with execution for technical coding rounds.' },
  { icon: Eye, title: 'Confidence Tracking', desc: 'Eye-contact and micro-expression analysis to measure candidate confidence.' },
  { icon: BookOpen, title: 'Custom Study Plan', desc: 'AI-generated post-interview study roadmap targeting your weak areas.' },
];

const INTERVIEW_TYPES = ['Technical', 'Behavioral', 'System Design', 'Mixed'] as const;

const NAV_LINKS = ['Features', 'Setup'] as const;

/* ─── Particle Generator ─── */
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1.5,
    duration: Math.random() * 12 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.15,
    color: Math.random() > 0.5 ? '#00D4FF' : '#8b5cf6',
  }));
}

/* ─── Component ─── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [interviewType, setInterviewType] = useState<string>('Technical');
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [resumeFileName, setResumeFileName] = useState('');
  
  // Advanced Configurations
  const [persona, setPersona] = useState<string>('The FAANG Gatekeeper');
  const [timeLimit, setTimeLimit] = useState<number>(120);
  const [mercyRule, setMercyRule] = useState<number>(40);
  const [activeSkills, setActiveSkills] = useState<string[]>(['React', 'Node.js', 'System Design', 'Algorithms', 'CI/CD']);
  const [weights, setWeights] = useState({ accuracy: 20, clarity: 20, depth: 20, relevance: 20, timeEfficiency: 20 });

  const [particles, setParticles] = useState<any[]>([]);
  useEffect(() => {
    setParticles(generateParticles(20));
  }, []);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setResume((ev.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  const startInterview = () => {
    if (!resume.trim() || !jd.trim()) return;
    localStorage.setItem('zs_resume', resume);
    localStorage.setItem('zs_jd', jd);
    localStorage.setItem('zs_type', interviewType);
    localStorage.setItem('zs_difficulty', difficulty);
    localStorage.setItem('zs_persona', persona);
    localStorage.setItem('zs_timeLimit', timeLimit.toString());
    localStorage.setItem('zs_mercyRule', mercyRule.toString());
    localStorage.setItem('zs_skills', JSON.stringify(activeSkills));
    localStorage.setItem('zs_weights', JSON.stringify(weights));
    navigate('/interview');
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-white overflow-x-hidden">
      {/* ─────────────────────── NAVBAR ─────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/onyx-logo.png" alt="ONYX Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              ONYX<span className="text-[#00D4FF]">.ai</span>
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link.toLowerCase())}
                className="text-sm text-white/40 hover:text-white/80 transition-colors duration-200"
              >
                {link}
              </button>
            ))}
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Engine Online
            </span>
          </div>
        </div>
      </nav>

      {/* ─────────────────────── HERO ─────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 md:px-8 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 4}px ${p.color}, 0 0 ${p.size * 8}px ${p.color}40`,
                opacity: p.opacity,
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 80, 0],
                y: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 60, 0],
                opacity: [p.opacity, p.opacity * 1.5, p.opacity * 0.6, p.opacity],
                scale: [1, 1.3, 0.8, 1],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Radial gradient overlays */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#06B6D4]/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[400px] bg-[#4F46E5]/[0.05] rounded-full blur-[100px] pointer-events-none" />
        
        <HeroCore3D />

        <div className="max-w-7xl mx-auto relative z-10 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Hackathon Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#00D4FF] bg-[#00D4FF]/10 px-5 py-2.5 rounded-full border border-[#00D4FF]/20 mb-8 tracking-widest uppercase"
            >
              <Zap className="w-3.5 h-3.5" />
              ONYX ENGINE v1.0 — SECURE CONNECTION
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-8"
            >
              Step into the<br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #06B6D4 0%, #4F46E5 50%, #ffffff 100%)',
                }}
              >
                ONYX Simulation
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-base sm:text-lg md:text-xl text-white/45 leading-relaxed max-w-2xl mx-auto mb-12 font-medium"
            >
              Your readiness, quantified.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="max-w-[300px] mx-auto pointer-events-auto"
            >
              <MagneticButton onClick={() => scrollTo('setup')}>
                <span className="flex items-center gap-3">
                  <Play className="w-5 h-5" />
                  Initiate Simulator
                </span>
              </MagneticButton>
            </motion.div>

            {/* Stats Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="flex items-center justify-center gap-8 mt-16 text-xs text-white/25"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#00D4FF]/50" />
                <span>5-Axis Scoring</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8b5cf6]/50" />
                <span>XAI Explainability</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-[#00D4FF]/50" />
                <span>Swarm Consensus</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-white/30" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─────────────────────── FEATURES GRID ─────────────────────── */}
      <section id="features" className="py-24 px-6 md:px-8 relative">
        {/* Background accent */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-[#8b5cf6]/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#8b5cf6] bg-[#8b5cf6]/10 px-4 py-2 rounded-full border border-[#8b5cf6]/20 mb-4 tracking-widest uppercase">
              <Zap className="w-3 h-3" />
              Platform Capabilities
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Built for{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #00D4FF, #8b5cf6)' }}
              >
                Ruthless Accuracy
              </span>
            </h2>
            <p className="text-white/35 max-w-xl mx-auto text-sm md:text-base">
              Every feature is engineered for deterministic, explainable evaluation — no shortcuts, no hallucinations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 cursor-default"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00D4FF]/[0.02] to-[#8b5cf6]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4FF]/10 to-[#8b5cf6]/10 border border-white/[0.06] flex items-center justify-center mb-4 group-hover:border-[#00D4FF]/20 transition-colors duration-300">
                    <f.icon className="w-5 h-5 text-[#00D4FF] group-hover:text-[#00D4FF] transition-colors" />
                  </div>
                  <h3 className="font-semibold text-[15px] mb-1.5 text-white/90">{f.title}</h3>
                  <p className="text-xs text-white/35 leading-relaxed group-hover:text-white/45 transition-colors">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── SETUP FORM ─────────────────────── */}
      <section id="setup" className="py-24 px-6 md:px-8 relative">
        {/* Background accents */}
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-[#00D4FF]/[0.03] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[200px] bg-[#8b5cf6]/[0.03] rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#00D4FF] bg-[#00D4FF]/10 px-4 py-2 rounded-full border border-[#00D4FF]/20 mb-4 tracking-widest uppercase">
                <Activity className="w-3 h-3" />
                Session Configuration
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                Initialize{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, #00D4FF, #8b5cf6)' }}
                >
                  Interview Session
                </span>
              </h2>
              <p className="text-white/35 text-sm">Provide context for the AI agents to calibrate the interview.</p>
            </div>

            {/* Form Card */}
            <SpotlightCard className="p-8 md:p-10 shadow-[0_0_60px_#06B6D410,0_0_120px_#4F46E508]">
              {/* Status indicator */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse shadow-[0_0_8px_#06B6D4]" />
                <h3 className="text-sm font-bold tracking-tight text-white/60 uppercase tracking-widest">
                  Agent Pipeline Ready
                </h3>
              </div>

              {/* Textareas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
                {/* Job Description */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#06B6D4] tracking-widest uppercase flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Job Description
                  </label>
                  <textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Paste the full job description here — role, requirements, responsibilities..."
                    className="w-full h-56 bg-black/50 border border-white/[0.08] rounded-xl p-5 text-sm text-white/80 placeholder:text-white/15 focus:ring-2 focus:ring-[#06B6D4]/50 focus:border-[#06B6D4]/50 outline-none transition-all resize-none hover:border-white/15 shadow-inner"
                  />
                </div>

                {/* Resume (with Scanner) */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#4F46E5] tracking-widest uppercase flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    Candidate Resume
                  </label>
                  <div className="relative overflow-hidden rounded-xl border border-white/[0.08] hover:border-white/15 transition-all group bg-black/50 shadow-inner">
                    <textarea
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      placeholder="Paste your resume text, or upload a file using the button below..."
                      className="w-full h-56 bg-transparent p-5 pb-14 text-sm text-white/80 placeholder:text-white/15 focus:ring-2 focus:ring-[#4F46E5]/50 outline-none resize-none"
                    />
                    
                    {/* The Scanner Line Animation */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#06B6D4] to-transparent opacity-0 group-hover:opacity-100 shadow-[0_0_15px_#06B6D4] pointer-events-none" 
                         style={{ animation: 'scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />

                    {/* File Upload Button */}
                    <label className="absolute bottom-4 right-4 cursor-pointer z-10">
                      <input
                        type="file"
                        accept=".txt,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 text-xs text-white/35 hover:text-[#06B6D4] bg-white/[0.04] hover:bg-[#06B6D4]/10 px-3.5 py-2 rounded-lg border border-white/[0.08] hover:border-[#06B6D4]/30 transition-all duration-200">
                        <Upload className="w-3 h-3" />
                        {resumeFileName || 'Upload File'}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Interview Type Selector */}
                <div>
                  <label className="text-xs font-bold text-white/30 tracking-widest uppercase mb-4 block">
                    Interview Type
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {INTERVIEW_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setInterviewType(type)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                          interviewType === type
                            ? 'bg-gradient-to-r from-[#00D4FF]/15 to-[#8b5cf6]/15 text-[#00D4FF] border-[#00D4FF]/30 shadow-[0_0_20px_#00D4FF15]'
                            : 'bg-white/[0.03] text-white/35 border-white/[0.08] hover:text-white/55 hover:border-white/15 hover:bg-white/[0.05]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Selector */}
                <div>
                  <label className="text-xs font-bold text-white/30 tracking-widest uppercase mb-4 block">
                    Initial Difficulty Level
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['Easy', 'Medium', 'Hard'].map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                          difficulty === diff
                            ? diff === 'Easy' ? 'bg-green-500/15 text-green-400 border-green-500/30 shadow-[0_0_20px_rgba(74,222,128,0.15)]'
                            : diff === 'Medium' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30 shadow-[0_0_20px_rgba(250,204,21,0.15)]'
                            : 'bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                            : 'bg-white/[0.03] text-white/35 border-white/[0.08] hover:text-white/55 hover:border-white/15 hover:bg-white/[0.05]'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* === ADVANCED SETTINGS (HACKATHON EXCLUSIVE) === */}
              <div className="bg-white/[0.01] border border-white/[0.05] rounded-2xl p-6 mb-8 mt-4">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-4 h-4 text-[#8b5cf6]" />
                  <h4 className="text-sm font-bold text-white/80 uppercase tracking-widest">Advanced Recruiter Settings</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Persona Selector */}
                  <div>
                    <label className="text-xs font-bold text-white/30 tracking-widest uppercase mb-4 block">
                      Interview Persona
                    </label>
                    <div className="flex flex-col gap-2">
                      {['The FAANG Gatekeeper', 'The Startup CTO', 'The Supportive Mentor'].map((p) => (
                        <button
                          key={p}
                          onClick={() => setPersona(p)}
                          className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            persona === p
                              ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border-[#8b5cf6]/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                              : 'bg-white/[0.02] text-white/40 border-white/[0.04] hover:text-white/60 hover:border-white/10'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Constraints Sliders */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-white/40 tracking-widest uppercase">Time Limit (sec)</label>
                        <span className="text-sm font-mono text-[#00D4FF]">{timeLimit}s</span>
                      </div>
                      <input
                        type="range" min="30" max="300" step="10"
                        value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))}
                        className="w-full accent-[#00D4FF]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-white/40 tracking-widest uppercase">Guillotine Threshold</label>
                        <span className="text-sm font-mono text-red-400">{mercyRule}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" step="5"
                        value={mercyRule} onChange={(e) => setMercyRule(Number(e.target.value))}
                        className="w-full accent-red-500"
                      />
                      <p className="text-[10px] text-white/30 mt-1">Interview auto-terminates if score drops below this line.</p>
                    </div>
                  </div>
                </div>

                {/* Simulated Extracted Skills */}
                <div className="mt-8">
                  <label className="text-xs font-bold text-white/30 tracking-widest uppercase mb-4 block">
                    Resume Targeting Protocol (Mock Extraction)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Node.js', 'System Design', 'Algorithms', 'CI/CD', 'AWS', 'Python'].map(skill => (
                      <button
                        key={skill}
                        onClick={() => setActiveSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          activeSkills.includes(skill)
                            ? 'bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40'
                            : 'bg-transparent text-white/30 border-white/10 hover:border-white/30 hover:text-white/50'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">Deselect topics you wish to avoid during the evaluation.</p>
                </div>

                {/* Dynamic Evaluation Weighting */}
                <div className="mt-8 border-t border-white/5 pt-6">
                  <label className="text-xs font-bold text-white/30 tracking-widest uppercase mb-4 block">
                    Dynamic Evaluation Weighting (Recruiter Dashboard)
                  </label>
                  <p className="text-[10px] text-white/40 mb-4">Adjust the metric weights for the Final Interview Readiness Score computation.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {Object.entries(weights).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-semibold text-white/50 capitalize">{key.replace('time', 'Time ')}</span>
                          <span className="text-[11px] font-mono text-[#00D4FF]">{value}%</span>
                        </div>
                        <input
                          type="range" min="0" max="100" step="5" value={value}
                          onChange={(e) => setWeights({ ...weights, [key]: Number(e.target.value) })}
                          className="w-full h-1 accent-[#8b5cf6] bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={startInterview}
                disabled={!resume.trim() || !jd.trim()}
                className="group w-full py-5 bg-gradient-to-r from-[#00D4FF] to-[#8b5cf6] hover:from-[#00D4FF] hover:to-[#a78bfa] disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed disabled:shadow-none rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_40px_#00D4FF25,0_0_80px_#8b5cf615] hover:shadow-[0_0_60px_#00D4FF40,0_0_100px_#8b5cf630] hover:scale-[1.01] active:scale-[0.99]"
              >
                <Video className="w-5 h-5" />
                Join AI Interview Room
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Helper text */}
              <p className="text-center text-xs text-white/15 mt-4">
                Your data stays local — stored in browser localStorage only.
              </p>
            </SpotlightCard>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────── FOOTER ─────────────────────── */}
      <footer className="py-10 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-white/20">
            <Brain className="w-4 h-4 text-[#00D4FF]/30" />
            <span className="text-xs tracking-wider">
              Powered by <span className="text-white/30 font-semibold">The Onyx Engine</span> — Deterministic Multi-Agent System
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-white/10 uppercase tracking-widest">
            <span>Zero Bias</span>
            <div className="w-px h-2.5 bg-white/5" />
            <span>Zero Hallucination</span>
            <div className="w-px h-2.5 bg-white/5" />
            <span>Full Explainability</span>
          </div>
          <div className="text-[10px] text-[#00D4FF]/40 font-mono tracking-widest uppercase mt-4 flex items-center justify-center gap-1.5 transition-colors">
            <a href="https://github.com/lakshanmuruganandam" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#00D4FF]">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.5 5.5 0 0 0-1.5-3.8 5.5 5.5 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.5 5.5 0 0 0-.1 3.8A5.5 5.5 0 0 0 3.4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path></svg>
              Architected by Lakshan Muruganandam
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
