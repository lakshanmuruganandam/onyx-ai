import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DemoLoader() {
  const navigate = useNavigate();

  useEffect(() => {
    // Fake History (3 questions) - ~32% Average
    const history = [
      {
        question: "Can you explain how you would architect a distributed Redis caching layer for a high-traffic Node.js microservice?",
        answer: "I would use Redis to cache the database queries. Maybe put it in front of MySQL. If it fails, we just query the database directly. I think that's how microservices do it.",
        timeTaken: 110,
        difficulty: "Hard",
        evaluation: { accuracy: 40, clarity: 50, depth: 20, relevance: 40, timeEfficiency: 60, strengthTags: ["Communicative"], weaknessTags: ["System Design"] }
      },
      {
        question: "How do you handle React rendering performance when dealing with deeply nested component trees and frequent state updates?",
        answer: "I just use React.memo on every single component so it doesn't re-render. And maybe use Redux for everything.",
        timeTaken: 85,
        difficulty: "Medium",
        evaluation: { accuracy: 20, clarity: 40, depth: 10, relevance: 30, timeEfficiency: 70, strengthTags: ["Redux mention"], weaknessTags: ["React.memo Anti-pattern", "Concurrency"] }
      },
      {
        question: "Describe your approach to mitigating cache stampedes (thundering herd problem) in a distributed system.",
        answer: "I don't know what a cache stampede is. I would probably just add more Redis servers.",
        timeTaken: 45,
        difficulty: "Hard",
        evaluation: { accuracy: 5, clarity: 30, depth: 5, relevance: 10, timeEfficiency: 80, strengthTags: [], weaknessTags: ["Cache Stampedes", "Redlock", "Eventual Consistency"] }
      }
    ];

    // Fake Proctor Data
    const proctor = {
      tabSwitchCount: 3,
      copyAttemptCount: 1,
      warnings: ["Tab switched during Q1", "Copy paste attempted during Q3"]
    };

    // Fake Final Report
    const finalReport = {
      overallAnalysis: "The candidate demonstrated severe gaps in system design and React performance optimization. Responses lacked architectural depth and relied heavily on anti-patterns. The communication style was average but lacked technical rigor.",
      strengths: [
        "Basic familiarity with React ecosystem tools like Redux.",
        "Understands that Redis can be used to scale microservices, although application details are lacking."
      ],
      weaknesses: [
        "Distributed Caching: Failed to understand cache stampede mitigation. Lacked knowledge of probabilistic early expiration or distributed locking.",
        "React Rendering Lifecycle: Suggested wrapping all components in React.memo, demonstrating a misunderstanding of memory overhead vs rendering cost."
      ],
      resumeUpgrades: [
        "OLD: Optimized React frontend and Node backend.\nNEW: Engineered memoized React architectures and optimized Node.js microservice latency using Redis caching layers."
      ],
      technicalUpgrades: [
        "Learn and implement advanced React 18 concurrent rendering features (useTransition).",
        "Study the 'Designing Data-Intensive Applications' book, specifically Chapter 6 on distributed caching strategies and partition tolerance."
      ],
      actionPlan: "Over the next 30 days, the candidate must deeply study distributed consensus and caching strategies. They should build a scratchpad React project leveraging concurrent rendering without relying on global state stores."
    };

    localStorage.setItem('zs_history', JSON.stringify(history));
    localStorage.setItem('zs_proctor', JSON.stringify(proctor));
    localStorage.setItem('zs_final_report_data', JSON.stringify(finalReport));
    localStorage.setItem('zs_weights', JSON.stringify({ accuracy: 30, clarity: 15, depth: 30, relevance: 15, timeEfficiency: 10 }));
    localStorage.setItem('zs_jd', 'Full Stack Developer');
    localStorage.setItem('zs_resume', 'Candidate Resume');

    // Redirect to the actual report page
    navigate('/report');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
      <div className="text-center animate-pulse">
        <h1 className="text-2xl font-bold text-cyan-400 mb-2">Injecting 32% Failed Demo Data...</h1>
        <p className="text-white/50">Redirecting to Evaluation Report...</p>
      </div>
    </div>
  );
}
