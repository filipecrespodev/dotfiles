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
const NotCommitted = `Not committed yet`;
class BlameViewStatProvider {
    constructor(_owner) {
        this._owner = _owner;
        this._disposables = [];
        this._disposables.push(vscode_1.languages.registerHoverProvider({ scheme: 'file' }, this));
    }
    dispose() {
        vscode_1.Disposable.from(...this._disposables).dispose();
    }
    provideHover(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._owner.isAvailable(document, position)) {
                return;
            }
            let markdown = new vscode_1.MarkdownString(`*\`Committed Files\`*\r\n>\r\n`);
            markdown.appendCodeblock(this._owner.blame.stat, 'txt');
            markdown.appendMarkdown('>');
            return new vscode_1.Hover(markdown);
        });
    }
}
class BlameViewProvider {
    constructor(model, _gitService) {
        this._gitService = _gitService;
        this._decoration = vscode_1.window.createTextEditorDecorationType({
            after: {
                color: new vscode_1.ThemeColor('githd.blameView.info'),
                fontStyle: 'italic'
            }
        });
        this._disposables = [];
        this.enabled = model.configuration.blameEnabled;
        this._statProvider = new BlameViewStatProvider(this);
        this._disposables.push(vscode_1.languages.registerHoverProvider({ scheme: 'file' }, this));
        vscode_1.window.onDidChangeTextEditorSelection(e => {
            this._onDidChangeSelection(e.textEditor);
        }, null, this._disposables);
        vscode_1.window.onDidChangeActiveTextEditor(editor => {
            this._onDidChangeActiveTextEditor(editor);
        }, null, this._disposables);
        vscode_1.workspace.onDidChangeTextDocument(e => {
            this._onDidChangeTextDocument(utils_1.getTextEditor(e.document));
        }, null, this._disposables);
        model.onDidChangeConfiguration(config => {
            this.enabled = config.blameEnabled;
        }, null, this._disposables);
        this._disposables.push(this._statProvider);
        this._disposables.push(this._decoration);
    }
    set enabled(value) {
        if (this._enabled !== value) {
            tracer_1.Tracer.info(`Blame view: set enabled ${value}`);
            this._enabled = value;
        }
    }
    get blame() {
        return this._blame;
    }
    dispose() {
        vscode_1.Disposable.from(...this._disposables).dispose();
    }
    provideHover(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isAvailable(document, position)) {
                return;
            }
            const blame = this._blame;
            const repo = yield this._gitService.getGitRepo(blame.file);
            const ref = blame.hash;
            const args = encodeURIComponent(JSON.stringify([repo, ref, blame.file]));
            const cmd = `[*${ref}*](command:githd.openCommit?${args} "Click to see commit details")`;
            tracer_1.Tracer.verbose(`Blame view: ${cmd}`);
            const content = `
${cmd}
*\`${blame.author}\`*
*\`${blame.email}\`*
*\`(${blame.date})\`*
>>`;
            let markdown = new vscode_1.MarkdownString(content);
            markdown.appendCodeblock(blame.subject, 'txt');
            markdown.appendMarkdown('>>');
            if (blame.body) {
                markdown.appendCodeblock(blame.body, 'txt');
                markdown.appendMarkdown('>');
            }
            markdown.isTrusted = true;
            return new vscode_1.Hover(markdown);
        });
    }
    isAvailable(doc, pos) {
        if (!this._enabled || !this._blame || !this._blame.hash || doc.isDirty || pos.line != this._blame.line
            || pos.character < doc.lineAt(this._blame.line).range.end.character || doc.uri !== this._blame.file) {
            return false;
        }
        return true;
    }
    _onDidChangeSelection(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!editor) {
                tracer_1.Tracer.info('_onDidChangeSelection with null or undefined editor');
                return;
            }
            const file = editor.document.uri;
            if (!this._enabled || file.scheme !== 'file' || editor.document.isDirty) {
                return;
            }
            tracer_1.Tracer.verbose('Blame view: onDidChangeSelection');
            const line = editor.selection.active.line;
            if (!this._blame || line != this._blame.line || file !== this._blame.file) {
                this._blame = { file, line };
                this._clear(editor);
                clearTimeout(this._debouncing);
                this._debouncing = setTimeout(() => this._update(editor), 250);
            }
        });
    }
    _onDidChangeActiveTextEditor(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!editor) {
                tracer_1.Tracer.info('_onDidChangeActiveTextEditor with null or undefined editor');
                return;
            }
            const file = editor.document.uri;
            if (!this._enabled || file.scheme !== 'file' || editor.document.isDirty) {
                return;
            }
            tracer_1.Tracer.verbose('Blame view: onDidChangeActiveTextEditor');
            this._blame = null;
            this._clear(editor);
            this._update(editor);
        });
    }
    _onDidChangeTextDocument(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!editor) {
                tracer_1.Tracer.info('_onDidChangeTextDocument with null or undefined editor');
                return;
            }
            const file = editor.document.uri;
            if (!this._enabled || file.scheme !== 'file') {
                return;
            }
            tracer_1.Tracer.verbose(`Blame view: onDidChangeTextDocument. isDirty ${editor.document.isDirty}`);
            this._blame = null;
            this._clear(editor);
            if (!editor.document.isDirty) {
                this._update(editor);
            }
        });
    }
    _update(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = editor.document.uri;
            const line = editor.selection.active.line;
            tracer_1.Tracer.verbose(`Try to update blame. ${file.fsPath}: ${line}`);
            this._blame = yield this._gitService.getBlameItem(file, line);
            if (file !== editor.document.uri || line != editor.selection.active.line || editor.document.isDirty) {
                // git blame could take long time and the active line has changed
                tracer_1.Tracer.info(`This update is outdated. ${file.fsPath}: ${line}, dirty ${editor.document.isDirty}`);
                this._blame = null;
                return;
            }
            let contentText = '\u00a0\u00a0\u00a0\u00a0';
            if (this._blame.hash) {
                contentText += `${this._blame.author} [${this._blame.relativeDate}]\u00a0\u2022\u00a0${this._blame.subject}`;
            }
            else {
                contentText += NotCommitted;
            }
            const options = {
                range: new vscode_1.Range(line, Number.MAX_SAFE_INTEGER, line, Number.MAX_SAFE_INTEGER),
                renderOptions: { after: { contentText } }
            };
            editor.setDecorations(this._decoration, [options]);
        });
    }
    _clear(editor) {
        editor.setDecorations(this._decoration, []);
    }
}
exports.BlameViewProvider = BlameViewProvider;
//# sourceMappingURL=blameViewProvider.js.map