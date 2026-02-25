const fs = require('fs');

const path = 'c:/Users/hamza/Desktop/husa-basketball/client/src/pages/CoachDashboard/pages/Match.jsx';
let content = fs.readFileSync(path, 'utf8');

// Regex to find git merge conflicts and resolve with HEAD
// The format is <<<<<<< HEAD\n(content)\n=======\n(content)\n>>>>>>> [commit]\n
const conflictRegex = /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>> [a-f0-9]+\r?\n/g;

content = content.replace(conflictRegex, '$1');

fs.writeFileSync(path, content, 'utf8');
console.log('Conflicts resolved using HEAD');
