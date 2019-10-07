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
const icons_1 = require("./icons");
const clickable_1 = require("./clickable");
const utils_1 = require("./utils");
const tracer_1 = require("./tracer");
class HistoryViewProvider {
    constructor(_model, _gitService) {
        this._model = _model;
        this._gitService = _gitService;
        this._clickableProvider = new clickable_1.ClickableProvider(HistoryViewProvider.scheme);
        this._commitsCount = 200;
        this._logCount = 0;
        this._currentLine = 0;
        this._loadingMore = false;
        this._loadAll = false;
        this._onDidChange = new vscode_1.EventEmitter();
        this._refreshed = false;
        this._disposables = [];
        this._titleDecoration = vscode_1.window.createTextEditorDecorationType({
            color: new vscode_1.ThemeColor('githd.historyView.title')
        });
        this._branchDecoration = vscode_1.window.createTextEditorDecorationType({
            color: new vscode_1.ThemeColor('githd.historyView.branch')
        });
        this._fileDecoration = vscode_1.window.createTextEditorDecorationType({
            color: new vscode_1.ThemeColor('githd.historyView.filePath')
        });
        this._subjectDecoration = vscode_1.window.createTextEditorDecorationType({
            color: new vscode_1.ThemeColor('githd.historyView.subject')
        });
        this._hashDecoration = vscode_1.window.createTextEditorDecorationType({
            color: new vscode_1.ThemeColor('githd.historyView.hash')
        });
        this._selectedHashDecoration = vscode_1.window.createTextEditorDecorationType({
            backgroundColor: new vscode_1.ThemeColor('merge.currentContentBackground'),
            isWholeLine: true,
            overviewRulerColor: 'darkgreen',
            overviewRulerLane: vscode_1.OverviewRulerLane.Full
        });
        this._refDecoration = vscode_1.window.createTextEditorDecorationType({
            color: new vscode_1.ThemeColor('githd.historyView.ref')
        });
        this._authorDecoration = vscode_1.window.createTextEditorDecorationType({
            color: new vscode_1.ThemeColor('githd.historyView.author')
        });
        this._emailDecoration = vscode_1.window.createTextEditorDecorationType({
            color: new vscode_1.ThemeColor('githd.historyView.email')
        });
        this._moreDecoration = vscode_1.window.createTextEditorDecorationType({
            color: new vscode_1.ThemeColor('githd.historyView.more')
        });
        this._loadingDecoration = vscode_1.window.createTextEditorDecorationType({
            light: {
                after: {
                    contentIconPath: icons_1.getIconUri('loading', 'light')
                }
            },
            dark: {
                after: {
                    contentIconPath: icons_1.getIconUri('loading', 'dark')
                }
            }
        });
        this._titleDecorationOptions = [];
        this._subjectDecorationOptions = [];
        this._hashDecorationOptions = [];
        this._refDecorationOptions = [];
        this._authorDecorationOptions = [];
        this._emailDecorationOptions = [];
        this._dateDecorationOptions = [];
        this._repoStatusBar = vscode_1.window.createStatusBarItem(undefined, 1);
        this._expressStatusBar = vscode_1.window.createStatusBarItem(undefined, 2);
        tracer_1.Tracer.info('Creating history view');
        let disposable = vscode_1.workspace.registerTextDocumentContentProvider(HistoryViewProvider.scheme, this);
        this._disposables.push(disposable);
        this._expressStatusBar.command = 'githd.setExpressMode';
        this._expressStatusBar.tooltip = 'Turn on or off of the history vew Express mode';
        this.express = this._model.configuration.expressMode;
        this._disposables.push(this._expressStatusBar);
        this._disposables.push(this._repoStatusBar);
        this._disposables.push(this._onDidChange);
        this._disposables.push(this._clickableProvider);
        this.commitsCount = this._model.configuration.commitsCount;
        this._model.onDidChangeConfiguration(config => {
            this.commitsCount = config.commitsCount;
            this._updateExpressStatusBar();
        }, null, this._disposables);
        this._model.onDidChangeHistoryViewContext(context => {
            this._reset();
            this._update();
            vscode_1.workspace.openTextDocument(HistoryViewProvider.defaultUri)
                .then(doc => vscode_1.window.showTextDocument(doc, { preview: false, preserveFocus: true }));
        });
        this._gitService.onDidChangeGitRepositories(repos => {
            this._updateExpressStatusBar();
        });
        vscode_1.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.uri.scheme === HistoryViewProvider.scheme) {
                tracer_1.Tracer.verbose(`History view: onDidChangeActiveTextEditor`);
                this._setDecorations(editor);
                this.repo = this._model.historyViewContext.repo.root;
            }
            else {
                this.repo = null;
            }
        }, null, this._disposables);
        vscode_1.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.scheme === HistoryViewProvider.scheme) {
                tracer_1.Tracer.verbose(`History view: onDidChangeTextDocument`);
                this._setDecorations(utils_1.getTextEditor(e.document));
            }
        }, null, this._disposables);
        this._updateExpressStatusBar();
        this._disposables.push(this._titleDecoration, this._fileDecoration, this._subjectDecoration, this._hashDecoration, this._selectedHashDecoration, this._refDecoration, this._authorDecoration, this._emailDecoration, this._moreDecoration, this._branchDecoration, this._loadingDecoration);
        tracer_1.Tracer.info('History view created');
    }
    get onDidChange() { return this._onDidChange.event; }
    set loadAll(value) { this._loadAll = value; }
    get express() { return this._express; }
    set express(value) {
        this._express = value;
        this._expressStatusBar.text = 'githd: Express ' + (value ? 'On' : 'Off');
    }
    set commitsCount(count) {
        if ([100, 200, 300, 400, 500, 1000].findIndex(a => { return a === count; }) >= 0) {
            this._commitsCount = count;
        }
    }
    set repo(repo) {
        if (repo) {
            this._repoStatusBar.text = 'githd: Repository ' + repo;
            this._repoStatusBar.show();
        }
        else {
            this._repoStatusBar.hide();
        }
    }
    provideTextDocumentContent(uri) {
        if (this._content) {
            return this._content;
        }
        this._updateContent();
        return ' ';
    }
    dispose() {
        vscode_1.Disposable.from(...this._disposables).dispose();
    }
    _updateExpressStatusBar() {
        if (this._model.configuration.displayExpress && this._gitService.getGitRepos().length > 0) {
            this._expressStatusBar.show();
        }
        else {
            this._expressStatusBar.hide();
        }
    }
    _update() {
        tracer_1.Tracer.info(`Update history view`);
        this._onDidChange.fire(HistoryViewProvider.defaultUri);
    }
    _updateContent() {
        return __awaiter(this, void 0, void 0, function* () {
            const context = this._model.historyViewContext;
            const loadingMore = this._loadingMore;
            const isStash = context.isStash;
            if (context.specifiedPath && context.line) {
                this._loadAll = true;
            }
            tracer_1.Tracer.info(`Update history view content. ${JSON.stringify(context)}`);
            let logStart = 0;
            if (loadingMore) {
                this._loadingMore = false;
                logStart = this._logCount;
                this._content = this._content.substr(0, this._content.length - HistoryViewProvider._moreLabel.length - 1);
                this._content += HistoryViewProvider._separatorLabel + '\n\n';
                this._currentLine += 2;
            }
            const commitsCount = yield this._gitService.getCommitsCount(context.repo, context.specifiedPath, context.author);
            let slowLoading = false;
            let express = this._express;
            if (this._loadAll && !express && commitsCount > 1000) {
                vscode_1.window.showInformationMessage(`Too many commits to be loaded and express mode is enabled.`);
                express = true;
            }
            if (this._loadAll && commitsCount > 30000) {
                slowLoading = true;
                vscode_1.window.showInformationMessage(`There are ${commitsCount} commits and it will take a while to load all.`);
            }
            const logCount = this._loadAll ? Number.MAX_SAFE_INTEGER : this._commitsCount;
            const entries = yield this._gitService.getLogEntries(context.repo, express, logStart, logCount, context.branch, context.isStash, context.specifiedPath, context.line, context.author);
            if (entries.length === 0) {
                this._reset();
                this._content = isStash ? 'No Stash' : 'No History';
                this._update();
                return;
            }
            if (!loadingMore) {
                this._reset();
                this._content = isStash ? HistoryViewProvider._stashTitleLabel : HistoryViewProvider._titleLabel;
                utils_1.decorateWithoutWhitspace(this._titleDecorationOptions, this._content, 0, 0);
                if (!isStash) {
                    if (context.specifiedPath) {
                        this._content += ' of ';
                        let start = this._content.length;
                        this._content += yield this._gitService.getGitRelativePath(context.specifiedPath);
                        this._fileDecorationRange = new vscode_1.Range(this._currentLine, start, this._currentLine, this._content.length);
                        if (context.line) {
                            this._content += ' at line ' + context.line;
                        }
                    }
                    this._content += ' on ';
                    this._branchDecorationRange = new vscode_1.Range(0, this._content.length, 0, this._content.length + context.branch.length);
                    this._clickableProvider.addClickable({
                        range: this._branchDecorationRange,
                        callback: () => vscode_1.commands.executeCommand('githd.viewBranchHistory', context),
                        getHoverMessage: () => { return 'Select a branch to see its history'; }
                    });
                    this._content += context.branch;
                    this._content += ' by ';
                    let author = context.author;
                    if (!author) {
                        this._content += 'all ';
                        author = 'authors';
                    }
                    let start = this._content.length;
                    this._content += author;
                    let range = new vscode_1.Range(this._currentLine, start, this._currentLine, this._content.length);
                    this._emailDecorationOptions.push(range);
                    this._clickableProvider.addClickable({
                        range,
                        callback: () => vscode_1.commands.executeCommand('githd.viewAuthorHistory'),
                        getHoverMessage: () => { return 'Select an author to see the commits'; }
                    });
                }
                this._content += ` \n\n`;
                this._currentLine += 2;
            }
            const hasMore = !isStash && commitsCount > logCount + this._logCount;
            entries.forEach(entry => {
                ++this._logCount;
                utils_1.decorateWithoutWhitspace(this._subjectDecorationOptions, entry.subject, this._currentLine, 0);
                this._content += entry.subject + '\n';
                ++this._currentLine;
                let info = entry.hash;
                let range = new vscode_1.Range(this._currentLine, 0, this._currentLine, info.length);
                this._hashDecorationOptions.push(range);
                this._clickableProvider.addClickable({
                    range,
                    callback: () => {
                        this._model.filesViewContext = {
                            repo: context.repo,
                            isStash,
                            leftRef: null,
                            rightRef: entry.hash,
                            specifiedPath: context.specifiedPath,
                            focusedLineInfo: entry.lineInfo
                        };
                    },
                    clickedDecorationType: this._selectedHashDecoration,
                    getHoverMessage: () => __awaiter(this, void 0, void 0, function* () { return yield this._gitService.getCommitDetails(context.repo, entry.hash, isStash); })
                });
                if (entry.ref) {
                    let start = info.length;
                    info += entry.ref;
                    utils_1.decorateWithoutWhitspace(this._refDecorationOptions, entry.ref, this._currentLine, start);
                }
                if (entry.author) {
                    info += ' by ';
                    let start = info.length;
                    info += entry.author;
                    utils_1.decorateWithoutWhitspace(this._authorDecorationOptions, entry.author, this._currentLine, start);
                }
                if (entry.email) {
                    info += ' <';
                    let start = info.length;
                    info += entry.email;
                    range = new vscode_1.Range(this._currentLine, start, this._currentLine, info.length);
                    this._emailDecorationOptions.push(range);
                    info += '>';
                }
                if (entry.date) {
                    info += ', ';
                    let start = info.length;
                    info += entry.date;
                    utils_1.decorateWithoutWhitspace(this._dateDecorationOptions, entry.date, this._currentLine, start);
                }
                this._content += info + '\n';
                ++this._currentLine;
                if (entry.stat) {
                    let stat = entry.stat;
                    if (context.specifiedPath) {
                        stat = entry.stat.replace('1 file changed, ', '');
                    }
                    this._content += stat + '\n';
                    ++this._currentLine;
                }
                this._content += '\n';
                ++this._currentLine;
            });
            if (hasMore) {
                this._moreClickableRange = new vscode_1.Range(this._currentLine, 0, this._currentLine, HistoryViewProvider._moreLabel.length);
                this._clickableProvider.addClickable({
                    range: this._moreClickableRange,
                    callback: () => {
                        this._clickableProvider.removeClickable(this._moreClickableRange);
                        this._moreClickableRange = null;
                        this._loadingMore = true;
                        this._updateContent();
                    },
                    getHoverMessage: () => { return 'Load more commits'; }
                });
                this._content += HistoryViewProvider._moreLabel + ' ';
            }
            else {
                this._moreClickableRange = null;
                if (slowLoading) {
                    vscode_1.window.showInformationMessage(`All ${commitsCount} commits are loaded.`);
                }
            }
            this._update();
            this.repo = context.repo.root;
        });
    }
    _setDecorations(editor) {
        if (!editor || editor.document.uri.scheme !== HistoryViewProvider.scheme) {
            tracer_1.Tracer.warning(`History view: try to set decoration to wrong scheme: ${editor ? editor.document.uri.scheme : ''}`);
            return;
        }
        if (!this._content) {
            editor.setDecorations(this._loadingDecoration, [new vscode_1.Range(0, 0, 0, 1)]);
            return;
        }
        if (this._refreshed) {
            this._refreshed = false;
            editor.selection = new vscode_1.Selection(0, 0, 0, 0);
        }
        editor.setDecorations(this._loadingDecoration, []);
        editor.setDecorations(this._titleDecoration, this._titleDecorationOptions);
        editor.setDecorations(this._fileDecoration, this._fileDecorationRange ? [this._fileDecorationRange] : []);
        editor.setDecorations(this._branchDecoration, this._branchDecorationRange ? [this._branchDecorationRange] : []);
        editor.setDecorations(this._subjectDecoration, this._subjectDecorationOptions);
        editor.setDecorations(this._hashDecoration, this._hashDecorationOptions);
        editor.setDecorations(this._refDecoration, this._refDecorationOptions);
        editor.setDecorations(this._authorDecoration, this._authorDecorationOptions);
        editor.setDecorations(this._emailDecoration, this._emailDecorationOptions);
        editor.setDecorations(this._moreDecoration, this._moreClickableRange ? [this._moreClickableRange] : []);
    }
    _reset() {
        this._clickableProvider.clear();
        this._content = '';
        this._logCount = 0;
        this._currentLine = 0;
        this._moreClickableRange = null;
        this._titleDecorationOptions = [];
        this._fileDecorationRange = null;
        this._branchDecorationRange = null;
        this._subjectDecorationOptions = [];
        this._hashDecorationOptions = [];
        this._refDecorationOptions = [];
        this._authorDecorationOptions = [];
        this._emailDecorationOptions = [];
        this._dateDecorationOptions = [];
        let editor = vscode_1.window.visibleTextEditors.find(e => e.document.uri.scheme === HistoryViewProvider.scheme);
        if (editor) {
            editor.setDecorations(this._selectedHashDecoration, []);
        }
        this._refreshed = true;
    }
}
HistoryViewProvider.scheme = 'githd-logs';
HistoryViewProvider.defaultUri = vscode_1.Uri.parse(HistoryViewProvider.scheme + '://authority/Git History');
HistoryViewProvider._stashTitleLabel = 'Git Stashes';
HistoryViewProvider._titleLabel = 'Git History';
HistoryViewProvider._moreLabel = '\u00b7\u00b7\u00b7';
HistoryViewProvider._separatorLabel = '--------------------------------------------------------------';
exports.HistoryViewProvider = HistoryViewProvider;
//# sourceMappingURL=historyViewProvider.js.map