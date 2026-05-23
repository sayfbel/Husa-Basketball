const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../../client/src/assets/images/T-shirts');
const destDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const filesToCopy = {
    '542207433_17887122501357067_4280698276740856535_n..jpg': '542207433_17887122501357067_4280698276740856535_n..jpg',
    'Gemini_Generated_Image_ceomz6ceomz6ceom.png': 'Gemini_Generated_Image_ceomz6ceomz6ceom.png',
    '540271147_17886699834357067_1641371197587090454_n..jpg': '540271147_17886699834357067_1641371197587090454_n..jpg',
    'e37a7414-1b79-4bc6-8769-c7858fbe33b4.png': 'e37a7414-1b79-4bc6-8769-c7858fbe33b4.png'
};

Object.keys(filesToCopy).forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, filesToCopy[file]);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file} to uploads`);
    } else {
        console.error(`Source file not found: ${srcPath}`);
    }
});
