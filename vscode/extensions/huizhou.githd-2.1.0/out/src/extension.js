'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("./model");
const gitService_1 = require("./gitService");
const commands_1 = require("./commands");
const historyViewProvider_1 = require("./historyViewProvider");
const explorerViewProvider_1 = require("./explorerViewProvider");
const infoViewProvider_1 = require("./infoViewProvider");
const blameViewProvider_1 = require("./blameViewProvider");
function activate(context) {
    let gitService = new gitService_1.GitService();
    let model = new model_1.Model(gitService);
    let historyViewProvider = new historyViewProvider_1.HistoryViewProvider(model, gitService);
    let infoViewProvider = new infoViewProvider_1.InfoViewProvider(model, gitService);
    let explorerProvider = new explorerViewProvider_1.ExplorerViewProvider(model, gitService);
    let blameViewProvider = new blameViewProvider_1.BlameViewProvider(model, gitService);
    let commandCenter = new commands_1.CommandCenter(model, gitService, historyViewProvider, infoViewProvider);
    context.subscriptions.push(gitService, model, historyViewProvider, infoViewProvider, explorerProvider, commandCenter, blameViewProvider);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map