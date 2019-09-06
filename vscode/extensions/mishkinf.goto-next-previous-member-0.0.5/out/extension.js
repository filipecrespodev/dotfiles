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
const vscode = require("vscode");
function activate(context) {
    let symbolKindsSet;
    let symbolIndex = 0;
    let tree = [];
    let dirtyTree = true;
    const reloadConfiguration = () => {
        // Get the array of allowed symbols from the config file
        let symbolKindsArray = vscode.workspace.getConfiguration().get("gotoNextPreviousMember.symbolKinds");
        // If it's empty there's nothing to do...
        if (symbolKindsArray === undefined) {
            return;
        }
        // Convert to lowercase make config file case-insensitive
        symbolKindsArray = symbolKindsArray.map(key => key.toLowerCase());
        // Convert to a Set for faster lookups
        symbolKindsSet = new Set(symbolKindsArray);
        // Reload the symbol tree
        dirtyTree = true;
    };
    const checkSymbolKindPermitted = (symbolKind) => {
        // https://code.visualstudio.com/api/references/vscode-api#SymbolKind
        return symbolKindsSet.size === 0 || ((symbolKind === vscode.SymbolKind.Array && symbolKindsSet.has("array")) ||
            (symbolKind === vscode.SymbolKind.Boolean && symbolKindsSet.has("boolean")) ||
            (symbolKind === vscode.SymbolKind.Class && symbolKindsSet.has("class")) ||
            (symbolKind === vscode.SymbolKind.Constant && symbolKindsSet.has("constant")) ||
            (symbolKind === vscode.SymbolKind.Constructor && symbolKindsSet.has("constructor")) ||
            (symbolKind === vscode.SymbolKind.Enum && symbolKindsSet.has("enum")) ||
            (symbolKind === vscode.SymbolKind.EnumMember && symbolKindsSet.has("enummember")) ||
            (symbolKind === vscode.SymbolKind.Event && symbolKindsSet.has("event")) ||
            (symbolKind === vscode.SymbolKind.Field && symbolKindsSet.has("field")) ||
            (symbolKind === vscode.SymbolKind.File && symbolKindsSet.has("file")) ||
            (symbolKind === vscode.SymbolKind.Function && symbolKindsSet.has("function")) ||
            (symbolKind === vscode.SymbolKind.Interface && symbolKindsSet.has("interface")) ||
            (symbolKind === vscode.SymbolKind.Key && symbolKindsSet.has("key")) ||
            (symbolKind === vscode.SymbolKind.Method && symbolKindsSet.has("method")) ||
            (symbolKind === vscode.SymbolKind.Module && symbolKindsSet.has("module")) ||
            (symbolKind === vscode.SymbolKind.Namespace && symbolKindsSet.has("namespace")) ||
            (symbolKind === vscode.SymbolKind.Null && symbolKindsSet.has("null")) ||
            (symbolKind === vscode.SymbolKind.Number && symbolKindsSet.has("number")) ||
            (symbolKind === vscode.SymbolKind.Object && symbolKindsSet.has("object")) ||
            (symbolKind === vscode.SymbolKind.Operator && symbolKindsSet.has("operator")) ||
            (symbolKind === vscode.SymbolKind.Package && symbolKindsSet.has("package")) ||
            (symbolKind === vscode.SymbolKind.Property && symbolKindsSet.has("property")) ||
            (symbolKind === vscode.SymbolKind.String && symbolKindsSet.has("string")) ||
            (symbolKind === vscode.SymbolKind.Struct && symbolKindsSet.has("struct")) ||
            (symbolKind === vscode.SymbolKind.TypeParameter && symbolKindsSet.has("typeparameter")) ||
            (symbolKind === vscode.SymbolKind.Variable && symbolKindsSet.has("variable")));
    };
    const refreshTree = (editor) => __awaiter(this, void 0, void 0, function* () {
        tree = (yield vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", editor.document.uri).then(results => {
            if (!results) {
                return [];
            }
            const flattenedSymbols = [];
            const addSymbols = (flattenedSymbols, results) => {
                results.forEach((symbol) => {
                    if (checkSymbolKindPermitted(symbol.kind)) {
                        flattenedSymbols.push(symbol);
                    }
                    if (symbol.children && symbol.children.length > 0) {
                        addSymbols(flattenedSymbols, symbol.children);
                    }
                });
            };
            addSymbols(flattenedSymbols, results);
            return flattenedSymbols.sort((x, y) => {
                const lineDiff = x.selectionRange.start.line - y.selectionRange.start.line;
                if (lineDiff === 0) {
                    return x.selectionRange.start.character - y.selectionRange.start.character;
                }
                return lineDiff;
            });
        })) || [];
    });
    const activeEditorChangeListener = vscode.window.onDidChangeActiveTextEditor(e => {
        dirtyTree = true;
        tree = [];
        symbolIndex = 0;
    });
    const documentChangeListener = vscode.workspace.onDidChangeTextDocument(e => {
        dirtyTree = true;
        tree = [];
        symbolIndex = 0;
    });
    const setSymbolIndex = (cursorLine, cursorCharacter, directionNext) => {
        let member;
        if (directionNext) {
            symbolIndex = -1;
            do {
                symbolIndex++;
                member = tree[symbolIndex].selectionRange.start;
            } while (member.line < cursorLine || member.line === cursorLine && member.character <= cursorCharacter);
        }
        else {
            symbolIndex = tree.length;
            do {
                symbolIndex--;
                member = tree[symbolIndex].selectionRange.start;
            } while (member.line > cursorLine || member.line === cursorLine && member.character >= cursorCharacter);
        }
    };
    const previousMemberCommand = vscode.commands.registerTextEditorCommand("gotoNextPreviousMember.previousMember", (editor) => __awaiter(this, void 0, void 0, function* () {
        let symbol;
        if (tree.length === 0 || dirtyTree) {
            yield refreshTree(editor);
            dirtyTree = false;
        }
        // If there are still no symbols skip the rest of the function
        if (tree.length === 0) {
            return;
        }
        const activeCursor = editor.selection.active;
        setSymbolIndex(activeCursor.line, activeCursor.character, false);
        symbol = tree[symbolIndex];
        if (symbol) {
            editor.selection = new vscode.Selection(symbol.selectionRange.start.line, symbol.selectionRange.start.character, symbol.selectionRange.start.line, symbol.selectionRange.start.character);
            vscode.commands.executeCommand("revealLine", {
                lineNumber: symbol.selectionRange.start.line
            });
        }
        vscode.window.setStatusBarMessage("Previous Member", 1000);
    }));
    const nextMemberCommand = vscode.commands.registerTextEditorCommand("gotoNextPreviousMember.nextMember", (editor) => __awaiter(this, void 0, void 0, function* () {
        let symbol;
        if (tree.length === 0 || dirtyTree) {
            yield refreshTree(editor);
            dirtyTree = false;
        }
        // If there are still no symbols skip the rest of the function
        if (tree.length === 0) {
            return;
        }
        const activeCursor = editor.selection.active;
        setSymbolIndex(activeCursor.line, activeCursor.character, true);
        symbol = tree[symbolIndex];
        if (symbol) {
            editor.selection = new vscode.Selection(symbol.selectionRange.start.line, symbol.selectionRange.start.character, symbol.selectionRange.start.line, symbol.selectionRange.start.character);
            vscode.commands.executeCommand("revealLine", {
                lineNumber: symbol.selectionRange.start.line
            });
        }
        vscode.window.setStatusBarMessage("Next Member", 1000);
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('gotoNextPreviousMember.symbolKinds')) {
            if (vscode.window.activeTextEditor) {
                reloadConfiguration();
            }
        }
    }));
    context.subscriptions.push(previousMemberCommand, nextMemberCommand, documentChangeListener, activeEditorChangeListener);
    reloadConfiguration();
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map