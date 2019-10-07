'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function isDebugging() {
    const args = process.execArgv;
    return args && args.some(arg => arg.startsWith('--inspect'));
}
class Logger {
    static log(message) {
        if (this._debugging) {
            console.log(message);
        }
        this._output.appendLine(message);
    }
}
Logger._output = vscode_1.window.createOutputChannel('GitHD');
Logger._debugging = isDebugging();
exports.Logger = Logger;
//# sourceMappingURL=trace.js.map