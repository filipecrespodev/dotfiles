'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const config_1 = require("./plantuml/config");
const previewer_1 = require("./providers/previewer");
const symboler_1 = require("./providers/symboler");
const completion_1 = require("./providers/completion");
const signature_1 = require("./providers/signature");
const formatter_1 = require("./providers/formatter");
const messages_1 = require("./plantuml/messages");
const common_1 = require("./plantuml/common");
const context_1 = require("./plantuml/context");
const exportCurrent_1 = require("./commands/exportCurrent");
const exportDocument_1 = require("./commands/exportDocument");
const exportWorkspace_1 = require("./commands/exportWorkspace");
const urlCurrent_1 = require("./commands/urlCurrent");
const urlDocument_1 = require("./commands/urlDocument");
const extractSource_1 = require("./commands/extractSource");
const index_1 = require("./markdown-it-plantuml/index");
const diagnoser_1 = require("./providers/diagnoser");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    context_1.contextManager.set(context);
    try {
        const ext = vscode.extensions.getExtension("jebbs.plantuml");
        const version = ext.packageJSON.version;
        messages_1.notifyOnNewVersion(context, version);
        context.subscriptions.push(new exportCurrent_1.CommandExportCurrent(), new exportDocument_1.CommandExportDocument(), new exportWorkspace_1.CommandExportWorkspace(), new urlCurrent_1.CommandURLCurrent(), new urlDocument_1.CommandURLDocument(), new extractSource_1.CommandExtractSource(), new formatter_1.Formatter(), new symboler_1.Symbol(), new completion_1.Completion(), new signature_1.Signature(), new diagnoser_1.Diagnoser(ext), previewer_1.previewer, config_1.config, common_1.outputPanel, common_1.bar);
        return {
            extendMarkdownIt(md) {
                return md.use(index_1.plantumlPlugin(md));
            }
        };
    }
    catch (error) {
        common_1.outputPanel.clear();
        common_1.outputPanel.append(error);
    }
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map