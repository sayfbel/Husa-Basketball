const fs = require('fs');
const path = require('path');

function replaceAssetPaths(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === '.venv' || file === 'dist' || file === '.vite') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceAssetPaths(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updatedContent = content.replace(/\/assets\/players\//g, 'http://localhost:5000/uploads/');
            if (content !== updatedContent) {
                fs.writeFileSync(fullPath, updatedContent, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

replaceAssetPaths('c:/Users/hamza/Desktop/husa-basketball');
