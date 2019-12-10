"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const diagram_1 = require("../diagram/diagram");
const tools_1 = require("../diagram/tools");
const languageCompletion_1 = require("./languageCompletion");
const REG_VAR = /[0-9a-z_]+/ig;
const REG_EXCLUDE_LINE = /^\s*(!|@)/i;
// const REG_REMOVE_INLINE_NOTE = /:.+$/i;
// const REG_ENTER_NOTE = /^\s*([rh]?note)(?:\s+(right|left|top|bottom))?(\s+(?:of|over))?[^:]+$/i;
// const REG_LEAVE_NOTE = /^\s*(end\s*[rh]?note)/i
function VariableCompletionItems(target, position, token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!target)
            return [];
        return new Promise((resolve, reject) => {
            let results = collectVariables(target, position, token)
                .map(variable => {
                const item = new vscode.CompletionItem(variable, vscode.CompletionItemKind.Variable);
                item.insertText = new vscode.SnippetString(variable);
                return item;
            });
            resolve(results);
        });
    });
}
exports.VariableCompletionItems = VariableCompletionItems;
function collectVariables(target, position, token) {
    let variables = new Set([]);
    let diagram = target instanceof diagram_1.Diagram ? target : tools_1.diagramAt(target, position);
    let excludeLine = position.line - diagram.start.line;
    // let flagNote = false;
    for (let i = 0; i < diagram.lines.length; i++) {
        if (i == excludeLine)
            continue;
        let line = diagram.lines[i];
        if (REG_EXCLUDE_LINE.test(line))
            continue;
        // if (flagNote) {
        //     // currently in a note block
        //     flagNote = !REG_LEAVE_NOTE.test(line);
        //     continue;
        // }
        // flagNote = REG_ENTER_NOTE.test(line);
        // // FIXME: 
        // // Will remove none-note part if the line like:
        // // :Alice: -> :Bob:: notes
        // line = line.replace(REG_REMOVE_INLINE_NOTE, "");
        let matches;
        REG_VAR.lastIndex = 0;
        while (matches = REG_VAR.exec(line)) {
            if (!languageCompletion_1.dicLanguageWords.has(matches[0]))
                variables.add(matches[0]);
        }
    }
    return Array.from(variables);
}
//# sourceMappingURL=variableCompletion.js.map