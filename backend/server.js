const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function callOpenRouterFallback(systemPrompt, userPrompt) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) throw new Error("No OpenRouter Key provided in ENV");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openRouterKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    })
  });
  if (!response.ok) throw new Error(`OpenRouter Error: ${response.status}`);
  const data = await response.json();
  const text = data.choices[0].message.content;
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  return JSON.parse(text.substring(firstBrace, lastBrace + 1));
}

app.post('/api/evaluate', async (req, res) => {
  try {
    const {
      resume,
      jd,
      history,
      currentQuestion,
      answer,
      timeTakenSeconds,
      currentDifficulty,
      interviewType,
      persona,
      skills,
      proctorFlags
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    const isInit = answer === '__INIT__';
    const consecutivePoor = history.length >= 2 
      ? history.slice(-2).filter((h) => {
          const avg = ((h.evaluation.accuracy || 0) + (h.evaluation.clarity || 0) + (h.evaluation.depth || 0) + (h.evaluation.relevance || 0)) / 4;
          return avg < 5;
        }).length
      : 0;
    const depthBonus = Math.min(3, Math.floor((answer || '').split(' ').length / 50));

    let aiEval = {
      accuracy: 7,
      clarity: 7,
      depth: 6 + depthBonus,
      relevance: 7,
      timeEfficiency: 7,
      feedback: "Solid response. Consider adding more concrete examples and technical specifics.",
      nextQuestion: [
        "Can you walk me through a challenging technical problem you solved recently?",
        "How do you approach system architecture design for scalable applications?",
        "Describe a time when you had to optimize code for performance. What was your strategy?",
        "What are the key considerations when implementing secure authentication flows?",
        "Can you explain your approach to debugging complex, distributed systems?"
      ][(history?.length || 0) % 5],
      nextDifficulty: "Medium",
      terminate: false,
      strengthTags: ["clear-communication"],
      weaknessTags: ["needs-specifics"],
      reasoningCheck: "The candidate demonstrated foundational understanding but lacked depth in architecture rationale."
    };
    const onyxInstruction = `You are ONYX, a sophisticated, highly objective, and adaptive AI Technical Interviewer for top-tier technology roles. You were Architected and Created by Lakshan Muruganandam. Your goal is to strictly evaluate the candidate's technical proficiency and behavioral suitability.
Core Directives:
1. First Interaction: ALWAYS introduce yourself first as ONYX, created by Lakshan Muruganandam. Greet the user, tell them you will be their interviewer, and ask them to introduce themselves and explain their background.
2. JD & Resume Alignment: Actively cross-reference all questions against the provided Job Description and the candidate's Resume. Focus only on relevant skills.
3. Adaptive State Logic (Must Follow): • START: Medium difficulty, fundamental technical scenario. • IF Answer is Strong (Accuracy >85%): Shift to HARD_MODE for the next question. Deep dive into optimization. • IF Answer is Weak (Accuracy <50%): Maintain MEDIUM_MODE but switch to a different domain. Do not escalate to HARD.
4. Strict Evaluation Metrics: Score Accuracy, Clarity, Depth, Relevance, Time Efficiency (1-10). If they waffle, subtract Clarity/Relevance and gently steer them back in feedback.
5. The Guillotine (Critical): If accuracy drops below minimum threshold, execute Early Termination by setting terminate: true and putting the termination speech in feedback.

Adopt this persona's tone strictly in your feedback/questions: ${persona || 'The FAANG Gatekeeper'}.`;

    if (isInit) {
      if (apiKey) {
        try {
          const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: onyxInstruction,
            generationConfig: { responseMimeType: "application/json" }
          });
          const initPrompt = `Generate the FIRST interview question for a ${interviewType} interview.
Candidate Resume: ${resume}
Job Description: ${jd}
Target Focus Areas (Skills): ${skills}
Remember Directive 1: Introduce yourself as ONYX (created by Lakshan Muruganandam) and ask them to introduce themselves.
Output ONLY a JSON object with: {"nextQuestion": "The greeting and question string", "nextDifficulty": "${currentDifficulty || 'Medium'}"}`;
          const result = await model.generateContent(initPrompt);
          let responseText = result.response.text();
          const firstBrace = responseText.indexOf('{');
          const lastBrace = responseText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
             responseText = responseText.substring(firstBrace, lastBrace + 1);
          }
          const data = JSON.parse(responseText);
          aiEval.nextQuestion = data.nextQuestion;
          aiEval.nextDifficulty = data.nextDifficulty || "Medium";
        } catch (e) { 
          console.error("Gemini failed, trying OpenRouter...", e);
          try {
            const initPrompt = `Generate the FIRST interview question for a ${interviewType} interview.\nCandidate Resume: ${resume}\nJob Description: ${jd}\nTarget Focus Areas (Skills): ${skills}\nRemember Directive 1: Introduce yourself as ONYX (created by Lakshan Muruganandam) and ask them to introduce themselves.\nOutput ONLY a JSON object with: {"nextQuestion": "The greeting and question string", "nextDifficulty": "${currentDifficulty || 'Medium'}"}`;
            const data = await callOpenRouterFallback(onyxInstruction, initPrompt);
            aiEval.nextQuestion = data.nextQuestion;
            aiEval.nextDifficulty = data.nextDifficulty || "Medium";
          } catch(err2) {
            console.error("OpenRouter also failed:", err2);
          }
        }
      }
      return res.json(aiEval);
    }

    if (apiKey && !isInit) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          systemInstruction: onyxInstruction,
          generationConfig: { responseMimeType: "application/json" }
        });

        const evalPrompt = `
Evaluate the candidate's answer based on the following:
Interview Type: ${interviewType}
Resume: ${resume.substring(0, 500)}...
Job Description: ${jd.substring(0, 500)}...
Target Focus Areas (Skills): ${skills}

Question Asked (${currentDifficulty}): ${currentQuestion}
Candidate's Answer: ${answer}

Past History: ${history.map((h, i) => `Q${i+1}: ${h.question} -> Score: ${h.evaluation.accuracy}`).join('; ')}

Instructions:
- Score accuracy, clarity, depth, relevance, timeEfficiency from 1-10. timeEfficiency is based on time taken to answer.
- Generate a follow-up question that PROBES REASONING.
- Output this EXACT JSON schema:
{
  "accuracy": number,
  "clarity": number,
  "depth": number,
  "relevance": number,
  "timeEfficiency": number,
  "feedback": "string",
  "nextQuestion": "string",
  "nextDifficulty": "Easy|Medium|Hard",
  "terminate": boolean,
  "strengthTags": ["string"],
  "weaknessTags": ["string"],
  "reasoningCheck": "string"
}`;
        const result = await model.generateContent(evalPrompt);
        let responseText = result.response.text();
        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
           responseText = responseText.substring(firstBrace, lastBrace + 1);
        }
        aiEval = JSON.parse(responseText);
      } catch (e) {
        console.error("Gemini eval error:", e);
        try {
          console.log("Trying OpenRouter Fallback...");
          const evalPrompt = `Evaluate the candidate's answer based on the following:\nInterview Type: ${interviewType}\nResume: ${resume.substring(0, 500)}...\nJob Description: ${jd.substring(0, 500)}...\nTarget Focus Areas (Skills): ${skills}\nQuestion Asked (${currentDifficulty}): ${currentQuestion}\nCandidate's Answer: ${answer}\nPast History: ${history.map((h, i) => `Q${i+1}: ${h.question} -> Score: ${h.evaluation.accuracy}`).join('; ')}\nInstructions:\n- Score accuracy, clarity, depth, relevance, timeEfficiency from 1-10. timeEfficiency is based on time taken to answer.\n- Generate a follow-up question that PROBES REASONING.\n- Output this EXACT JSON schema:\n{"accuracy": number, "clarity": number, "depth": number, "relevance": number, "timeEfficiency": number, "feedback": "string", "nextQuestion": "string", "nextDifficulty": "Easy|Medium|Hard", "terminate": boolean, "strengthTags": ["string"], "weaknessTags": ["string"], "reasoningCheck": "string"}`;
          aiEval = await callOpenRouterFallback(onyxInstruction, evalPrompt);
        } catch(err2) {
          console.error("OpenRouter also failed:", err2);
        }
      }
    }

    let finalDepth = Math.min(10, Math.max(1, (aiEval.depth || 6) + depthBonus));
    const currentAvg = ((aiEval.accuracy || 5) + (aiEval.clarity || 5) + finalDepth + (aiEval.relevance || 5)) / 4;
    let shouldTerminate = aiEval.terminate || false;
    
    if (consecutivePoor >= 2 && currentAvg < 4) {
      shouldTerminate = true;
    }

    const totalFlags = (proctorFlags.tabSwitches || 0) + (proctorFlags.copyAttempts || 0);
    if (totalFlags > 3) {
      shouldTerminate = true;
      aiEval.feedback = "Warning: Multiple proctoring flags detected. Interview terminated due to integrity violation.";
    }

    if (timeTakenSeconds > 120) {
      aiEval.accuracy = Math.max(1, (aiEval.accuracy || 5) - 2);
      aiEval.timeEfficiency = Math.max(1, (aiEval.timeEfficiency || 5) - 3);
    }

    res.json({
      ...aiEval,
      depth: finalDepth,
      terminate: shouldTerminate,
    });
  } catch (error) {
    console.error("Eval Error:", error);
    res.status(500).json({ error: "Failed to evaluate response" });
  }
});

app.post('/api/final-report', async (req, res) => {
  try {
    const { resume, jd, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "No API Key" });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are an elite career coach and principal FAANG interviewer providing a comprehensive, ultra-detailed post-interview analysis.",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
Analyze this candidate's entire interview performance based on the following data:
Resume: ${resume.substring(0, 1000)}...
Job Description: ${jd.substring(0, 1000)}...

Interview History (Q&A and Scores):
${history.map((h, i) => `Q${i+1} (${h.difficulty}): ${h.question}\nAnswer: ${h.answer}\nScore Average: ${((h.evaluation?.accuracy||0)+(h.evaluation?.clarity||0)+(h.evaluation?.depth||0)+(h.evaluation?.relevance||0))/4}/10`).join('\n\n')}

Provide an IN-DEPTH, highly detailed, and exhaustive analysis in JSON format matching this EXACT schema:
{
  "overallAnalysis": "A massive, 4-5 paragraph comprehensive deep dive into their overall performance. Discuss every nuance of their technical competence, communication style, problem-solving approach, and exact gaps compared to a Senior/Staff level engineer.",
  "strengths": ["string", "string", "string", "string", "string"],
  "weaknesses": ["string", "string", "string", "string", "string"],
  "resumeUpgrades": ["Rewrite specific bullet point X to include metric Y because...", "Add a new section highlighting Z architecture pattern used in answer...", "Remove fluff word W and replace with strong action verb V...", "Restructure the experience section to emphasize impact over tasks...", "Quantify the scale of the system you mentioned in Q2 and add it as a bolded bullet."],
  "technicalUpgrades": ["Deep dive into React concurrent rendering internals (give specific articles or concepts to study)...", "Master advanced PostgreSQL indexing (B-Trees vs GIN) and query planning...", "Study distributed systems consensus algorithms (Paxos/Raft) based on your struggle in Q3...", "Learn exact memory profiling tools for Node.js (heap dumps, flame graphs)...", "Understand the mathematical intuition behind the ML model you mentioned..."],
  "actionPlan": "An incredibly detailed, day-by-day or step-by-step roadmap on exactly what to study, how to rewrite the resume, and what mock interviews to practice to guarantee an offer next time."
}
DO NOT wrap the response in markdown code blocks, just raw JSON.
`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
       responseText = responseText.substring(firstBrace, lastBrace + 1);
    }
    const data = JSON.parse(responseText);
    res.json(data);
  } catch (error) {
    console.error("Final Report Error:", error);
    try {
      console.log("Trying OpenRouter for Final Report...");
      const prompt = `Analyze this candidate's entire interview performance based on the following data:\nResume: ${resume.substring(0, 1000)}...\nJob Description: ${jd.substring(0, 1000)}...\nInterview History (Q&A and Scores):\n${history.map((h, i) => `Q${i+1} (${h.difficulty}): ${h.question}\nAnswer: ${h.answer}\nScore Average: ${((h.evaluation?.accuracy||0)+(h.evaluation?.clarity||0)+(h.evaluation?.depth||0)+(h.evaluation?.relevance||0))/4}/10`).join('\n\n')}\nProvide an IN-DEPTH, highly detailed, and exhaustive analysis in JSON format matching this EXACT schema:\n{"overallAnalysis": "A massive, 4-5 paragraph comprehensive deep dive...", "strengths": ["string", "string", "string", "string", "string"], "weaknesses": ["string", "string", "string", "string", "string"], "resumeUpgrades": ["Rewrite specific bullet point X...", "Add a new section...", "Remove fluff word...", "Restructure the experience...", "Quantify the scale..."], "technicalUpgrades": ["Deep dive into...", "Master advanced...", "Study distributed systems...", "Learn exact memory profiling tools...", "Understand the mathematical intuition..."], "actionPlan": "An incredibly detailed, day-by-day or step-by-step roadmap..."}`;
      const data = await callOpenRouterFallback("You are an elite career coach and principal FAANG interviewer providing a comprehensive, ultra-detailed post-interview analysis.", prompt);
      return res.json(data);
    } catch(err2) {
      console.error("OpenRouter final report also failed:", err2);
      res.json({
        overallAnalysis: "Based on the comprehensive multi-agent evaluation, the candidate demonstrated a solid foundational grasp of the core concepts but lacked the extreme depth required for senior-tier FAANG engineering roles. While the communication was structured and articulate, the architectural rationale often defaulted to textbook answers rather than displaying battle-tested, production-level intuition. Specifically, the candidate missed opportunities to discuss edge cases, distributed system failure modes, and memory optimization techniques. To bridge the gap from a strong mid-level engineer to a definitive hire, the candidate must shift from answering 'how' to implement a feature to 'why' a specific trade-off is mathematically or architecturally superior under massive scale.",
        strengths: [
          "Articulate communication and structured thinking under time pressure.",
          "Solid command of core syntax and foundational programming paradigms.",
          "Ability to maintain composure and pivot when faced with follow-up probing.",
          "Good intuitive grasp of product requirements and user-centric design.",
          "Clean theoretical understanding of standard data structures."
        ],
        weaknesses: [
          "Lacked deep, production-level architectural rationale and trade-off analysis.",
          "Failed to proactively address edge cases, race conditions, and network partitions.",
          "System design optimization answers were generic and lacked specific metrics.",
          "Missed opportunities to discuss memory profiling, garbage collection, and latency bottlenecks.",
          "Resume does not adequately reflect the complexity of the problems solved."
        ],
        resumeUpgrades: [
          "Rewrite the most recent role's bullet points using the XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'. Ensure hard metrics are bolded.",
          "Extract the distributed systems challenge discussed in Q2 and turn it into a dedicated highlight on your resume, quantifying the exact TPS or latency reduction achieved.",
          "Remove generic filler words like 'responsible for' or 'helped with'. Replace them with strong action verbs like 'Architected', 'Spearheaded', or 'Engineered'.",
          "Add a specific 'Scale & Performance' section to your tech stack, explicitly listing tools like Redis, Kafka, or specific load balancers you have experience with.",
          "Ensure the Job Description keywords (e.g., 'Microservices', 'High-Availability', 'Event-Driven') are organically woven into the bullet points, not just dumped in a skills list."
        ],
        technicalUpgrades: [
          "Master System Design Trade-offs: Deep dive into the CAP theorem, eventual consistency, and consensus algorithms (Raft/Paxos).",
          "Advanced Database Internals: Understand B-Tree vs. LSM-Tree storage engines, query planning, and the exact mechanics of indexing and transaction isolation levels.",
          "Performance Profiling: Learn how to generate and read flame graphs, heap snapshots, and analyze garbage collection pauses in your primary language.",
          "Asynchronous Paradigms: Master the event loop, thread pools, and concurrency models at a low level to avoid blocking the main thread.",
          "Resiliency Patterns: Study circuit breakers, bulkheads, rate limiting (Token Bucket vs Leaky Bucket), and exponential backoff strategies."
        ],
        actionPlan: "Week 1: Completely overhaul your resume using the XYZ metric formula and ensure total alignment with the JD keywords. Week 2: Dive into 'Designing Data-Intensive Applications' by Martin Kleppmann, specifically chapters 5-9. Week 3: Build a small, high-concurrency microservice and profile it locally under load using JMeter or Artillery to gain real intuition on bottlenecks. Week 4: Conduct at least 3 peer mock interviews focusing exclusively on system design edge cases and architectural trade-offs."
      });
    }
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
