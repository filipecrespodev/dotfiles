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
const vscode_1 = require("vscode");
const child_process_1 = require("child_process");
var git;
(function (git) {
    let RefType;
    (function (RefType) {
        RefType[RefType["Head"] = 0] = "Head";
        RefType[RefType["RemoteHead"] = 1] = "RemoteHead";
        RefType[RefType["Tag"] = 2] = "Tag";
    })(RefType = git.RefType || (git.RefType = {}));
    let _gitRootPath;
    function getGitRoot() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!_gitRootPath) {
                _gitRootPath = (yield exec(['rev-parse', '--show-toplevel'], vscode_1.workspace.rootPath)).trim();
            }
            return _gitRootPath;
        });
    }
    (function checkGitRepository() {
        return __awaiter(this, void 0, void 0, function* () {
            const gitRootPath = yield getGitRoot();
            if (gitRootPath && gitRootPath.trim()) {
                vscode_1.commands.executeCommand('setContext', 'isGitRepo', true);
            }
        });
    })();
    function exec(args, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!cwd) {
                cwd = yield getGitRoot();
            }
            let content = '';
            let gitShow = child_process_1.spawn('git', args, { cwd });
            let out = gitShow.stdout;
            out.setEncoding('utf8');
            return new Promise((resolve, reject) => {
                out.on('data', data => content += data);
                out.on('end', () => resolve(content));
                out.on('error', err => reject(err));
            });
        });
    }
    function getGitRelativePath(file) {
        return __awaiter(this, void 0, void 0, function* () {
            let gitRoot = yield getGitRoot();
            return path.relative(gitRoot, file.fsPath).replace(/\\/g, '/');
        });
    }
    git.getGitRelativePath = getGitRelativePath;
    function getCurrentBranch() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield exec(['rev-parse', '--abbrev-ref', 'HEAD'])).trim();
        });
    }
    git.getCurrentBranch = getCurrentBranch;
    function getCommitsCount(file) {
        return __awaiter(this, void 0, void 0, function* () {
            let args = ['rev-list', '--count', 'HEAD'];
            if (file) {
                args.push(yield getGitRelativePath(file));
            }
            return parseInt(yield exec(args));
        });
    }
    git.getCommitsCount = getCommitsCount;
    function getRefs() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield exec(['for-each-ref', '--format', '%(refname) %(objectname:short)']);
            const fn = (line) => {
                let match;
                if (match = /^refs\/heads\/([^ ]+) ([0-9a-f]+)$/.exec(line)) {
                    return { name: match[1], commit: match[2], type: RefType.Head };
                }
                else if (match = /^refs\/remotes\/([^/]+)\/([^ ]+) ([0-9a-f]+)$/.exec(line)) {
                    return { name: `${match[1]}/${match[2]}`, commit: match[3], type: RefType.RemoteHead };
                }
                else if (match = /^refs\/tags\/([^ ]+) ([0-9a-f]+)$/.exec(line)) {
                    return { name: match[1], commit: match[2], type: RefType.Tag };
                }
                return null;
            };
            return result.trim().split('\n')
                .filter(line => !!line)
                .map(fn)
                .filter(ref => !!ref);
        });
    }
    git.getRefs = getRefs;
    function getCommittedFiles(leftRef, rightRef) {
        return __awaiter(this, void 0, void 0, function* () {
            const gitRootPath = yield getGitRoot();
            let args = ['show', '--format=%h', '--name-status', rightRef];
            if (leftRef) {
                args = ['diff', '--name-status', `${leftRef}..${rightRef}`];
            }
            const result = yield exec(args);
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
                    files.push({ gitRelativePath, status, uri: vscode_1.Uri.file(path.join(gitRootPath, gitRelativePath)) });
                }
            });
            return files;
        });
    }
    git.getCommittedFiles = getCommittedFiles;
    function getLogEntries(start, count, branch, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const entrySeparator = '471a2a19-885e-47f8-bff3-db43a3cdfaed';
            const itemSeparator = 'e69fde18-a303-4529-963d-f5b63b7b1664';
            const format = `--format=${entrySeparator}%s${itemSeparator}%h${itemSeparator}%d${itemSeparator}%aN${itemSeparator}%ae${itemSeparator}%cr${itemSeparator}`;
            let args = ['log', format, '--shortstat', `--skip=${start}`, `--max-count=${count}`, branch];
            if (file) {
                args.push(yield getGitRelativePath(file));
            }
            const result = yield exec(args);
            let entries = [];
            result.split(entrySeparator).forEach(entry => {
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
                entry.split(itemSeparator).forEach((value, index) => {
                    switch (index % 7) {
                        case 0:
                            subject = value;
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
                            date = value;
                            break;
                        case 6:
                            stat = value.replace(/\r?\n*/g, '');
                            entries.push({ subject, hash, ref, author, email, date, stat });
                            break;
                    }
                });
            });
            return entries;
        });
    }
    git.getLogEntries = getLogEntries;
})(git = exports.git || (exports.git = {}));
//# sourceMappingURL=git.js.map