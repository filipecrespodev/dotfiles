"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const appliedRender_1 = require("./appliedRender");
const config_1 = require("../config");
const common_1 = require("../common");
const tools_1 = require("../tools");
const exportURIs_1 = require("./exportURIs");
function exportWorkSpace(para) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!vscode.workspace.workspaceFolders) {
            return;
        }
        let files = yield getFileList(para);
        let hasEmptyFormat = files.reduce((hasEmpty, file) => {
            if (hasEmpty)
                return true;
            return !file.format;
        }, false);
        if (hasEmptyFormat) {
            let userPickFormat = yield vscode.window.showQuickPick(appliedRender_1.appliedRender().formats(), {
                placeHolder: common_1.localize(34, null)
            });
            if (!userPickFormat)
                return;
            files.map(file => {
                file.format = file.format || userPickFormat;
            });
        }
        doBuild(files);
    });
}
exports.exportWorkSpace = exportWorkSpace;
function getFileList(para) {
    return __awaiter(this, void 0, void 0, function* () {
        let _files = [];
        if (!vscode.workspace.workspaceFolders) {
            return [];
        }
        if (!para) {
            for (let folder of vscode.workspace.workspaceFolders) {
                _files.push(...yield getFileList(config_1.config.diagramsRoot(folder.uri)));
            }
        }
        else if (para instanceof Array) {
            for (let u of para.filter(p => p instanceof vscode.Uri)) {
                _files.push(...yield getFileList(u));
            }
        }
        else if (para instanceof vscode.Uri) {
            if (fs.statSync(para.fsPath).isDirectory()) {
                let exts = config_1.config.fileExtensions(para);
                let folder = vscode.workspace.getWorkspaceFolder(para);
                let relPath = path.relative(folder.uri.fsPath, para.fsPath);
                relPath = relPath ? relPath + '/' : '';
                let files = yield vscode.workspace.findFiles(`${relPath}**/*${exts}`, "");
                files.filter(file => tools_1.isSubPath(file.fsPath, folder.uri.fsPath))
                    .map(f => _files.push({
                    uri: f,
                    format: config_1.config.exportFormat(f)
                }));
            }
            else {
                _files.push({
                    uri: para,
                    format: config_1.config.exportFormat(para)
                });
            }
        }
        return _files;
    });
}
function doBuild(files) {
    if (!files.length) {
        vscode.window.showInformationMessage(common_1.localize(8, null));
        return;
    }
    let stopWatch = new tools_1.StopWatch();
    stopWatch.start();
    exportURIs_1.exportFiles(files, common_1.bar).then((r) => __awaiter(this, void 0, void 0, function* () {
        stopWatch.stop();
        r = r;
        let results = r.results;
        let errors = r.errors;
        common_1.bar.hide();
        //uris.length: found documents count 
        //results.length: exported documents count 
        let viewReport = common_1.localize(26, null);
        let msg = "";
        let btn = "";
        if (!results.length) {
            msg = common_1.localize(29, null);
            if (!errors.length) {
                vscode.window.showInformationMessage(msg);
            }
            else {
                btn = yield vscode.window.showInformationMessage(msg, viewReport);
                if (btn === viewReport)
                    showReport();
            }
            return;
        }
        msg = common_1.localize(errors.length ? 12 : 13, null, results.length);
        btn = yield vscode.window.showInformationMessage(msg, viewReport);
        if (btn === viewReport)
            showReport();
        function showReport() {
            let fileCnt = 0;
            let diagramCnt = 0;
            let fileLst = results.reduce((list, diagrams) => {
                if (!diagrams || !diagrams.length)
                    return list;
                diagramCnt += diagrams.length;
                return list + diagrams.reduce((oneDiagramList, files) => {
                    if (!files || !files.length)
                        return oneDiagramList;
                    let filtered = files.filter(v => !!v.length);
                    fileCnt += filtered.length;
                    return oneDiagramList + "\n" + filtered.join("\n");
                }, "");
            }, "");
            let report = common_1.localize(28, null, results.length, diagramCnt, fileCnt, stopWatch.runTime() / 1000) + fileLst;
            if (errors.length) {
                report += "\n" + errors.reduce((p, c) => {
                    return p + (p ? "\n" : "") + c.error;
                }, "");
            }
            tools_1.showMessagePanel(report);
        }
    }));
}
//# sourceMappingURL=exportWorkSpace.js.map