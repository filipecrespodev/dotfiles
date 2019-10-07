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
function getConfiguration() {
    return {
        withFolder: vscode_1.workspace.getConfiguration('githd.explorerView').get('withFolder'),
        commitsCount: vscode_1.workspace.getConfiguration('githd.logView').get('commitsCount'),
        expressMode: vscode_1.workspace.getConfiguration('githd.logView').get('expressMode'),
        displayExpress: vscode_1.workspace.getConfiguration('githd.logView').get('displayExpressStatus'),
        blameEnabled: vscode_1.workspace.getConfiguration('githd.blameView').get('enabled'),
        traceLevel: vscode_1.workspace.getConfiguration('githd').get('traceLevel')
    };
}
class Model {
    constructor(_gitService) {
        this._gitService = _gitService;
        this._onDidChangeConfiguratoin = new vscode_1.EventEmitter();
        this._onDidChangeFilesViewContext = new vscode_1.EventEmitter();
        this._onDidChangeHistoryViewContext = new vscode_1.EventEmitter();
        this._disposables = [];
        this._config = getConfiguration();
        tracer_1.Tracer.level = this._config.traceLevel;
        vscode_1.workspace.onDidChangeConfiguration(() => {
            let newConfig = getConfiguration();
            if (newConfig.withFolder !== this._config.withFolder ||
                newConfig.commitsCount !== this._config.commitsCount ||
                newConfig.expressMode !== this._config.expressMode ||
                newConfig.displayExpress !== this._config.displayExpress ||
                newConfig.blameEnabled !== this._config.blameEnabled ||
                newConfig.traceLevel !== this._config.traceLevel) {
                tracer_1.Tracer.info(`Model: configuration updated ${JSON.stringify(newConfig)}`);
                this._config = newConfig;
                this._onDidChangeConfiguratoin.fire(newConfig);
                tracer_1.Tracer.level = newConfig.traceLevel;
            }
        }, null, this._disposables);
        vscode_1.workspace.onDidChangeWorkspaceFolders(e => {
            this._gitService.updateGitRoots(vscode_1.workspace.workspaceFolders);
        }, null, this._disposables);
        this._gitService.updateGitRoots(vscode_1.workspace.workspaceFolders);
        this._disposables.push(this._onDidChangeConfiguratoin);
        this._disposables.push(this._onDidChangeFilesViewContext);
        this._disposables.push(this._onDidChangeHistoryViewContext);
    }
    get configuration() { return this._config; }
    get filesViewContext() {
        return this._filesViewContext;
    }
    set filesViewContext(context) {
        tracer_1.Tracer.info(`Model: set filesViewContext - ${JSON.stringify(context)}`);
        if (!this._filesViewContext) {
            this._filesViewContext = context;
            this._onDidChangeFilesViewContext.fire(this._filesViewContext);
        }
        else if (this._filesViewContext.leftRef != context.leftRef
            || this._filesViewContext.rightRef != context.rightRef
            || this._filesViewContext.specifiedPath != context.specifiedPath
            || this._filesViewContext.focusedLineInfo != context.focusedLineInfo) {
            this._filesViewContext = context;
            this._onDidChangeFilesViewContext.fire(this._filesViewContext);
        }
        vscode_1.commands.executeCommand('workbench.view.extension.githd-explorer');
    }
    get historyViewContext() {
        return this._historyViewContext;
    }
    setHistoryViewContext(context) {
        return __awaiter(this, void 0, void 0, function* () {
            tracer_1.Tracer.info(`Model: set historyViewContext - ${JSON.stringify(context)}`);
            this._historyViewContext = context;
            if (!this._historyViewContext.branch) {
                this._historyViewContext.branch = yield this._gitService.getCurrentBranch(context.repo);
            }
            this._onDidChangeHistoryViewContext.fire(this._historyViewContext);
        });
    }
    get onDidChangeConfiguration() { return this._onDidChangeConfiguratoin.event; }
    get onDidChangeFilesViewContext() { return this._onDidChangeFilesViewContext.event; }
    get onDidChangeHistoryViewContext() { return this._onDidChangeHistoryViewContext.event; }
    dispose() {
        this._disposables.forEach(d => d.dispose());
    }
}
exports.Model = Model;
//# sourceMappingURL=model.js.map