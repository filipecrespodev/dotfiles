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
const icons_1 = require("./icons");
const rootFolderIcon = {
    dark: icons_1.getIconUri('structure', 'dark'),
    light: icons_1.getIconUri('structure', 'light')
};
class InfoItem extends vscode_1.TreeItem {
    constructor(content, label) {
        super(label);
        this.parent = null;
        this.command = {
            title: '',
            command: 'githd.openCommitInfo',
            arguments: [content]
        };
        this.iconPath = icons_1.getIconUri('info', '');
    }
    ;
}
class CommittedFile extends vscode_1.TreeItem {
    constructor(_parent, _uri, _gitRelativePath, _status, label) {
        super(label);
        this._parent = _parent;
        this._uri = _uri;
        this._gitRelativePath = _gitRelativePath;
        this._status = _status;
        this.parent = this._parent;
        this.uri = this._uri;
        this.gitRelativePath = this._gitRelativePath;
        this.status = this._status;
        this.command = {
            title: '',
            command: 'githd.openCommittedFile',
            arguments: [this]
        };
        if (this._status) {
            this.iconPath = { light: this._getIconPath('light'), dark: this._getIconPath('dark') };
        }
    }
    ;
    _getIconPath(theme) {
        switch (this._status[0].toUpperCase()) {
            case 'M': return icons_1.Icons[theme].Modified;
            case 'A': return icons_1.Icons[theme].Added;
            case 'D': return icons_1.Icons[theme].Deleted;
            case 'R': return icons_1.Icons[theme].Renamed;
            case 'C': return icons_1.Icons[theme].Copied;
            default: return void 0;
        }
    }
}
class FolderItem extends vscode_1.TreeItem {
    constructor(_parent, _gitRelativePath, label, iconPath) {
        super(label);
        this._parent = _parent;
        this._gitRelativePath = _gitRelativePath;
        this._subFolders = [];
        this._files = [];
        this.parent = this._parent;
        this.gitRelativePath = this._gitRelativePath;
        this.contextValue = 'folder';
        this.iconPath = iconPath;
        this.collapsibleState = vscode_1.TreeItemCollapsibleState.Expanded;
    }
    get subFolders() { return this._subFolders; }
    set subFolders(value) { this._subFolders = value; }
    get files() { return this._files; }
    set files(value) { this._files = value; }
    get infoItem() { return this._infoItem; }
    set infoItem(value) { this._infoItem = value; }
}
function getFormatedLabel(relativePath) {
    const name = path.basename(relativePath);
    let dir = path.dirname(relativePath);
    if (dir === '.') {
        dir = '';
    }
    return name + ' \u00a0\u2022\u00a0 ' + dir;
}
function createCommittedFile(rootFolder, file) {
    return new CommittedFile(rootFolder, file.uri, file.gitRelativePath, file.status, getFormatedLabel(file.gitRelativePath));
}
function buildOneFileWithFolder(rootFolder, file, relateivePath = '') {
    const segments = relateivePath ? path.relative(relateivePath, file.gitRelativePath).split(/\\|\//) :
        file.gitRelativePath.split('/');
    let gitRelativePath = relateivePath;
    let parent = rootFolder;
    let i = 0;
    for (; i < segments.length - 1; ++i) {
        gitRelativePath += segments[i] + '/';
        let folder = parent.subFolders.find(item => { return item.label === segments[i]; });
        if (!folder) {
            folder = new FolderItem(parent, gitRelativePath, segments[i]);
            parent.subFolders.push(folder);
        }
        parent = folder;
    }
    parent.files.push(new CommittedFile(parent, file.uri, file.gitRelativePath, file.status, segments[i]));
}
function buildFileTree(rootFolder, files, withFolder) {
    if (withFolder) {
        files.forEach(file => buildOneFileWithFolder(rootFolder, file));
    }
    else {
        rootFolder.files.push(...(files.map(file => { return createCommittedFile(rootFolder, file); })));
    }
}
function buildFilesWithoutFolder(rootFolder, folder) {
    rootFolder.files.push(...(folder.files.map(file => {
        file.label = getFormatedLabel(path.relative(rootFolder.gitRelativePath, file.gitRelativePath).replace(/\\/g, '/'));
        return file;
    })));
    folder.subFolders.forEach(f => buildFilesWithoutFolder(rootFolder, f));
    folder.files = [];
    folder.subFolders = [];
}
function buildFilesWithFolder(rootFolder) {
    rootFolder.subFolders.forEach(folder => buildFilesWithFolder(folder));
    const files = rootFolder.files;
    rootFolder.files = [];
    files.forEach(file => buildOneFileWithFolder(rootFolder, file, rootFolder.gitRelativePath));
}
function setCollapsibleStateOnAll(rootFolder, state) {
    if (rootFolder) {
        rootFolder.collapsibleState = state;
        rootFolder.subFolders.forEach(sub => setCollapsibleStateOnAll(sub, state));
    }
}
class ExplorerViewProvider {
    constructor(model, _gitService) {
        this._gitService = _gitService;
        this._disposables = [];
        this._onDidChange = new vscode_1.EventEmitter();
        this._treeRoot = [];
        this.onDidChangeTreeData = this._onDidChange.event;
        this._disposables.push(vscode_1.window.registerTreeDataProvider('committedFiles', this));
        this._disposables.push(vscode_1.commands.registerCommand('githd.showFilesWithFolder', (folder) => this._showFilesWithFolder(folder)));
        this._disposables.push(vscode_1.commands.registerCommand('githd.showFilesWithoutFolder', (folder) => this._showFilesWithoutFolder(folder)));
        this._disposables.push(vscode_1.commands.registerCommand('githd.collapseFolder', (folder) => this._setCollapsibleStateOnAll(folder, vscode_1.TreeItemCollapsibleState.Collapsed)));
        this._disposables.push(vscode_1.commands.registerCommand('githd.expandFolder', (folder) => this._setCollapsibleStateOnAll(folder, vscode_1.TreeItemCollapsibleState.Expanded)));
        this._disposables.push(vscode_1.commands.registerCommand('githd.viewFileHistoryFromTree', (file) => model.setHistoryViewContext({ repo: this._context.repo, specifiedPath: file.uri })));
        this._disposables.push(vscode_1.commands.registerCommand('githd.viewFolderHistoryFromTree', (folder) => model.setHistoryViewContext({
            repo: this._context.repo,
            specifiedPath: vscode_1.Uri.file(path.join(this._context.repo.root, folder.gitRelativePath))
        })));
        this._disposables.push(this._onDidChange);
        model.onDidChangeFilesViewContext(context => {
            this._context = context;
            this._update();
        }, null, this._disposables);
        this._context = model.filesViewContext;
        this._withFolder = model.configuration.withFolder;
        this._update();
    }
    dispose() {
        this._disposables.forEach(d => d.dispose());
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return this._treeRoot;
        }
        let folder = element;
        if (folder) {
            return [].concat(folder.subFolders, folder.infoItem, folder.files);
        }
        return [];
    }
    getParent(element) {
        return element.parent;
    }
    get commitOrStashString() {
        return this._context.isStash ? 'Stash' : 'Commit';
    }
    _update() {
        return __awaiter(this, void 0, void 0, function* () {
            this._treeRoot = [];
            if (!this._context) {
                return;
            }
            const leftRef = this._context.leftRef;
            const rightRef = this._context.rightRef;
            const specifiedPath = this._context.specifiedPath;
            const lineInfo = this._context.focusedLineInfo;
            if (!rightRef) {
                this._onDidChange.fire();
                return;
            }
            const committedFiles = yield this._gitService.getCommittedFiles(this._context.repo, leftRef, rightRef, this._context.isStash);
            if (!leftRef) {
                yield this._buildCommitInfo(rightRef);
            }
            if (!leftRef && !specifiedPath) {
                this._buildCommitTree(committedFiles, rightRef);
            }
            else if (leftRef && !specifiedPath) {
                this._buildDiffBranchTree(committedFiles, leftRef, rightRef);
            }
            else if (!leftRef && specifiedPath) {
                yield this._buildPathSpecifiedCommitTree(committedFiles, specifiedPath, lineInfo, rightRef);
            }
            else {
                yield this._buildPathSpecifiedDiffBranchTree(committedFiles, this._context);
            }
            this._onDidChange.fire();
        });
    }
    _buildCommitInfo(ref) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._treeRoot.push(new InfoItem(yield this._gitService.getCommitDetails(this._context.repo, ref, this._context.isStash), `${this.commitOrStashString} Info`));
        });
    }
    _buildCommitTree(files, ref) {
        this._buildCommitFolder(`${this.commitOrStashString} ${ref} \u00a0 (${files.length} files changed)`, files);
    }
    _buildDiffBranchTree(files, leftRef, rightRef) {
        this._buildCommitFolder(`Diffs between ${leftRef} and ${rightRef} \u00a0 (${files.length} files)`, files);
    }
    _buildPathSpecifiedCommitTree(files, specifiedPath, lineInfo, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._buildFocusFolder('Focus', files, specifiedPath, lineInfo);
            this._buildCommitTree(files, ref);
        });
    }
    _buildPathSpecifiedDiffBranchTree(files, context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._buildFocusFolder(`${context.leftRef} .. ${context.rightRef}`, files, context.specifiedPath);
        });
    }
    _buildCommitFolder(label, committedFiles) {
        let folder = new FolderItem(null, '', label, rootFolderIcon);
        buildFileTree(folder, committedFiles, this._withFolder);
        this._treeRoot.push(folder);
    }
    _buildFocusFolder(label, committedFiles, specifiedPath, lineInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            let folder = new FolderItem(null, '', label, rootFolderIcon);
            const relativePath = yield this._gitService.getGitRelativePath(specifiedPath);
            if (fs.lstatSync(specifiedPath.fsPath).isFile()) {
                if (lineInfo) {
                    folder.infoItem = new InfoItem(lineInfo, 'line diff');
                }
                let file = committedFiles.find(value => { return value.gitRelativePath === relativePath; });
                if (file) {
                    folder.files.push(createCommittedFile(folder, file));
                }
            }
            else {
                let focus = [];
                committedFiles.forEach(file => {
                    if (file.gitRelativePath.search(relativePath) === 0) {
                        focus.push(file);
                    }
                });
                buildFileTree(folder, focus, this._withFolder);
            }
            if (folder.files.length + folder.subFolders.length > 0 || folder.infoItem) {
                this._treeRoot.push(folder);
            }
        });
    }
    _showFilesWithFolder(parent) {
        if (!parent) {
            this._withFolder = true;
            this._update();
        }
        else {
            buildFilesWithFolder(parent);
            this._onDidChange.fire(parent);
        }
    }
    _showFilesWithoutFolder(parent) {
        if (!parent) {
            this._withFolder = false;
            this._update();
        }
        else {
            parent.subFolders.forEach(folder => buildFilesWithoutFolder(parent, folder));
            parent.subFolders = [];
            this._onDidChange.fire(parent);
        }
    }
    _setCollapsibleStateOnAll(folder, state) {
        let parent;
        if (!folder) {
            this._treeRoot.forEach(sub => {
                if (sub instanceof FolderItem) {
                    setCollapsibleStateOnAll(sub, state);
                }
            });
        }
        else {
            parent = folder.parent;
            folder.collapsibleState = state;
            folder.subFolders.forEach(sub => setCollapsibleStateOnAll(sub, state));
        }
        // HACK: workaround of vscode regression. 
        // seems vscode people are planing to add new API https://github.com/Microsoft/vscode/issues/55879
        if (parent) {
            const temp = parent.subFolders;
            parent.subFolders = [];
            this._onDidChange.fire(parent);
            setTimeout(() => {
                parent.subFolders = temp;
                this._onDidChange.fire(parent);
            }, 250);
        }
        else {
            const root = this._treeRoot;
            this._treeRoot = null;
            this._onDidChange.fire();
            setTimeout(() => {
                this._treeRoot = root;
                this._onDidChange.fire();
            }, 250);
        }
    }
}
exports.ExplorerViewProvider = ExplorerViewProvider;
//# sourceMappingURL=explorerViewProvider.js.map