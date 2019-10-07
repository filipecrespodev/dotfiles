'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const assert = require("assert");
const vscode_1 = require("vscode");
const infoViewProvider_1 = require("./infoViewProvider");
const gitService_1 = require("./gitService");
const tracer_1 = require("./tracer");
function toGitUri(uri, ref) {
    return uri.with({
        scheme: 'git',
        path: uri.path,
        query: JSON.stringify({
            path: uri.fsPath,
            ref
        })
    });
}
function selectBranch(gitService, repo, allowEnterSha) {
    return __awaiter(this, void 0, void 0, function* () {
        const refs = yield gitService.getRefs(repo);
        const items = refs.map(ref => {
            let description;
            if (ref.type === gitService_1.GitRefType.Head) {
                description = ref.commit;
            }
            else if (ref.type === gitService_1.GitRefType.Tag) {
                description = `Tag at ${ref.commit}`;
            }
            else if (ref.type === gitService_1.GitRefType.RemoteHead) {
                description = `Remote branch at ${ref.commit}`;
            }
            return { label: ref.name || ref.commit, description };
        });
        if (allowEnterSha)
            items.unshift(new EnterShaPickItem);
        return items;
    });
}
function branchCombination(gitService, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const refs = (yield gitService.getRefs(repo)).filter(ref => {
            return ref.type != gitService_1.GitRefType.Tag;
        });
        const localRefs = refs.filter(ref => {
            return ref.type != gitService_1.GitRefType.RemoteHead;
        });
        let items = [];
        localRefs.forEach(source => {
            refs.forEach(target => {
                if (source.name != target.name && source.commit != target.commit) {
                    items.push({ label: `${source.name || source.commit} .. ${target.name || target.commit}` });
                }
            });
        });
        return items;
    });
}
class EnterShaPickItem {
    constructor() {
        this.label = "Enter commit SHA";
        this.description = "";
        this.openShaTextBox = true;
    }
}
function selectGitRepo(gitService) {
    const repos = gitService.getGitRepos();
    if (repos.length === 0) {
        return null;
    }
    if (repos.length === 1) {
        return Promise.resolve(repos[0]);
    }
    const pickItems = repos.map(repo => {
        let label = '';
        return { label: path.basename(repo.root), description: repo.root, repo };
    });
    return vscode_1.window.showQuickPick(pickItems, { placeHolder: 'Select the git repo' })
        .then(item => {
        if (item) {
            return item.repo;
        }
        return null;
    });
}
function getRefFromQuickPickItem(item, inputBoxTitle) {
    return __awaiter(this, void 0, void 0, function* () {
        return item.openShaTextBox
            ? yield vscode_1.window.showInputBox({ prompt: inputBoxTitle })
            : item.label;
    });
}
function selectAuthor(gitService, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let authors = yield gitService.getAuthors(repo);
        authors.unshift({ name: 'All', email: '' });
        return authors.map(author => { return { label: author.name, description: author.email }; });
    });
}
const Commands = [];
function command(id) {
    return function (target, key, descriptor) {
        if (!(typeof descriptor.value === 'function')) {
            throw new Error('not supported');
        }
        Commands.push({ id, method: descriptor.value });
    };
}
class CommandCenter {
    constructor(_model, _gitService, _historyView, _infoView) {
        this._model = _model;
        this._gitService = _gitService;
        this._historyView = _historyView;
        this._infoView = _infoView;
        this._disposables = Commands.map(({ id, method }) => {
            return vscode_1.commands.registerCommand(id, (...args) => {
                Promise.resolve(method.apply(this, args));
            });
        });
    }
    dispose() {
        this._disposables.forEach(d => d.dispose());
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.clear');
            this._model.filesViewContext = { leftRef: null, rightRef: null, specifiedPath: null, repo: null };
        });
    }
    viewHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.viewHistory');
            selectGitRepo(this._gitService).then(repo => {
                if (repo) {
                    this._viewHistory({ repo });
                }
            });
        });
    }
    viewFileHistory(specifiedPath = vscode_1.window.activeTextEditor ? vscode_1.window.activeTextEditor.document.uri : undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.viewFileHistory');
            if (!specifiedPath) {
                return;
            }
            return this._viewHistory({ specifiedPath, repo: yield this._gitService.getGitRepo(specifiedPath) });
        });
    }
    viewFolderHistory(specifiedPath) {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.viewFolderHistory');
            return this.viewFileHistory(specifiedPath);
        });
    }
    viewLineHistory(file = vscode_1.window.activeTextEditor ? vscode_1.window.activeTextEditor.document.uri : undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.viewLineHistory');
            if (!file) {
                return;
            }
            const line = vscode_1.window.activeTextEditor && vscode_1.window.activeTextEditor.selection.active.line + 1;
            if (!line) {
                return;
            }
            return this._viewHistory({ specifiedPath: file, line, repo: yield this._gitService.getGitRepo(file) });
        });
    }
    viewAllHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.viewAllHistory');
            let context = this._model.historyViewContext ? this._model.historyViewContext : { repo: this._gitService.getGitRepos()[0] };
            context.isStash = false;
            return this._viewHistory(context, true);
        });
    }
    viewBranchHistory(context) {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.viewBranchHistory');
            let placeHolder = `Select a ref to see it's history`;
            let repo;
            if (context) {
                repo = context.repo;
                const specifiedPath = this._model.historyViewContext.specifiedPath;
                if (specifiedPath) {
                    placeHolder += ` of ${path.basename(specifiedPath.fsPath)}`;
                }
            }
            else {
                repo = yield Promise.resolve(selectGitRepo(this._gitService));
                if (!repo) {
                    return;
                }
            }
            placeHolder += ` (${repo.root})`;
            vscode_1.window.showQuickPick(selectBranch(this._gitService, repo), { placeHolder })
                .then(item => {
                if (item) {
                    if (context) {
                        context.branch = item.label;
                        this._viewHistory(context);
                    }
                    else {
                        this._viewHistory({ branch: item.label, repo });
                    }
                }
            });
        });
    }
    viewAuthorHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.viewAuthorHistory');
            assert(this._model.historyViewContext, 'history view context should exist');
            const context = this._model.historyViewContext;
            let placeHolder = `Select a author to see his/her commits`;
            vscode_1.window.showQuickPick(selectAuthor(this._gitService, context.repo), { placeHolder })
                .then(item => {
                if (item) {
                    const email = item.description;
                    let context = this._model.historyViewContext;
                    if (context) {
                        context.author = email;
                    }
                    this._viewHistory(context);
                }
            });
        });
    }
    viewStashes() {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.viewStashes');
            selectGitRepo(this._gitService).then(repo => {
                if (repo) {
                    this._viewHistory({ repo, isStash: true });
                }
            });
        });
    }
    diffBranch() {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.diffBranch');
            selectGitRepo(this._gitService).then((repo) => __awaiter(this, void 0, void 0, function* () {
                if (!repo) {
                    return;
                }
                this._diffSelections(repo);
            }));
        });
    }
    diffFile(specifiedPath) {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.diffFile');
            return this._diffPath(specifiedPath);
        });
    }
    diffFolder(specifiedPath) {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.diffFolder');
            return this._diffPath(specifiedPath);
        });
    }
    inputRef() {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.inputRef');
            selectGitRepo(this._gitService).then(repo => {
                if (!repo) {
                    return;
                }
                vscode_1.window.showInputBox({ placeHolder: `Input a ref(sha1) to see it's committed files` })
                    .then(ref => this._model.filesViewContext = { rightRef: ref.trim(), specifiedPath: null, repo });
            });
        });
    }
    openCommit(repo, ref, specifiedPath) {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.openCommit');
            this._model.filesViewContext = { rightRef: ref, repo, specifiedPath };
        });
    }
    openCommittedFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.openCommittedFile');
            let rightRef = this._model.filesViewContext.rightRef;
            let leftRef = rightRef + '~';
            let title = rightRef;
            if (this._model.filesViewContext.leftRef) {
                leftRef = this._model.filesViewContext.leftRef;
                title = `${leftRef} .. ${rightRef}`;
            }
            vscode_1.commands.executeCommand('vscode.diff', toGitUri(file.uri, leftRef), toGitUri(file.uri, rightRef), title + ' | ' + path.basename(file.gitRelativePath), { preview: true });
        });
    }
    openCommitInfo(content) {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.openCommitInfo');
            this._infoView.update(content);
            vscode_1.workspace.openTextDocument(infoViewProvider_1.InfoViewProvider.defaultUri)
                .then(doc => vscode_1.window.showTextDocument(doc, { preview: true, preserveFocus: true })
                .then(() => vscode_1.commands.executeCommand('cursorTop')));
        });
    }
    diffUncommittedFile(file = vscode_1.window.activeTextEditor ? vscode_1.window.activeTextEditor.document.uri : undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!file) {
                return;
            }
            tracer_1.Tracer.verbose('Command: githd.diffUncommittedFile');
            const repo = yield this._gitService.getGitRepo(file);
            vscode_1.window.showQuickPick(selectBranch(this._gitService, repo), { placeHolder: `Select a ref to see the diff with local copy of ${path.basename(file.path)}` })
                .then((item) => __awaiter(this, void 0, void 0, function* () {
                if (item) {
                    return yield vscode_1.commands.executeCommand('vscode.diff', toGitUri(file, item.label), file, `${item.label} .. Uncommitted (${path.basename(file.path)})`, { preview: true });
                }
            }));
        });
    }
    setExpressMode() {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.verbose('Command: githd.setExpressMode');
            this._historyView.express = !this._historyView.express;
        });
    }
    _viewHistory(context, all = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this._historyView.loadAll = all;
            yield this._model.setHistoryViewContext(context);
        });
    }
    _diffPath(specifiedPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (specifiedPath) {
                const repo = yield this._gitService.getGitRepo(specifiedPath);
                return this._diffSelections(repo, specifiedPath);
            }
        });
    }
    _diffSelections(repo, specifiedPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const branchs = yield selectBranch(this._gitService, repo, true);
            const branchWithCombination = yield branchCombination(this._gitService, repo);
            const items = [...branchs, ...branchWithCombination];
            const currentRef = yield this._gitService.getCurrentBranch(repo);
            const placeHolder = `Select a ref to see it's diff with ${currentRef} or select two refs to see their diffs`;
            vscode_1.window.showQuickPick(items, { placeHolder: placeHolder }).then((item) => __awaiter(this, void 0, void 0, function* () {
                if (!item) {
                    return;
                }
                let leftRef = yield getRefFromQuickPickItem(item, `Input a ref(sha1) to compare with ${currentRef} or ` +
                    `'ref(sha1) .. ref(sha2)' to compare with two commits`);
                let rightRef = currentRef;
                if (!leftRef) {
                    return;
                }
                if (leftRef.indexOf('..') != -1) {
                    const diffBranch = leftRef.split('..');
                    leftRef = diffBranch[0].trim();
                    rightRef = diffBranch[1].trim();
                }
                this._model.filesViewContext = {
                    repo,
                    leftRef,
                    rightRef,
                    specifiedPath
                };
            }));
        });
    }
}
__decorate([
    command('githd.clear')
], CommandCenter.prototype, "clear", null);
__decorate([
    command('githd.viewHistory')
], CommandCenter.prototype, "viewHistory", null);
__decorate([
    command('githd.viewFileHistory')
], CommandCenter.prototype, "viewFileHistory", null);
__decorate([
    command('githd.viewFolderHistory')
], CommandCenter.prototype, "viewFolderHistory", null);
__decorate([
    command('githd.viewLineHistory')
], CommandCenter.prototype, "viewLineHistory", null);
__decorate([
    command('githd.viewAllHistory')
], CommandCenter.prototype, "viewAllHistory", null);
__decorate([
    command('githd.viewBranchHistory')
], CommandCenter.prototype, "viewBranchHistory", null);
__decorate([
    command('githd.viewAuthorHistory')
], CommandCenter.prototype, "viewAuthorHistory", null);
__decorate([
    command('githd.viewStashes')
], CommandCenter.prototype, "viewStashes", null);
__decorate([
    command('githd.diffBranch')
], CommandCenter.prototype, "diffBranch", null);
__decorate([
    command('githd.diffFile')
], CommandCenter.prototype, "diffFile", null);
__decorate([
    command('githd.diffFolder')
], CommandCenter.prototype, "diffFolder", null);
__decorate([
    command('githd.inputRef')
], CommandCenter.prototype, "inputRef", null);
__decorate([
    command('githd.openCommit')
], CommandCenter.prototype, "openCommit", null);
__decorate([
    command('githd.openCommittedFile')
], CommandCenter.prototype, "openCommittedFile", null);
__decorate([
    command('githd.openCommitInfo')
], CommandCenter.prototype, "openCommitInfo", null);
__decorate([
    command('githd.diffUncommittedFile')
], CommandCenter.prototype, "diffUncommittedFile", null);
__decorate([
    command('githd.setExpressMode')
], CommandCenter.prototype, "setExpressMode", null);
exports.CommandCenter = CommandCenter;
//# sourceMappingURL=commands.js.map