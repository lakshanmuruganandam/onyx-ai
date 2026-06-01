const puppeteer = require('puppeteer');

(async () => {
  console.log("🎬 ONYX FULL DEMO Recorder Initializing...");
  
  // Launch browser in full screen
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null, // full screen
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  // 1. Go to Home Page
  console.log("➡️ Navigating to Localhost...");
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  // Wait 4 seconds for the user to start their screen recording
  console.log("⏳ Admiring the Landing Page... Start your screen recording NOW!");
  await new Promise(r => setTimeout(r, 4000));

  // 2. Type JD
  console.log("✍️ Typing Job Description...");
  const jdTextarea = await page.$('textarea[placeholder*="job description"]');
  if (jdTextarea) {
    await jdTextarea.type("Senior React Developer. Looking for strong architectural skills, deep knowledge of hooks, state management, and performance optimization in React applications. Must understand Node.js backends and distributed systems.", { delay: 10 });
  }

  await new Promise(r => setTimeout(r, 1000));

  // 3. Type Resume
  console.log("✍️ Typing Resume...");
  const resumeTextarea = await page.$('textarea[placeholder*="resume"]');
  if (resumeTextarea) {
    await resumeTextarea.type("Lakshan Muruganandam\nSenior Software Engineer\n- Architected high-performance React frontends serving 10M+ users.\n- Built scalable Node.js microservices.\n- Reduced latency by 40% using Redis and advanced query optimization.\n- Expert in Tailwind, Framer Motion, and UI/UX engineering.", { delay: 10 });
  }

  await new Promise(r => setTimeout(r, 1000));

  // 4. Select Technical Interview Type
  console.log("🖱️ Selecting Technical Interview...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Technical');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // 5. Click Start Interview
  console.log("🖱️ Clicking Start Interview...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Join AI Interview Room'));
    if (btn) btn.click();
  });

  // 6. Wait for the Pre-flight checks or directly to interview
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('I Agree'));
    if (btn) btn.click();
  });

  // 7. Wait for AI to ask the first question
  console.log("⏳ Waiting for ONYX to generate the first question...");
  await new Promise(r => setTimeout(r, 6000));

  // 8. Answer Question 1
  console.log("✍️ Typing Answer 1...");
  const answerInput = await page.$('input[placeholder*="Type your answer"]');
  if (answerInput) {
    await answerInput.type("Hello ONYX! I am Lakshan Muruganandam. I have extensive experience building scalable web applications using React and Node.js. In my previous role, I optimized our React rendering cycle by implementing useMemo and useCallback effectively, while re-architecting the backend microservices to handle high throughput using Redis caching.", { delay: 15 });
    
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.press('Enter');
  }

  // 9. Wait for AI to grade and respond with Question 2
  console.log("⏳ Waiting for ONYX to evaluate and ask Question 2...");
  await new Promise(r => setTimeout(r, 7000));

  // 10. Answer Question 2
  console.log("✍️ Typing Answer 2...");
  const answerInput2 = await page.$('input[placeholder*="Type your answer"]');
  if (answerInput2) {
    await answerInput2.type("To design a scalable architecture, I would use a microservices approach with Kubernetes for orchestration. For state management in React, I prefer Zustand over Redux for its minimal boilerplate. On the backend, I would implement horizontal scaling and load balancing to ensure 100% uptime.", { delay: 15 });
    
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.press('Enter');
  }

  // 11. Wait for AI to grade
  console.log("⏳ Waiting for ONYX to evaluate...");
  await new Promise(r => setTimeout(r, 7000));

  // 12. End the Interview
  console.log("🖱️ Clicking End Interview...");
  await page.evaluate(() => {
    const btn = document.querySelector('button[title="End Interview"]');
    if (btn) btn.click();
  });

  // 13. Scroll through Final Report smoothly
  console.log("📜 Scrolling through Final Report...");
  await new Promise(r => setTimeout(r, 4000)); // wait for report to load
  
  // Smooth scroll
  for (let i = 0; i < 15; i++) {
    await page.mouse.wheel({ deltaY: 100 });
    await new Promise(r => setTimeout(r, 500));
  }

  console.log("✅ Demo Finished! Stop your screen recording.");
  
  // Keep browser open for a few seconds before closing
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();

})();
