"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const tools_1 = require("../plantuml/diagram/tools");
const exportDiagrams_1 = require("../plantuml/exporter/exportDiagrams");
const config_1 = require("../plantuml/config");
class ExportWatcher extends vscode.Disposable {
    constructor() {
        super(() => this.dispose());
        this._disposables = [];
        this._disposables.push(vscode.workspace.onDidSaveTextDocument(doc => this.tryExportDocument(doc)));
    }
    dispose() {
        this._disposables && this._disposables.length && this._disposables.map(d => d.dispose());
    }
    tryExportDocument(document) {
        // FIXME: configurable
        if (!true)
            return;
        let format = config_1.config.exportFormat(document.uri);
        if (!format) {
            // FIXME: localizable
            vscode.window.showInformationMessage("Export format not set, ExportOnSave setting is ignored.");
            return;
        }
        let diagrams = tools_1.diagramsOf(document);
        if (!diagrams || !diagrams.length)
            return;
        exportDiagrams_1.exportDiagrams(diagrams, format, null);
    }
}
exports.ExportWatcher = ExportWatcher;
//# sourceMappingURL=exportWatcher.js.map