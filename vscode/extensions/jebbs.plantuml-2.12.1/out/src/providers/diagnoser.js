"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const tools_1 = require("../plantuml/diagram/tools");
const common_1 = require("../plantuml/common");
class Diagnoser extends vscode.Disposable {
    constructor(ext) {
        super(() => this.dispose());
        this._disposables = [];
        this.langID = ext.packageJSON.contributes.languages[0].id;
        this.extName = ext.packageJSON.name;
        this.DiagnosticCollection = vscode.languages.createDiagnosticCollection(this.extName);
        this._disposables.push(this.DiagnosticCollection, vscode.workspace.onDidOpenTextDocument(doc => this.diagnose(doc)), vscode.workspace.onDidChangeTextDocument(e => this.diagnose(e.document)), vscode.workspace.onDidCloseTextDocument(doc => this.removeDiagnose(doc)));
    }
    dispose() {
        this._disposables && this._disposables.length && this._disposables.map(d => d.dispose());
    }
    diagnose(document) {
        if (document.languageId !== this.langID)
            return;
        let diagrams = tools_1.diagramsOf(document);
        let diagnostics = [];
        let names = {};
        diagrams.map(d => {
            let range = document.lineAt(d.start.line).range;
            if (!d.titleRaw) {
                diagnostics.push(new vscode.Diagnostic(range, common_1.localize(30, null), vscode.DiagnosticSeverity.Warning));
            }
            if (names[d.title]) {
                diagnostics.push(new vscode.Diagnostic(range, common_1.localize(31, null, d.title), vscode.DiagnosticSeverity.Error));
            }
            else {
                names[d.title] = true;
            }
        });
        this.removeDiagnose(document);
        this.DiagnosticCollection.set(document.uri, diagnostics);
    }
    removeDiagnose(document) {
        this.DiagnosticCollection.delete(document.uri);
    }
}
exports.Diagnoser = Diagnoser;
//# sourceMappingURL=diagnoser.js.map