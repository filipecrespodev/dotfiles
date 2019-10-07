'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function decorateWithoutWhitspace(ranges, target, line, offset) {
    let start = 0;
    let newWord = true;
    let i = 0;
    for (; i < target.length; ++i) {
        if (target[i] === ' ' || target[i] === '\t' || target[i] === '\n') {
            if (!newWord) {
                newWord = true;
                ranges.push(new vscode_1.Range(line, offset + start, line, offset + i));
            }
        }
        else {
            if (newWord) {
                newWord = false;
                start = i;
            }
        }
    }
    if (!newWord) {
        ranges.push(new vscode_1.Range(line, offset + start, line, offset + i));
    }
}
exports.decorateWithoutWhitspace = decorateWithoutWhitspace;
function getTextEditor(document) {
    return vscode_1.window.visibleTextEditors.find(editor => editor.document === document);
}
exports.getTextEditor = getTextEditor;
//# sourceMappingURL=utils.js.map