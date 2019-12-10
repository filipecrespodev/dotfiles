"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const nls = require("vscode-nls");
const path_1 = require("path");
exports.languageid = "diagram";
exports.outputPanel = vscode.window.createOutputChannel("PlantUML");
exports.bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
exports.extensionPath = vscode.extensions.getExtension("jebbs.plantuml").extensionPath;
nls.config({ locale: vscode.env.language });
exports.localize = nls.loadMessageBundle(path_1.join(exports.extensionPath, "langs", "lang.json"));
//# sourceMappingURL=common.js.map