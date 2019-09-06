"use strict";
var vscode = require("vscode");
function activate(context) {
    console.log("Congratulations, your extension 'highlight-trailing-white-spaces' is now active!");
    vscode.window.onDidChangeActiveTextEditor(function (editor) {
        if (!editor) {
            return;
        }
        updateDecorations(editor);
    }, null, context.subscriptions);
    vscode.window.onDidChangeTextEditorSelection(function (event) {
        if (!event.textEditor) {
            console.error("onDidChangeTextEditorSelection(" + event + "): no active text editor.");
            return;
        }
        updateDecorations(event.textEditor);
    }, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(function (event) {
        if (!vscode.window.activeTextEditor) {
            console.error("onDidChangeTextDocument(" + event + "): no active text editor.");
            return;
        }
        updateDecorations(vscode.window.activeTextEditor);
    }, null, context.subscriptions);
    var trailingSpacesDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: "rgba(255,0,0,0.3)"
    });
    function updateDecorations(activeTextEditor) {
        if (!activeTextEditor) {
            console.error("updateDecorations(): no active text editor.");
            return;
        }
        var regEx = /\s+$/g;
        var doc = activeTextEditor.document;
        var decorationOptions = [];
        for (var i = 0; i < doc.lineCount; i++) {
            var lineText = doc.lineAt(i);
            var line = lineText.text;
            if (i === activeTextEditor.selection.active.line) {
                continue;
            }
            var match = void 0;
            while (match = regEx.exec(line)) {
                var startPos = new vscode.Position(i, match.index);
                var endPos = new vscode.Position(i, match.index + match[0].length);
                var decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: "Number **" + match[0] + "**" };
                decorationOptions.push(decoration);
            }
        }
        activeTextEditor.setDecorations(trailingSpacesDecorationType, decorationOptions);
    }
    updateDecorations(vscode.window.activeTextEditor);
}
exports.activate = activate;
function deactivate() {
    console.log("The extension 'highlight-trailing-white-spaces' is now deactivated.");
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map