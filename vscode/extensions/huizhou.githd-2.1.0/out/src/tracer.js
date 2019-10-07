'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
var TraceLevel;
(function (TraceLevel) {
    TraceLevel[TraceLevel["Silent"] = 0] = "Silent";
    TraceLevel[TraceLevel["Error"] = 1] = "Error";
    TraceLevel[TraceLevel["Warning"] = 2] = "Warning";
    TraceLevel[TraceLevel["Info"] = 3] = "Info";
    TraceLevel[TraceLevel["Verbose"] = 4] = "Verbose";
})(TraceLevel || (TraceLevel = {}));
function isDebugging() {
    const args = process.execArgv;
    return args && args.some(arg => arg.startsWith('--inspect'));
}
class Tracer {
    static set level(value) {
        if (value === 'error') {
            this._level = TraceLevel.Error;
        }
        else if (value === 'warning') {
            this._level = TraceLevel.Warning;
        }
        else if (value === 'info') {
            this._level = TraceLevel.Info;
        }
        else if (value === 'verbose') {
            this._level = TraceLevel.Verbose;
        }
        else {
            this._level = TraceLevel.Silent;
        }
    }
    static verbose(message) {
        this._log(message, TraceLevel.Verbose);
    }
    static info(message) {
        this._log(message, TraceLevel.Info);
    }
    static warning(message) {
        this._log(message, TraceLevel.Warning);
    }
    static error(message) {
        this._log(message, TraceLevel.Error);
    }
    static get output() {
        if (!this._output) {
            this._output = vscode_1.window.createOutputChannel('GitHD');
        }
        return this._output;
    }
    static get timestamp() {
        return (new Date()).toISOString().split('T')[1].replace('Z', '');
    }
    static _log(message, level) {
        if (this._debugging || this._level >= level) {
            message = `[${this.timestamp}][${TraceLevel[level]}] ${message}`;
            if (this._debugging) {
                console.log('[GitHD]', message);
            }
            if (this._level >= level) {
                this.output.appendLine(message);
            }
        }
    }
}
Tracer._output = null;
Tracer._level = TraceLevel.Silent;
Tracer._debugging = isDebugging();
exports.Tracer = Tracer;
//# sourceMappingURL=tracer.js.map