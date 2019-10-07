'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const utils_1 = require("./utils");
class InfoViewProvider {
    constructor(model, gitService) {
        this._infoDecoration = vscode_1.window.createTextEditorDecorationType({
            color: new vscode_1.ThemeColor('githd.infoView.content')
        });
        this._pathDecoration = vscode_1.window.createTextEditorDecorationType({
            color: new vscode_1.ThemeColor('githd.infoView.path')
        });
        this._oldLineDecoration = vscode_1.window.createTextEditorDecorationType({
            color: new vscode_1.ThemeColor('githd.infoView.old')
        });
        this._newLineDecoration = vscode_1.window.createTextEditorDecorationType({
            color: new vscode_1.ThemeColor('githd.infoView.new')
        });
        this._onDidChange = new vscode_1.EventEmitter();
        this._disposables = [];
        let disposable = vscode_1.workspace.registerTextDocumentContentProvider(InfoViewProvider.scheme, this);
        this._disposables.push(disposable);
        vscode_1.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.uri.scheme === InfoViewProvider.scheme) {
                this._decorate(editor);
            }
        }, null, this._disposables);
        vscode_1.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.scheme === InfoViewProvider.scheme) {
                this._decorate(utils_1.getTextEditor(e.document));
            }
        }, null, this._disposables);
        model.onDidChangeFilesViewContext((context) => __awaiter(this, void 0, void 0, function* () {
            if (!context.leftRef) {
                // It is not a diff of two commits so there will be a commit info update
                this.update(yield gitService.getCommitDetails(context.repo, context.rightRef, context.isStash));
            }
        }), null, this._disposables);
        this._disposables.push(this._onDidChange);
        this._disposables.push(this._infoDecoration, this._pathDecoration, this._oldLineDecoration, this._newLineDecoration);
    }
    get onDidChange() { return this._onDidChange.event; }
    provideTextDocumentContent(uri) {
        return this._content;
    }
    update(content) {
        this._content = content;
        this._onDidChange.fire(InfoViewProvider.defaultUri);
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
InfoViewProvider.scheme = 'githd-line';
InfoViewProvider.defaultUri = vscode_1.Uri.parse(InfoViewProvider.scheme + '://authority/Commit Info');
exports.InfoViewProvider = InfoViewProvider;
//# sourceMappingURL=infoViewProvider.js.map