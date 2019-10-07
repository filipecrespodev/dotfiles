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
const git_1 = require("./git");
const icons_1 = require("./icons");
class Resource {
    constructor(_uri, _gitRelativePath, _status) {
        this._uri = _uri;
        this._gitRelativePath = _gitRelativePath;
        this._status = _status;
        this.uri = this._uri;
        this.gitRelativePath = this._gitRelativePath;
        this.status = this._status;
        this.resourceUri = this._uri;
        this.command = { title: '', command: 'githd.openCommittedFile', arguments: [this] };
    }
    ;
    get decorations() {
        const light = { iconPath: this._getIconPath('light') };
        const dark = { iconPath: this._getIconPath('dark') };
        let deleted = (this._status.toUpperCase() === 'D');
        const strikeThrough = deleted;
        const faded = deleted;
        return { strikeThrough, faded, light, dark };
    }
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
exports.Resource = Resource;
class ScmViewProvider {
    constructor(model) {
        this._disposables = [];
        let sc = vscode_1.scm.createSourceControl('githd', 'GitHistoryDiff');
        sc.acceptInputCommand = { command: 'githd.updateRef', title: 'Input the SHA1 code' };
        this._resourceGroup = sc.createResourceGroup('committed', 'Committed Files');
        this._disposables.push(sc, this._resourceGroup);
        model.onDidChangeFilesViewContext(context => this._update(context), null, this._disposables);
        this._update(model.filesViewContext);
    }
    dispose() {
        vscode_1.scm.inputBox.value = '';
        this._disposables.forEach(d => d.dispose());
    }
    _update(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const leftRef = context.leftRef;
            const rightRef = context.rightRef;
            vscode_1.scm.inputBox.value = rightRef;
            if (!rightRef) {
                this._resourceGroup.resourceStates = [];
                return;
            }
            if (leftRef) {
                vscode_1.scm.inputBox.value = `${leftRef} .. ${rightRef}`;
            }
            this._resourceGroup.resourceStates = yield this._updateResources(context.leftRef, context.rightRef);
            vscode_1.commands.executeCommand('workbench.view.scm');
        });
    }
    _updateResources(leftRef, rightRef) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield git_1.git.getCommittedFiles(leftRef, rightRef);
            return files.map(file => {
                return new Resource(file.uri, file.gitRelativePath, file.status);
            });
        });
    }
}
exports.ScmViewProvider = ScmViewProvider;
//# sourceMappingURL=scmViewProvider.js.map