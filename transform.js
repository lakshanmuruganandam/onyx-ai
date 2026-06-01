const fs = require('fs');
const path = require('path');

const replaceInFile = (filePath, replacements) => {
  let content = fs.readFileSync(filePath, 'utf8');
  replacements.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });
  fs.writeFileSync(filePath, content, 'utf8');
};

const pagesDir = path.join(__dirname, 'frontend/src/pages');

// Home.tsx
replaceInFile(path.join(pagesDir, 'Home.tsx'), [
  { from: /import \{ useRouter \} from 'next\/navigation';/g, to: "import { useNavigate } from 'react-router-dom';" },
  { from: /const router = useRouter\(\);/g, to: "const navigate = useNavigate();" },
  { from: /router\.push/g, to: "navigate" },
]);

// Interview.tsx
replaceInFile(path.join(pagesDir, 'Interview.tsx'), [
  { from: /import \{ useRouter \} from 'next\/navigation';/g, to: "import { useNavigate } from 'react-router-dom';" },
  { from: /const router = useRouter\(\);/g, to: "const navigate = useNavigate();" },
  { from: /router\.push/g, to: "navigate" },
  { from: /\/api\/evaluate/g, to: "http://localhost:5001/api/evaluate" },
]);

// Report.tsx
replaceInFile(path.join(pagesDir, 'Report.tsx'), [
  { from: /import \{ useRouter \} from 'next\/navigation';/g, to: "import { useNavigate } from 'react-router-dom';" },
  { from: /const router = useRouter\(\);/g, to: "const navigate = useNavigate();" },
  { from: /router\.push/g, to: "navigate" },
]);

console.log("Replaced next/navigation with react-router-dom");
