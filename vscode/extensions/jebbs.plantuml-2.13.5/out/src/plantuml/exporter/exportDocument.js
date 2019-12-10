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
const path = require("path");
const appliedRender_1 = require("./appliedRender");
const tools_1 = require("../diagram/tools");
const config_1 = require("../config");
const common_1 = require("../common");
const tools_2 = require("../tools");
const exportDiagrams_1 = require("./exportDiagrams");
function exportDocument(all) {
    return __awaiter(this, void 0, void 0, function* () {
        let stopWatch = new tools_2.StopWatch();
        stopWatch.start();
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage(common_1.localize(0, null));
            return;
        }
        if (!path.isAbsolute(editor.document.fileName)) {
            vscode.window.showInformationMessage(common_1.localize(1, null));
            return;
        }
        ;
        let format = config_1.config.exportFormat(editor.document.uri);
        if (!format) {
            format = yield vscode.window.showQuickPick(appliedRender_1.appliedRender().formats());
            if (!format)
                return;
        }
        let diagrams = [];
        if (all) {
            diagrams = tools_1.diagramsOf(editor.document);
            if (!diagrams.length) {
                vscode.window.showInformationMessage(common_1.localize(2, null));
                return;
            }
        }
        else {
            let dg = tools_1.currentDiagram();
            if (!dg) {
                vscode.window.showInformationMessage(common_1.localize(3, null));
                return;
            }
            diagrams.push(dg);
            editor.selections = [new vscode.Selection(dg.start, dg.end)];
        }
        exportDiagrams_1.exportDiagrams(diagrams, format, common_1.bar).then((results) => __awaiter(this, void 0, void 0, function* () {
            stopWatch.stop();
            common_1.bar.hide();
            if (!results.length)
                return;
            let viewReport = common_1.localize(26, null);
            let btn = yield vscode.window.showInformationMessage(common_1.localize(4, null), viewReport);
            if (btn !== viewReport)
                return;
            let fileCnt = 0;
            let fileLst = results.reduce((prev, files) => {
                let filtered = files.filter(v => !!v.length);
                fileCnt += filtered.length;
                return prev + "\n" + filtered.join("\n");
            }, "");
            tools_2.showMessagePanel(common_1.localize(27, null, diagrams.length, fileCnt, stopWatch.runTime() / 1000) + fileLst);
        }), error => {
            common_1.bar.hide();
            tools_2.showMessagePanel(error);
        });
        return;
    });
}
exports.exportDocument = exportDocument;
//# sourceMappingURL=exportDocument.js.map