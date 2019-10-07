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
const path = require("path");
const fs = require("fs");
const vscode_1 = require("vscode");
const child_process_1 = require("child_process");
const tracer_1 = require("./tracer");
const EntrySeparator = '471a2a19-885e-47f8-bff3-db43a3cdfaed';
const FormatSeparator = 'e69fde18-a303-4529-963d-f5b63b7b1664';
function formatDate(timestamp) {
    return (new Date(timestamp * 1000)).toDateString();
}
var GitRefType;
(function (GitRefType) {
    GitRefType[GitRefType["Head"] = 0] = "Head";
    GitRefType[GitRefType["RemoteHead"] = 1] = "RemoteHead";
    GitRefType[GitRefType["Tag"] = 2] = "Tag";
})(GitRefType = exports.GitRefType || (exports.GitRefType = {}));
function singleLined(value) {
    return value.replace(/\r?\n|\r/g, ' ');
}
class GitService {
    constructor() {
        this._gitRepos = [];
        this._onDidChangeGitRepositories = new vscode_1.EventEmitter();
        this._disposables = [];
        this._gitPath = vscode_1.workspace.getConfiguration('git').get('path');
        this._disposables.push(this._onDidChangeGitRepositories);
    }
    get onDidChangeGitRepositories() { return this._onDidChangeGitRepositories.event; }
    dispose() {
        this._disposables.forEach(d => d.dispose());
    }
    updateGitRoots(wsFolders) {
        // reset repos first. Should optimize it to avoid firing multiple events.
        this._gitRepos = [];
        vscode_1.commands.executeCommand('setContext', 'hasGitRepo', false);
        this._onDidChangeGitRepositories.fire([]);
        if (wsFolders) {
            wsFolders.forEach(wsFolder => {
                this.getGitRepo(wsFolder.uri);
                const root = wsFolder.uri.fsPath;
                this._scanSubFolders(root);
            });
        }
    }
    getGitRepos() {
        return this._gitRepos;
    }
    getGitRepo(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            let fsPath = uri.fsPath;
            if (fs.statSync(fsPath).isFile()) {
                fsPath = path.dirname(fsPath);
            }
            const repo = this._gitRepos.find(r => fsPath.startsWith(r.root));
            if (repo) {
                return repo;
            }
            let root = (yield this._exec(['rev-parse', '--show-toplevel'], fsPath)).trim();
            if (root) {
                root = path.normalize(root);
                if (this._gitRepos.findIndex((value) => { return value.root == root; }) === -1) {
                    this._gitRepos.push({ root });
                    vscode_1.commands.executeCommand('setContext', 'hasGitRepo', true);
                    this._onDidChangeGitRepositories.fire(this.getGitRepos());
                }
            }
            return root ? { root } : null;
        });
    }
    getGitRelativePath(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = yield this.getGitRepo(file);
            if (!repo) {
                return;
            }
            let relative = path.relative(repo.root, file.fsPath).replace(/\\/g, '/');
            return relative === '' ? '.' : relative;
        });
    }
    getCurrentBranch(repo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!repo) {
                return null;
            }
            return (yield this._exec(['rev-parse', '--abbrev-ref', 'HEAD'], repo.root)).trim();
        });
    }
    getCommitsCount(repo, file, author) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!repo) {
                return 0;
            }
            let args = ['rev-list', '--simplify-merges', '--count', 'HEAD'];
            if (author) {
                args.push(`--author=${author}`);
            }
            if (file) {
                args.push(yield this.getGitRelativePath(file));
            }
            return parseInt(yield this._exec(args, repo.root));
        });
    }
    getRefs(repo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!repo) {
                return [];
            }
            const result = yield this._exec(['for-each-ref', '--format', '%(refname) %(objectname:short)'], repo.root);
            const fn = (line) => {
                let match;
                if (match = /^refs\/heads\/([^ ]+) ([0-9a-f]+)$/.exec(line)) {
                    return { name: match[1], commit: match[2], type: GitRefType.Head };
                }
                else if (match = /^refs\/remotes\/([^/]+)\/([^ ]+) ([0-9a-f]+)$/.exec(line)) {
                    return { name: `${match[1]}/${match[2]}`, commit: match[3], type: GitRefType.RemoteHead };
                }
                else if (match = /^refs\/tags\/([^ ]+) ([0-9a-f]+)$/.exec(line)) {
                    return { name: match[1], commit: match[2], type: GitRefType.Tag };
                }
                return null;
            };
            return result.trim().split('\n')
                .filter(line => !!line)
                .map(fn)
                .filter(ref => !!ref);
        });
    }
    getCommittedFiles(repo, leftRef, rightRef, isStash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!repo) {
                return [];
            }
            let args = ['show', '--format=%h', '--name-status', rightRef];
            if (leftRef) {
                args = ['diff', '--name-status', `${leftRef}..${rightRef}`];
            }
            else if (isStash) {
                args.unshift('stash');
            }
            const result = yield this._exec(args, repo.root);
            let files = [];
            result.split(/\r?\n/g).forEach((value, index) => {
                if (value) {
                    let info = value.split(/\t/g);
                    if (info.length < 2) {
                        return;
                    }
                    let gitRelativePath;
                    const status = info[0][0].toLocaleUpperCase();
                    // A    filename
                    // M    filename
                    // D    filename
                    // RXX  file_old    file_new
                    // CXX  file_old    file_new
                    switch (status) {
                        case 'M':
                        case 'A':
                        case 'D':
                            gitRelativePath = info[1];
                            break;
                        case 'R':
                        case 'C':
                            gitRelativePath = info[2];
                            break;
                        default:
                            throw new Error('Cannot parse ' + info);
                    }
                    files.push({ gitRelativePath, status, uri: vscode_1.Uri.file(path.join(repo.root, gitRelativePath)) });
                }
            });
            return files;
        });
    }
    getLogEntries(repo, express, start, count, branch, isStash, file, line, author) {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.info(`Get entries. repo: ${repo.root}, express: ${express}, start: ${start}, count: ${count}, branch: ${branch},` +
                `isStash: ${isStash}, file: ${file ? file.fsPath : ''}, line: ${line}, author: ${author}`);
            if (!repo) {
                return [];
            }
            let format = `--format=${EntrySeparator}`;
            if (isStash) {
                format += '%gd: ';
            }
            format += `%s${FormatSeparator}%h${FormatSeparator}%d${FormatSeparator}%aN${FormatSeparator}%ae${FormatSeparator}%ct${FormatSeparator}%cr${FormatSeparator}`;
            let args = [format];
            if (!express || !!line) {
                args.push('--shortstat');
            }
            if (isStash) {
                args.unshift('stash', 'list');
            }
            else {
                args.unshift('log', `--skip=${start}`, `--max-count=${count}`, '--simplify-merges', branch);
                if (author) {
                    args.push(`--author=${author}`);
                }
                if (file) {
                    const filePath = yield this.getGitRelativePath(file);
                    if (line) {
                        args.push(`-L ${line},${line}:${filePath}`);
                    }
                    else {
                        args.push('--follow', filePath);
                    }
                }
            }
            const result = yield this._exec(args, repo.root);
            let entries = [];
            result.split(EntrySeparator).forEach(entry => {
                if (!entry) {
                    return;
                }
                let subject;
                let hash;
                let ref;
                let author;
                let email;
                let date;
                let stat;
                let lineInfo;
                entry.split(FormatSeparator).forEach((value, index) => {
                    switch (index % 8) {
                        case 0:
                            subject = singleLined(value);
                            break;
                        case 1:
                            hash = value;
                            break;
                        case 2:
                            ref = value;
                            break;
                        case 3:
                            author = value;
                            break;
                        case 4:
                            email = value;
                            break;
                        case 5:
                            date = formatDate(parseInt(value));
                            break;
                        case 6:
                            date += ` (${value})`;
                            break;
                        case 7:
                            if (!!line) {
                                lineInfo = value.trim();
                            }
                            else {
                                stat = value.trim();
                            }
                            entries.push({ subject, hash, ref, author, email, date, stat, lineInfo });
                            break;
                    }
                });
            });
            return entries;
        });
    }
    getCommitDetails(repo, ref, isStash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!repo) {
                return null;
            }
            const format = isStash ?
                `Stash:         %H
Author:        %aN <%aE>
AuthorDate:    %ad

%s
` :
                `Commit:        %H
Author:        %aN <%aE>
AuthorDate:    %ad
Commit:        %cN <%cE>
CommitDate:    %cd

%s
`;
            let details = yield this._exec(['show', `--format=${format}`, '--no-patch', '--date=local', ref], repo.root);
            const body = (yield this._exec(['show', '--format=%b', '--no-patch', ref], repo.root)).trim();
            if (body) {
                details += body + '\r\n\r\n';
            }
            details += '-----------------------------\r\n\r\n';
            details += yield this._exec(['show', '--format=', '--stat', ref], repo.root);
            return details;
        });
    }
    getAuthors(repo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!repo) {
                return null;
            }
            const result = (yield this._exec(['shortlog', '-se', 'HEAD'], repo.root)).trim();
            return result.split(/\r?\n/g).map(item => {
                item = item.trim();
                let start = item.search(/ |\t/);
                item = item.substr(start + 1).trim();
                start = item.indexOf('<');
                const name = item.substring(0, start);
                const email = item.substring(start + 1, item.length - 1);
                return { name, email };
            });
        });
    }
    getBlameItem(file, line) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = yield this.getGitRepo(file);
            if (!repo) {
                return null;
            }
            const filePath = file.fsPath;
            const result = yield this._exec(['blame', `${filePath}`, '-L', `${line + 1},${line + 1}`, '--incremental', '--root'], repo.root);
            let hash;
            let subject;
            let author;
            let date;
            let email;
            result.split(/\r?\n/g).forEach((line, index) => {
                if (index == 0) {
                    hash = line.split(' ')[0];
                }
                else {
                    const infoName = line.split(' ')[0];
                    const info = line.substr(infoName.length).trim();
                    if (!info) {
                        return;
                    }
                    switch (infoName) {
                        case 'author':
                            author = info;
                            break;
                        case 'committer-time':
                            date = (new Date(parseInt(info) * 1000)).toLocaleDateString();
                            break;
                        case 'author-mail':
                            email = info;
                            break;
                        case 'summary':
                            subject = singleLined(info);
                            break;
                        default:
                            break;
                    }
                }
            });
            if ([hash, subject, author, email, date].some(v => !v)) {
                tracer_1.Tracer.warning(`Blame info missed. repo ${repo.root} file ${filePath}:${line} ${hash}` +
                    ` author: ${author}, mail: ${email}, date: ${date}, summary: ${subject}`);
                return null;
            }
            // get additional info: abbrev hash, relative date, body, stat
            const addition = yield this._exec(['show', `--format=%h${FormatSeparator}%cr${FormatSeparator}%b${FormatSeparator}`, '--stat', `${hash}`], repo.root);
            //const firstLine = addition.split(/\r?\n/g)[0];
            const items = addition.split(FormatSeparator);
            hash = items[0];
            const relativeDate = items[1];
            const body = items[2].trim();
            const stat = ` ${items[3].trim()}`;
            return { file, line, subject, body, hash, author, date, email, relativeDate, stat };
        });
    }
    _scanSubFolders(root) {
        const children = fs.readdirSync(root);
        children.filter(child => child !== '.git').forEach((child) => __awaiter(this, void 0, void 0, function* () {
            const fullPath = path.join(root, child);
            if (fs.statSync(fullPath).isDirectory()) {
                let gitRoot = (yield this._exec(['rev-parse', '--show-toplevel'], fullPath)).trim();
                if (gitRoot) {
                    gitRoot = path.normalize(gitRoot);
                    if (this._gitRepos.findIndex((value) => { return value.root == gitRoot; }) === -1) {
                        this._gitRepos.push({ root: gitRoot });
                        vscode_1.commands.executeCommand('setContext', 'hasGitRepo', true);
                        this._onDidChangeGitRepositories.fire(this.getGitRepos());
                    }
                }
                //this._scanSubFolders(fullPath);
            }
        }));
    }
    _exec(args, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const start = Date.now();
            let content = '';
            let gitPath = this._gitPath;
            if (!gitPath) {
                gitPath = 'git';
            }
            let gitShow = child_process_1.spawn(gitPath, args, { cwd });
            let out = gitShow.stdout;
            out.setEncoding('utf8');
            return new Promise((resolve, reject) => {
                out.on('data', data => content += data);
                out.on('end', () => {
                    resolve(content);
                    tracer_1.Tracer.verbose(`git command: git ${args.join(' ')} (${Date.now() - start}ms)`);
                });
                out.on('error', err => {
                    reject(err);
                    tracer_1.Tracer.error(`git command failed: git ${args.join(' ')} (${Date.now() - start}ms) ${err.message}`);
                });
            });
        });
    }
}
exports.GitService = GitService;
//# sourceMappingURL=gitService.js.map