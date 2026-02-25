const fs = require('fs');
const path = require('path');
const routesDir = path.join(__dirname, 'server', 'routes');
let out = '';
fs.readdirSync(routesDir).forEach(file => {
    if (file.endsWith('.js')) {
        try {
            require('./server/routes/' + file);
            out += file + ' OK\n';
        } catch (e) {
            out += 'Error in ' + file + ': ' + e.stack + '\n';
        }
    }
});
fs.writeFileSync('test_out.txt', out);
