"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const tools_1 = require("../diagram/tools");
const config_1 = require("../config");
const common_1 = require("../common");
const plantumlServer_1 = require("../renders/plantumlServer");
const urlMaker_1 = require("./urlMaker");
function makeDocumentURL(all) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config_1.config.server) {
            vscode.window.showWarningMessage(common_1.localize(53, null));
            return;
        }
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage(common_1.localize(14, null));
            return;
        }
        let format = config_1.config.urlFormat;
        if (!format) {
            format = yield vscode.window.showQuickPick(plantumlServer_1.plantumlServer.formats());
            if (!format)
                return;
        }
        let diagrams = [];
        if (all) {
            diagrams = tools_1.diagramsOf(editor.document);
            if (!diagrams.length) {
                vscode.window.showWarningMessage(common_1.localize(15, null));
                return;
            }
        }
        else {
            let dg = tools_1.currentDiagram();
            if (!dg) {
                vscode.window.showWarningMessage(common_1.localize(3, null));
                return;
            }
            diagrams.push(dg);
            editor.selections = [new vscode.Selection(dg.start, dg.end)];
        }
        let results = urlMaker_1.MakeDiagramsURL(diagrams, format, common_1.bar);
        common_1.bar.hide();
        common_1.outputPanel.clear();
        results.map(result => {
            common_1.outputPanel.appendLine(result.name);
            if (config_1.config.urlResult == "MarkDown") {
                result.urls.forEach(url => {
                    common_1.outputPanel.appendLine(`\n![${result.name}](${url} "${result.name}")`);
                });
            }
            else {
                result.urls.forEach(url => {
                    common_1.outputPanel.appendLine(url);
                });
            }
            common_1.outputPanel.appendLine("");
        });
        common_1.outputPanel.show();
    });
}
exports.makeDocumentURL = makeDocumentURL;
//# sourceMappingURL=urlDocument.js.map