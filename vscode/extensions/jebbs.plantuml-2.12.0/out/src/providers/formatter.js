"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const tools_1 = require("../plantuml/tools");
const formatRules_1 = require("../plantuml/formatRules");
const fmt = require("../plantuml/formatter/formatter");
class Formatter extends vscode.Disposable {
    constructor() {
        super(() => this.dispose());
        this._disposables = [];
        this._formatter = new fmt.Formatter(formatRules_1.formatRules, {
            allowInlineFormat: false,
            allowSplitLine: true,
            newLineForBlockStart: false
        });
        this._disposables.push(vscode.languages.registerDocumentFormattingEditProvider([
            { scheme: 'file', language: "diagram" },
            { scheme: 'untitled', language: "diagram" },
        ], this));
    }
    dispose() {
        this._disposables && this._disposables.length && this._disposables.map(d => d.dispose());
    }
    provideDocumentFormattingEdits(document, options, token) {
        try {
            if (vscode.workspace.getConfiguration("editor", document.uri).get("formatOnSave")) {
                console.log("PlantUML format disabled when 'editor.formatOnSave' is on, because it is not reliable enough.");
                return;
            }
            return this._formatter.formate(document, options, token);
        }
        catch (error) {
            tools_1.showMessagePanel(tools_1.parseError(error));
        }
    }
}
exports.Formatter = Formatter;
//# sourceMappingURL=formatter.js.map