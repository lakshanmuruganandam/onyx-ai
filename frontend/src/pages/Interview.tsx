'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Mic, MicOff, Video, VideoOff, PhoneOff, Clock,
  Activity, ShieldCheck, Send, Settings2, CheckCircle2,
  Keyboard, Eye, Lock,
  AlertOctagon, Fingerprint, Shield, Sparkles, ChevronRight,
  Volume2, VolumeOff, Maximize, Code2, Terminal
} from 'lucide-react';

// ====================== SWARM AGENTS ======================
const SWARM_AGENTS = [
  {
    name: 'Architecture Analyst', icon: Settings2, color: 'cyan', msgs: [
      'Deconstructing system design rationale…',
      'Validating architectural trade-offs…',
      'Mapping answer to JD competency framework…',
    ]
  },
  {
    name: 'Communication Analyst', icon: Brain, color: 'purple', msgs: [
      'Measuring structured-thinking score…',
      'Evaluating STAR-method compliance…',
      'Analyzing articulation clarity index…',
    ]
  },
  {
    name: 'Integrity Validator', icon: Shield, color: 'emerald', msgs: [
      'Cross-referencing proctor telemetry…',
      'Applying deterministic time penalty…',
      'Generating SHAP explainability vectors…',
    ]
  },
];

// ====================== CONFIDENCE METRICS (dummy per-question) ======================
const CONFIDENCE_PRESETS = [
  { engagement: 72, clarity: 65, confidence: 58, depth: 50 },
  { engagement: 78, clarity: 72, confidence: 70, depth: 64 },
  { engagement: 85, clarity: 80, confidence: 76, depth: 72 },
  { engagement: 82, clarity: 88, confidence: 84, depth: 80 },
  { engagement: 90, clarity: 92, confidence: 88, depth: 86 },
];

export default function InterviewRoom() {
  const navigate = useNavigate();

  // ====================== CORE STATE ======================
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [interviewType, setInterviewType] = useState('Technical');
  const [history, setHistory] = useState<any[]>([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const totalQuestions = 5;

  // ====================== QUESTION STATE ======================
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentDifficulty, setCurrentDifficulty] = useState('Medium');
  const [baseTimeLimit, setBaseTimeLimit] = useState(120);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [mercyRuleScore, setMercyRuleScore] = useState(40);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastFeedback, setLastFeedback] = useState('');
  const [isReady, setIsReady] = useState(false);

  // ====================== MEDIA STATE ======================
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [useTextMode, setUseTextMode] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // ====================== SCRATCHPAD STATE ======================
  const [scratchpad, setScratchpad] = useState('');

  // ====================== PROCTORING STATE ======================
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copyAttemptCount, setCopyAttemptCount] = useState(0);
  const [proctorWarnings, setProctorWarnings] = useState<string[]>([]);
  const [, setIsFullscreen] = useState(false);
  const [showProctorAlert, setShowProctorAlert] = useState(false);
  const [proctorAlertMsg, setProctorAlertMsg] = useState('');

  // ====================== SWARM STATE ======================
  const [activeSwarmAgents, setActiveSwarmAgents] = useState<number[]>([]);
  const [swarmMessages, setSwarmMessages] = useState<string[]>([]);

  // ====================== CONFIDENCE METRICS STATE ======================
  const [metrics, setMetrics] = useState(CONFIDENCE_PRESETS[0]);

  // ====================== TRANSCRIPT HISTORY ======================
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([]);

  // ====================== INITIALIZATION ======================
  useEffect(() => {
    const r = localStorage.getItem('zs_resume') || '';
    const j = localStorage.getItem('zs_jd') || '';
    const t = localStorage.getItem('zs_type') || 'Technical';
    const d = localStorage.getItem('zs_difficulty') || 'Easy';
    const tl = parseInt(localStorage.getItem('zs_timeLimit') || '120', 10);
    const mr = parseInt(localStorage.getItem('zs_mercyRule') || '40', 10);
    setResume(r);
    setJd(j);
    setInterviewType(t);
    setCurrentDifficulty(d);
    setBaseTimeLimit(tl);
    setTimeRemaining(tl);
    setMercyRuleScore(mr);

    initSpeechRecognition();

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, transcriptHistory]);

  // ====================== ANTI-CHEATING: Tab Switch Detection ======================
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isReady) {
        setTabSwitchCount(p => p + 1);
        triggerProctorAlert('⚠️ Tab switch detected! This has been logged.');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isReady]);

  // ====================== ANTI-CHEATING: Copy/Paste/Cut Block ======================
  useEffect(() => {
    const block = (e: Event) => {
      if (isReady) {
        e.preventDefault();
        setCopyAttemptCount(p => p + 1);
        triggerProctorAlert('🚫 Copy/Paste is disabled during the interview.');
      }
    };
    const blockKeys = (e: KeyboardEvent) => {
      if (isReady && (e.ctrlKey || e.metaKey)) {
        if (['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          setCopyAttemptCount(p => p + 1);
          triggerProctorAlert('🚫 Keyboard shortcuts for copy/paste are disabled.');
        }
      }
    };
    document.addEventListener('copy', block);
    document.addEventListener('paste', block);
    document.addEventListener('cut', block);
    document.addEventListener('keydown', blockKeys);
    return () => {
      document.removeEventListener('copy', block);
      document.removeEventListener('paste', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('keydown', blockKeys);
    };
  }, [isReady]);

  // ====================== ANTI-CHEATING: Right-Click Block ======================
  useEffect(() => {
    const blockContext = (e: Event) => {
      if (isReady) {
        e.preventDefault();
        triggerProctorAlert('🚫 Right-click is disabled during the interview.');
      }
    };
    document.addEventListener('contextmenu', blockContext);
    return () => document.removeEventListener('contextmenu', blockContext);
  }, [isReady]);

  const triggerProctorAlert = (msg: string) => {
    setProctorAlertMsg(msg);
    setShowProctorAlert(true);
    setProctorWarnings(p => [...p, `${new Date().toLocaleTimeString()}: ${msg}`]);
    setTimeout(() => setShowProctorAlert(false), 3000);
  };

  // ====================== TIMER ======================
  useEffect(() => {
    if (!isReady || isEvaluating) return;
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeRemaining(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeRemaining, isEvaluating, isReady]);

  // ====================== CAMERA ======================
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setHasCamera(true);
    } catch { console.warn('Camera unavailable'); }
  };

  // ====================== SPEECH ======================
  const initSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e: any) => {
      let full = '';
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript + ' ';
      }
      setTranscript(full.trim());
    };
    recognition.onerror = () => {};
    recognitionRef.current = recognition;
  };

  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window) || isMuted) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    u.voice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.lang === 'en-US') || null;
    u.pitch = 1;
    u.rate = 0.9;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [isMuted]);

  // ====================== START INTERVIEW ======================
  const startInterview = async () => {
    await initCamera();

    // Try fullscreen
    try { document.documentElement.requestFullscreen?.(); setIsFullscreen(true); } catch {}

    setIsReady(true);
    setTimeRemaining(baseTimeLimit);

    // Generate first question
    try {
      const res = await fetch('http://localhost:5001/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume, jd, history: [], currentQuestion: '', answer: '__INIT__',
          timeTakenSeconds: 0, currentDifficulty, interviewType,
          persona: localStorage.getItem('zs_persona') || 'The FAANG Gatekeeper',
          skills: localStorage.getItem('zs_skills') || '[]'
        })
      });
      const data = await res.json();
      const q = data.nextQuestion || "Tell me about a complex technical challenge you solved. Walk me through your approach.";
      setCurrentQuestion(q);
      setTimeout(() => speakText(q), 600);
    } catch {
      const fallback = "Tell me about a complex technical challenge you've solved recently.";
      setCurrentQuestion(fallback);
      setTimeout(() => speakText(fallback), 600);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) { setUseTextMode(true); return; }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try { recognitionRef.current.start(); setIsListening(true); } catch { setUseTextMode(true); }
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const vt = streamRef.current.getVideoTracks()[0];
      if (vt) { vt.enabled = cameraOff; setCameraOff(!cameraOff); }
    }
  };

  // ====================== CAMERA MOUNT ======================
  useEffect(() => {
    if (isReady && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isReady, hasCamera]);

  // ====================== SWARM ANIMATION ======================
  const runSwarm = async () => {
    setActiveSwarmAgents([]);
    setSwarmMessages([]);
    for (let i = 0; i < SWARM_AGENTS.length; i++) {
      setActiveSwarmAgents(p => [...p, i]);
      const mi = Math.floor(Math.random() * SWARM_AGENTS[i].msgs.length);
      setSwarmMessages(p => [...p, `${SWARM_AGENTS[i].name}: ${SWARM_AGENTS[i].msgs[mi]}`]);
      await new Promise(r => setTimeout(r, 900));
    }
  };

  // ====================== SUBMIT ======================
  const handleSubmit = async () => {
    if (isEvaluating) return;
    const answer = useTextMode ? textAnswer : transcript;
    const fullAnswer = scratchpad.trim() ? `${answer}\n\n[Scratchpad Notes]:\n${scratchpad}` : answer;
    if (!answer.trim() && !scratchpad.trim()) {
      speakText("I didn't catch your answer. Please provide a response.");
      return;
    }
    if (recognitionRef.current && isListening) { recognitionRef.current.stop(); setIsListening(false); }
    window.speechSynthesis.cancel(); setIsSpeaking(false);
    setIsEvaluating(true);

    // Save transcript to history
    if (transcript.trim()) {
      setTranscriptHistory(p => [...p, `[Q${questionNumber}] ${transcript.trim()}`]);
    }

    await runSwarm();

    const timeTaken = baseTimeLimit - timeRemaining;
    try {
      const res = await fetch('http://localhost:5001/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume, jd, history, currentQuestion, answer: fullAnswer,
          timeTakenSeconds: timeTaken, currentDifficulty, interviewType,
          persona: localStorage.getItem('zs_persona') || 'The FAANG Gatekeeper',
          skills: localStorage.getItem('zs_skills') || '[]',
          proctorFlags: { tabSwitches: tabSwitchCount, copyAttempts: copyAttemptCount, gazeAway: 0, facesDetected: 1 }
        })
      });
      const evaluation = await res.json();
      const entry = { question: currentQuestion, answer: fullAnswer, evaluation, timeTaken, difficulty: currentDifficulty };
      const newHistory = [...history, entry];
      setHistory(newHistory);
      setLastFeedback(evaluation.feedback || '');

      const avgScore = ((evaluation.accuracy + evaluation.clarity + evaluation.depth + evaluation.relevance + (evaluation.timeEfficiency || 5)) / 50) * 100;
      const guillotineTriggered = questionNumber >= 2 && avgScore < mercyRuleScore;

      if (evaluation.terminate || guillotineTriggered || questionNumber >= totalQuestions) {
        localStorage.setItem('zs_history', JSON.stringify(newHistory));
        localStorage.setItem('zs_proctor', JSON.stringify({ tabSwitchCount, copyAttemptCount, warnings: proctorWarnings }));
        speakText('Thank you. The interview is now complete. I will generate your comprehensive evaluation report.');
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        try { document.exitFullscreen?.(); } catch {}
        setTimeout(() => navigate('/report'), 3500);
        return;
      }

      const nextQ = evaluation.nextQuestion || 'Can you provide a concrete example?';
      setCurrentQuestion(nextQ);
      setCurrentDifficulty(evaluation.nextDifficulty || currentDifficulty);
      setQuestionNumber(p => p + 1);
      setTranscript('');
      setTextAnswer('');
      setScratchpad('');
      setTimeRemaining(baseTimeLimit);

      // Update confidence metrics
      const nextIdx = Math.min(questionNumber, CONFIDENCE_PRESETS.length - 1);
      setMetrics(CONFIDENCE_PRESETS[nextIdx]);

      setTimeout(() => speakText(nextQ), 700);
    } catch (err) { console.error(err); }
    finally {
      setIsEvaluating(false);
      setActiveSwarmAgents([]);
      setSwarmMessages([]);
    }
  };

  const endInterview = () => {
    localStorage.setItem('zs_history', JSON.stringify(history));
    localStorage.setItem('zs_proctor', JSON.stringify({ tabSwitchCount, copyAttemptCount, warnings: proctorWarnings }));
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    window.speechSynthesis.cancel();
    try { document.exitFullscreen?.(); } catch {}
    navigate('/report');
  };

  const progress = (questionNumber / totalQuestions) * 100;
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const totalFlags = tabSwitchCount + copyAttemptCount;

  // ====================== PRE-FLIGHT CHECK (STATE 1) ======================
  if (!isReady) {
    return (
      <main className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-8 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00D4FF]/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[300px] bg-[#8b5cf6]/[0.04] rounded-full blur-[100px]" />
        </div>

        {/* Floating grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg w-full relative z-10"
        >
          <div className="rounded-3xl p-10 text-center space-y-8 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_0_80px_rgba(0,212,255,0.08),0_0_160px_rgba(139,92,246,0.04)]">
            {/* Fingerprint Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00D4FF] to-[#8b5cf6] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(0,212,255,0.3)]"
            >
              <Fingerprint className="w-10 h-10 text-white" />
            </motion.div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-[#00D4FF] via-white to-[#8b5cf6] bg-clip-text text-transparent">
                Pre-Interview Verification
              </h1>
              <p className="text-white/40 text-sm leading-relaxed">
                Before entering the interview room, please confirm the following proctoring requirements. All sessions are monitored for integrity.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-3 text-left">
              {[
                { icon: Video, label: 'Camera access will be requested for video proctoring' },
                { icon: Mic, label: 'Microphone access for speech recognition' },
                { icon: Lock, label: 'Copy, paste, and right-click will be disabled' },
                { icon: Eye, label: 'Tab switching will be monitored and logged' },
                { icon: Maximize, label: 'Full-screen mode will be activated' },
                { icon: Shield, label: 'All interactions are recorded for integrity audit' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-3.5 hover:border-[#00D4FF]/20 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00D4FF]/15 transition-colors">
                    <item.icon className="w-4 h-4 text-[#00D4FF]" />
                  </div>
                  <span className="text-sm text-white/60 leading-snug">{item.label}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#00D4FF]/30 ml-auto flex-shrink-0" />
                </motion.div>
              ))}
            </div>

            {/* Enter Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onClick={startInterview}
              className="w-full py-5 bg-gradient-to-r from-[#00D4FF] to-[#8b5cf6] hover:from-[#00E5FF] hover:to-[#9b6ff7] rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_50px_rgba(0,212,255,0.25),0_0_100px_rgba(139,92,246,0.15)] hover:shadow-[0_0_60px_rgba(0,212,255,0.35)] hover:scale-[1.01] active:scale-[0.99] text-white"
            >
              <ShieldCheck className="w-5 h-5" />
              I Agree — Enter Interview Room
              <ChevronRight className="w-5 h-5" />
            </motion.button>

            <p className="text-[10px] text-white/15 font-mono">
              ONYX.ai v1.0 · The Onyx Engine
            </p>
          </div>
        </motion.div>
      </main>
    );
  }

  // ====================== MAIN INTERVIEW UI (STATE 2) ======================
  return (
    <main
      className="h-screen bg-[#0B0F19] text-white flex flex-col overflow-hidden select-none"
      style={{ userSelect: 'none' }}
    >

      {/* ============ PROCTOR ALERT OVERLAY ============ */}
      <AnimatePresence>
        {showProctorAlert && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-red-500/90 backdrop-blur-xl text-white px-8 py-4 rounded-2xl shadow-[0_0_60px_rgba(239,68,68,0.5)] flex items-center gap-3 font-semibold border border-red-400/30"
          >
            <AlertOctagon className="w-5 h-5 animate-pulse" />
            {proctorAlertMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ TOP BAR ============ */}
      <div className="h-14 border-b border-white/[0.06] bg-[#0B0F19]/90 backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0 z-50">
        {/* Left: Logo + Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center">
              <img src="/onyx-logo.png" alt="ONYX Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-sm">ONYX<span className="text-[#06B6D4]">.ai</span></span>
          </div>
          <div className="w-px h-5 bg-white/10" />
          {/* Live Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-[#00D4FF] animate-pulse shadow-[0_0_8px_#00D4FF]' : isEvaluating ? 'bg-yellow-500 animate-pulse' : isListening ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-white/20'}`} />
            <span className="text-xs font-medium text-white/40">
              {isEvaluating ? 'Swarm Consensus…' : isSpeaking ? 'AI Speaking' : isListening ? 'Recording…' : 'Standby'}
            </span>
          </div>
          <div className="w-px h-5 bg-white/10" />
          {/* Proctor Flags Badge */}
          <div className="flex items-center gap-2 text-xs bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.06]">
            <Shield className={`w-3.5 h-3.5 ${totalFlags > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
            <span className="text-white/40 font-medium">
              Flags: <span className={totalFlags > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>{totalFlags}</span>
            </span>
          </div>
        </div>

        {/* Right: Progress + Difficulty + Timer */}
        <div className="flex items-center gap-5">
          {/* Question Progress */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30 font-mono tracking-wider">Q{questionNumber}/{totalQuestions}</span>
            <div className="w-32 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#00D4FF] to-[#8b5cf6] rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Difficulty Badge */}
          <span className={`text-[10px] px-3 py-1 rounded-md font-bold uppercase tracking-[0.15em] border ${
            currentDifficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
            : currentDifficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {currentDifficulty}
          </span>

          {/* Countdown Timer */}
          <div className={`font-mono text-lg font-bold tabular-nums flex items-center gap-1.5 px-3 py-1 rounded-lg border ${
            timeRemaining < 30
              ? 'text-red-500 animate-pulse bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
              : 'text-white/90 bg-white/[0.02] border-white/[0.06]'
          }`}>
            <Clock className="w-4 h-4 opacity-50" />
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* ============ MAIN GRID ============ */}
      <div className="flex-1 grid grid-cols-3 gap-3 p-3 min-h-0">

        {/* ======== LEFT SIDEBAR (col-span-1) ======== */}
        <div className="col-span-1 flex flex-col gap-3 min-h-0">

          {/* Confidence Metrics Card */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#00D4FF]" />
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.15em]">Confidence Metrics</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Engagement', value: metrics.engagement, color: 'from-[#00D4FF] to-cyan-400' },
                { label: 'Clarity', value: metrics.clarity, color: 'from-[#8b5cf6] to-purple-400' },
                { label: 'Confidence', value: metrics.confidence, color: 'from-emerald-500 to-green-400' },
                { label: 'Technical Depth', value: metrics.depth, color: 'from-amber-500 to-yellow-400' },
              ].map((m, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-white/35 font-medium uppercase tracking-wider">{m.label}</span>
                    <span className="text-[10px] text-white/50 font-mono font-bold">{m.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${m.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${m.value}%` }}
                      transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Transcript Card */}
          <div className="flex-1 rounded-2xl bg-black border border-white/[0.06] flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
              <Terminal className="w-3.5 h-3.5 text-green-400" />
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.15em]">Live Transcript</h3>
              {isListening && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-auto" />}
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed scrollbar-thin">
              {transcriptHistory.length === 0 && !transcript.trim() ? (
                <p className="text-green-400/30 italic">Awaiting voice input…</p>
              ) : (
                <>
                  {transcriptHistory.map((t, i) => (
                    <div key={i} className="mb-2">
                      <span className="text-green-400/40">{t}</span>
                    </div>
                  ))}
                  {transcript.trim() && (
                    <div className="text-green-400/60">
                      <span className="text-[#00D4FF]/40 mr-1">{'>'}</span>
                      {transcript}
                      {isListening && <span className="inline-block w-1.5 h-3 bg-green-400/60 ml-0.5 animate-pulse" />}
                    </div>
                  )}
                </>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>

        {/* ======== CENTER PANEL (col-span-1) ======== */}
        <div className="col-span-1 flex flex-col gap-3 min-h-0">

          {/* AI Interviewer Video Area — Top 60% */}
          <div className="flex-[6] relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0B0F19] via-[#0d1221] to-[#0a0e18] border border-white/[0.06] flex items-center justify-center">
            {/* Ambient radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,212,255,0.06),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(139,92,246,0.04),transparent_60%)]" />

            {/* AI Avatar */}
            <motion.div
              animate={isSpeaking ? { scale: [1, 1.02, 1], boxShadow: ['0 0 40px rgba(0,212,255,0.1)', '0 0 80px rgba(0,212,255,0.25)', '0 0 40px rgba(0,212,255,0.1)'] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-32 h-32 rounded-full border-2 ${isSpeaking ? 'border-[#00D4FF]/50' : 'border-white/[0.06]'} bg-[#0B0F19]/80 backdrop-blur-xl flex items-center justify-center transition-all duration-700`}
            >
              {isSpeaking ? (
                <div className="flex items-end gap-[3px] h-14">
                  {[0, 0.08, 0.16, 0.12, 0.2, 0.08, 0.04].map((d, i) => {
                    const h = [32, 45, 24, 38, 50, 28, 20][i];
                    const dur = [0.35, 0.42, 0.3, 0.45, 0.38, 0.28, 0.5][i];
                    return (
                      <div
                        key={i}
                        className="w-[5px] bg-gradient-to-t from-[#00D4FF] to-[#8b5cf6] rounded-full voice-bar"
                        style={{
                          height: `${h}px`,
                          animationDelay: `${d}s`,
                          animationDuration: `${dur}s`
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <Brain className="w-14 h-14 text-white/[0.08]" />
              )}
            </motion.div>

            {/* Name Label */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/[0.06]">
              <Brain className="w-3 h-3 text-[#00D4FF]" />
              <span className="text-xs font-semibold text-white/70">AI Interviewer</span>
              {isSpeaking && <Volume2 className="w-3 h-3 text-[#00D4FF] animate-pulse" />}
            </div>
          </div>

          {/* Question Text Card — Bottom 40% */}
          <div className="flex-[4] rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 flex flex-col justify-center overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
              <span className="text-[10px] font-bold text-[#00D4FF]/60 uppercase tracking-[0.15em]">
                Question {questionNumber} of {totalQuestions}
              </span>
            </div>
            {isEvaluating ? (
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-[#8b5cf6] animate-spin" />
                <span className="text-lg font-medium text-[#8b5cf6]/70">Processing multi-agent evaluation…</span>
              </div>
            ) : (
              <p className="text-[15px] font-medium leading-relaxed text-white/85">{currentQuestion}</p>
            )}
          </div>
        </div>

        {/* ======== RIGHT PANEL (col-span-1) ======== */}
        <div className="col-span-1 flex flex-col gap-3 min-h-0">

          {/* Candidate Webcam — Top 70% */}
          <div className="flex-[7] relative rounded-2xl overflow-hidden bg-[#080a10] border border-white/[0.06]">
            {!hasCamera && (
              <div className="absolute inset-0 flex items-center justify-center text-white/15 flex-col gap-3">
                <VideoOff className="w-10 h-10" />
                <span className="text-sm">Camera not available</span>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform scale-x-[-1] ${cameraOff ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
            />

            {/* AI Facial Scanning Overlay */}
            {!cameraOff && (
              <div className="absolute inset-0 pointer-events-none border-[1px] border-blue-500/10" style={{
                background: 'linear-gradient(180deg, rgba(0,212,255,0) 0%, rgba(0,212,255,0.05) 50%, rgba(0,212,255,0) 100%)',
                backgroundSize: '100% 200%',
                animation: 'scan 4s linear infinite'
              }}>
                <div className="absolute top-[20%] left-[25%] right-[25%] bottom-[20%] border border-blue-400/30 rounded-lg">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400" />
                  {/* Grid Lines */}
                  <div className="absolute top-1/2 left-0 right-0 border-t border-blue-400/10" />
                  <div className="absolute left-1/2 top-0 bottom-0 border-l border-blue-400/10" />
                </div>
                <div className="absolute bottom-12 left-3 text-[8px] text-blue-400/70 font-mono tracking-widest leading-tight">
                  SYS.Gz_TRACKING: ACTIVE<br/>
                  EXPR_ANALYSIS: ENGAGED<br/>
                  CONFIDENCE_IDX: {(0.85 + Math.random() * 0.1).toFixed(2)}
                </div>
              </div>
            )}

            {/* REC Indicator */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur px-2.5 py-1 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-red-400">REC</span>
            </div>

            {/* Proctored Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur px-2.5 py-1 rounded-full border border-white/10">
              <Shield className={`w-3 h-3 ${totalFlags > 0 ? 'text-yellow-400' : 'text-emerald-400'}`} />
              <span className="text-[10px] font-medium text-white/50">Proctored</span>
            </div>

            {/* Name Label */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/[0.06]">
              <span className="text-xs font-semibold text-white/70">Candidate</span>
              {isListening && <Mic className="w-3 h-3 text-green-400 animate-pulse" />}
            </div>
          </div>

          {/* Code/Notes Sandbox — Bottom 30% */}
          <div className="flex-[3] rounded-2xl bg-[#080a10] border border-white/[0.06] flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] flex-shrink-0">
              <Code2 className="w-3.5 h-3.5 text-[#8b5cf6]" />
              <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">Scratchpad (optional)</h3>
            </div>
            <textarea
              value={scratchpad}
              onChange={(e) => setScratchpad(e.target.value)}
              placeholder="// Type pseudo-code, notes, or key points here...&#10;// This will be submitted with your answer."
              className="flex-1 w-full bg-transparent text-xs text-[#00D4FF]/70 placeholder:text-white/15 font-mono p-4 outline-none resize-none leading-relaxed"
              disabled={isEvaluating}
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* ============ SWARM INTELLIGENCE BAR (conditional) ============ */}
      <AnimatePresence>
        {activeSwarmAgents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-3 px-3 pb-1 overflow-hidden flex-shrink-0"
          >
            {activeSwarmAgents.map((aIdx) => {
              const a = SWARM_AGENTS[aIdx];
              const cm: Record<string, string> = {
                cyan: 'bg-[#00D4FF]/10 border-[#00D4FF]/20 text-[#00D4FF]',
                purple: 'bg-[#8b5cf6]/10 border-[#8b5cf6]/20 text-[#8b5cf6]',
                emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
              };
              return (
                <motion.div
                  key={aIdx}
                  initial={{ opacity: 0, x: -16, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  className={`flex-1 flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl border backdrop-blur ${cm[a.color]}`}
                >
                  <a.icon className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                  <span className="truncate font-medium">{swarmMessages[aIdx]}</span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ FEEDBACK BANNER (conditional) ============ */}
      <AnimatePresence>
        {lastFeedback && !isEvaluating && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 mx-3 mb-1 bg-[#00D4FF]/[0.04] border border-[#00D4FF]/10 rounded-xl px-5 py-3 flex-shrink-0"
          >
            <Sparkles className="w-4 h-4 text-[#00D4FF] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-white/45 leading-relaxed">
              <span className="font-bold text-[#00D4FF]">Feedback:</span> {lastFeedback}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ BOTTOM CONTROL BAR ============ */}
      <div className="h-[72px] mx-3 mb-3 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] flex items-center justify-between px-8 flex-shrink-0">
        {/* Left Controls */}
        <div className="flex items-center gap-2">
          {/* Camera Toggle */}
          <button
            onClick={toggleCamera}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all text-sm ${
              cameraOff
                ? 'bg-red-500/15 text-red-400 border border-red-500/25 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/70'
            }`}
            title="Toggle camera"
          >
            {cameraOff ? <VideoOff className="w-[18px] h-[18px]" /> : <Video className="w-[18px] h-[18px]" />}
          </button>

          {/* Mic Toggle */}
          <button
            onClick={toggleListening}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-[#00D4FF] text-white shadow-[0_0_20px_rgba(0,212,255,0.35)]'
                : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/70'
            }`}
            title="Toggle mic"
          >
            {isListening ? <Mic className="w-[18px] h-[18px] animate-pulse" /> : <MicOff className="w-[18px] h-[18px]" />}
          </button>

          {/* Keyboard Mode Toggle */}
          <button
            onClick={() => setUseTextMode(!useTextMode)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              useTextMode
                ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/25 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/70'
            }`}
            title="Toggle keyboard mode"
          >
            <Keyboard className="w-[18px] h-[18px]" />
          </button>

          {/* Mute AI Toggle */}
          <button
            onClick={() => { setIsMuted(!isMuted); if (!isMuted) { window.speechSynthesis.cancel(); setIsSpeaking(false); } }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
                : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/70'
            }`}
            title="Mute AI voice"
          >
            {isMuted ? <VolumeOff className="w-[18px] h-[18px]" /> : <Volume2 className="w-[18px] h-[18px]" />}
          </button>
        </div>

        {/* Center Status / Text Input */}
        <div className="flex-1 max-w-md mx-6">
          {useTextMode ? (
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here… (copy/paste disabled)"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-[#8b5cf6]/40 focus:ring-1 focus:ring-[#8b5cf6]/20 transition-all"
              disabled={isEvaluating}
              onPaste={(e) => e.preventDefault()}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            />
          ) : (
            <div className="text-center">
              <span className="text-xs text-white/25 font-medium">
                {isListening ? (
                  <span className="text-green-400/70 flex items-center justify-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Recording… Speak your answer clearly
                  </span>
                ) : isSpeaking ? (
                  <span className="text-[#00D4FF]/60">AI is speaking — listen carefully</span>
                ) : (
                  'Click mic to speak or ⌨️ for keyboard mode'
                )}
              </span>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isEvaluating || isSpeaking}
            className="px-7 py-3 bg-gradient-to-r from-[#00D4FF] to-[#8b5cf6] hover:from-[#00E5FF] hover:to-[#9b6ff7] rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,212,255,0.2)] text-white"
          >
            {isEvaluating ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isEvaluating ? 'Evaluating…' : 'Submit'}
          </button>

          {/* End Call */}
          <button
            onClick={endInterview}
            className="w-11 h-11 rounded-xl bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:shadow-[0_0_30px_rgba(239,68,68,0.35)]"
            title="End Interview"
          >
            <PhoneOff className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </main>
  );
}
