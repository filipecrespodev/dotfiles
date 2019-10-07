'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const utils_1 = require("./utils");
class LineDiffViewProvider {
    constructor() {
        this._infoDecoration = vscode_1.window.createTextEditorDecorationType({
            // comment color
            light: { color: '#008000' },
            dark: { color: '#608b4e' }
        });
        this._pathDecoration = vscode_1.window.createTextEditorDecorationType({
            light: { color: '#000080' },
            dark: { color: '#569CD6' }
        });
        this._oldLineDecoration = vscode_1.window.createTextEditorDecorationType({
            light: { color: '#A31515' },
            dark: { color: '#CE9178' }
        });
        this._newLineDecoration = vscode_1.window.createTextEditorDecorationType({
            light: { color: '#09885A' },
            dark: { color: '#B5CEA8' }
        });
        this._onDidChange = new vscode_1.EventEmitter();
        this._disposables = [];
        let disposable = vscode_1.workspace.registerTextDocumentContentProvider(LineDiffViewProvider.scheme, this);
        this._disposables.push(disposable);
        vscode_1.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.uri.scheme === LineDiffViewProvider.scheme) {
                this._decorate(editor);
            }
        }, null, this._disposables);
        this._disposables.push(this._onDidChange);
        this._disposables.push(this._infoDecoration, this._pathDecoration, this._oldLineDecoration, this._newLineDecoration);
    }
    get onDidChange() { return this._onDidChange.event; }
    provideTextDocumentContent(uri) {
        return this._content;
    }
    update(content) {
        this._content = content;
        this._onDidChange.fire(LineDiffViewProvider.defaultUri);
    }
    dispose() {
        this._disposables.forEach(d => d.dispose());
    }
    _decorate(editor) {
        if (this._content) {
            let infoRanges = [];
            let pathRanges = [];
            let oldLineRange = [];
            let newLineRange = [];
            let diffStarted = false;
            let i = 0;
            this._content.split(/\r?\n/g).forEach(line => {
                if (line.substr(0, 7) == 'diff --') {
                    diffStarted = true;
                    utils_1.decorateWithoutWhitspace(pathRanges, line, i, 0);
                }
                else if (line.substr(0, 4) == '--- ') {
                    utils_1.decorateWithoutWhitspace(pathRanges, line, i, 0);
                }
                else if (line.substr(0, 4) == '+++ ') {
                    utils_1.decorateWithoutWhitspace(pathRanges, line, i, 0);
                }
                else if (line[0] == '-') {
                    utils_1.decorateWithoutWhitspace(oldLineRange, line, i, 0);
                }
                else if (line[0] == '+') {
                    utils_1.decorateWithoutWhitspace(newLineRange, line, i, 0);
                }
                else if (!diffStarted) {
                    utils_1.decorateWithoutWhitspace(infoRanges, line, i, 0);
                }
                ++i;
            });
            editor.setDecorations(this._infoDecoration, infoRanges);
            editor.setDecorations(this._pathDecoration, pathRanges);
            editor.setDecorations(this._oldLineDecoration, oldLineRange);
            editor.setDecorations(this._newLineDecoration, newLineRange);
        }
    }
}
LineDiffViewProvider.scheme = 'githd-line';
LineDiffViewProvider.defaultUri = vscode_1.Uri.parse(LineDiffViewProvider.scheme + '://authority/Line Diff');
exports.LineDiffViewProvider = LineDiffViewProvider;
//# sourceMappingURL=lineDiffViewProvider.js.map