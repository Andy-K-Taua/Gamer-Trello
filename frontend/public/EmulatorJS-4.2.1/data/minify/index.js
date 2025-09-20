import { parse, minify as _minify } from "uglify-js";
import { readFileSync, writeFileSync } from 'fs';
import { processString } from 'uglifycss';

const scripts = [
    "emulator.js",
    "nipplejs.js",
    "shaders.js",
    "storage.js",
    "gamepad.js",
    "GameManager.js",
    "socket.io.min.js",
    "compression.js"
];
let code = "(function() {\n";
for (let i=0; i<scripts.length; i++) {
    code += readFileSync('../src/'+scripts[i], 'utf8') + "\n";
}
code += "\n})();"

function minify(source){
    const ast = parse(source);
    return _minify(ast).code;
}
console.log('minifying');
writeFileSync('../emulator.min.css', processString(readFileSync('../emulator.css', 'utf8')));
writeFileSync('../emulator.min.js', minify(code));
console.log('done!');
