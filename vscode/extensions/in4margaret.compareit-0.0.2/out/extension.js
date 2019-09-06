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
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const clipboardy_1 = require("clipboardy");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    vscode.workspace.registerTextDocumentContentProvider('compareit', {
        /**
         * Provide textual content for a given uri.
         *
         * The editor will use the returned string-content to create a readonly
         * [document](#TextDocument). Resources allocated should be released when
         * the corresponding document has been [closed](#workspace.onDidCloseTextDocument).
         *
         * @param uri An uri which scheme matches the scheme this provider was [registered](#workspace.registerTextDocumentContentProvider) for.
         * @param token A cancellation token.
         * @return A string or a thenable that resolves to such.
         */
        provideTextDocumentContent(uri, token) {
            return __awaiter(this, void 0, void 0, function* () {
                const clipboardData = yield clipboardy_1.read();
                return clipboardData;
            });
        }
    });
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let compareWith = vscode.commands.registerCommand('compareit.compareWith', (selectedFile) => __awaiter(this, void 0, void 0, function* () {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        const uris = yield vscode.window.showOpenDialog({});
        if (!uris) {
            vscode.window.showInformationMessage('Please select file to compare');
            return;
        }
        let success = yield vscode.commands.executeCommand('vscode.diff', selectedFile, uris[0]);
    }));
    let compareWithClipboard = vscode.commands.registerCommand('compareit.compareWithClipboard', (selectedFile) => __awaiter(this, void 0, void 0, function* () {
        let success = yield vscode.commands.executeCommand('vscode.diff', selectedFile, vscode.Uri.parse('compareit://clipboard'));
    }));
    context.subscriptions.push(compareWith);
    context.subscriptions.push(compareWithClipboard);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map