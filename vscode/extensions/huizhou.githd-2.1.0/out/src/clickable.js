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
const tracer_1 = require("./tracer");
const utils_1 = require("./utils");
class ClickableProvider {
    constructor(_scheme) {
        this._scheme = _scheme;
        this._clickables = [];
        this._disposables = [];
        this._lastClickedItems = [];
        this._decoration = vscode_1.window.createTextEditorDecorationType({
            cursor: 'pointer',
            textDecoration: 'underline'
        });
        this._disposables.push(vscode_1.languages.registerHoverProvider({ scheme: _scheme }, this));
        this._disposables.push(this._decoration);
        vscode_1.window.onDidChangeTextEditorSelection(event => {
            let editor = event.textEditor;
            if (editor && editor.document.uri.scheme === _scheme) {
                if (event.kind === vscode_1.TextEditorSelectionChangeKind.Mouse) {
                    const pos = event.selections[0].anchor;
                    const clickable = this._clickables.find(e => { return e.range.contains(pos); });
                    if (clickable) {
                        this._onClicked(clickable, editor);
                    }
                }
            }
        }, null, this._disposables);
        vscode_1.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.uri.scheme === _scheme) {
                this._setDecorations(editor);
            }
        }, null, this._disposables);
        vscode_1.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.scheme === _scheme) {
                this._setDecorations(utils_1.getTextEditor(e.document));
            }
        }, null, this._disposables);
    }
    provideHover(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const clickable = this._clickables.find(e => {
                return e.range.contains(position);
            });
            let content;
            if (clickable && clickable.getHoverMessage) {
                content = yield clickable.getHoverMessage();
                return new vscode_1.Hover(`\`\`\`\r\n${content}\r\n\`\`\``);
            }
        });
    }
    addClickable(clickable) {
        this._clickables.push(clickable);
    }
    removeClickable(range) {
        if (range) {
            [this._clickables, this._lastClickedItems].forEach(clickables => {
                const index = clickables.findIndex(e => { return e.range.isEqual(range); });
                if (index !== -1) {
                    clickables.splice(index, 1);
                }
            });
        }
    }
    clear() {
        this._clickables = [];
        this._lastClickedItems = [];
    }
    dispose() {
        this._disposables.forEach(d => d.dispose());
    }
    _onClicked(clickable, editor) {
        if (clickable.clickedDecorationType) {
            editor.setDecorations(clickable.clickedDecorationType, [clickable.range]);
            const index = this._lastClickedItems.findIndex(e => { return e.clickedDecorationType === clickable.clickedDecorationType; });
            if (index !== -1) {
                this._lastClickedItems.splice(index, 1);
            }
            this._lastClickedItems.push(clickable);
        }
        clickable.callback();
    }
    _setDecorations(editor) {
        if (!editor || editor.document.uri.scheme !== this._scheme) {
            tracer_1.Tracer.warning(`Clickable: try to set decoration to wrong scheme: ${editor ? editor.document.uri.scheme : ''}`);
            return;
        }
        this._lastClickedItems.forEach(clickable => {
            editor.setDecorations(clickable.clickedDecorationType, [clickable.range]);
        });
        editor.setDecorations(this._decoration, this._clickables.map((clickable => {
            return clickable.range;
        })));
    }
}
exports.ClickableProvider = ClickableProvider;
//# sourceMappingURL=clickable.js.map