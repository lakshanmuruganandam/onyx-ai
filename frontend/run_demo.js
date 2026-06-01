const puppeteer = require('puppeteer');

(async () => {
  console.log("🎬 ONYX Demo Recorder Initializing...");
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  // 1. Go to Home Page
  console.log("➡️ Navigating to Localhost...");
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  // Wait 3 seconds for the user to start their screen recording
  console.log("⏳ Waiting 3 seconds... Start your screen recording NOW!");
  await new Promise(r => setTimeout(r, 3000));

  // 2. Type JD
  console.log("✍️ Typing Job Description...");
  const jdTextarea = await page.$('textarea[placeholder*="job description"]');
  if (jdTextarea) {
    await jdTextarea.type("Senior React Developer. Looking for strong architectural skills, deep knowledge of hooks, state management, and performance optimization in React applications. Must understand Node.js backends and distributed systems.", { delay: 15 });
  }

  // 3. Type Resume
  console.log("✍️ Typing Resume...");
  const resumeTextarea = await page.$('textarea[placeholder*="resume"]');
  if (resumeTextarea) {
    await resumeTextarea.type("Lakshan Muruganandam\nSenior Software Engineer\n- Architected high-performance React frontends serving 10M+ users.\n- Built scalable Node.js microservices.\n- Reduced latency by 40% using Redis and advanced query optimization.\n- Expert in Tailwind, Framer Motion, and UI/UX engineering.", { delay: 15 });
  }

  // 4. Click Start Interview
  console.log("🖱️ Clicking Start Interview...");
  await new Promise(r => setTimeout(r, 1000));
  
  // Find the button that says "Start Interview"
  const startBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Start Interview'));
  });
  if (startBtn) {
    await startBtn.click();
  }

  // 5. Wait for the Interview page to load and the AI to ask the first question
  console.log("⏳ Waiting for ONYX to generate the first question...");
  await new Promise(r => setTimeout(r, 6000));

  // 6. Answer the question
  console.log("✍️ Typing Answer...");
  const answerInput = await page.$('input[placeholder*="Type your answer"]');
  if (answerInput) {
    await answerInput.type("Hello ONYX. I am Lakshan Muruganandam. I have extensive experience building scalable web applications using React and Node.js. In my previous role, I optimized our React rendering cycle by implementing useMemo and useCallback effectively, while re-architecting the backend microservices to handle high throughput using Redis caching. I am excited to bring my architectural expertise to this role.", { delay: 20 });
    
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.press('Enter');
  }

  // 7. Wait for AI to grade and respond
  console.log("⏳ Waiting for ONYX to evaluate...");
  await new Promise(r => setTimeout(r, 6000));

  // 8. End the Interview
  console.log("🖱️ Clicking End Interview...");
  const endBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('End Interview'));
  });
  if (endBtn) {
    await endBtn.click();
  }

  // 9. Scroll through Final Report
  console.log("📜 Scrolling through Final Report...");
  await new Promise(r => setTimeout(r, 4000));
  
  await page.mouse.wheel({ deltaY: 400 });
  await new Promise(r => setTimeout(r, 2000));
  await page.mouse.wheel({ deltaY: 400 });
  await new Promise(r => setTimeout(r, 2000));
  await page.mouse.wheel({ deltaY: 500 });
  await new Promise(r => setTimeout(r, 3000));

  console.log("✅ Demo Finished! Stop your screen recording.");
  
  // Keep browser open for a few seconds before closing
  await new Promise(r => setTimeout(r, 4000));
  await browser.close();

})();
