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
const macros_1 = require("./macros");
function MacroCompletionItems(target, position, token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!target)
            return [];
        return new Promise((resolve, reject) => {
            const results = [];
            const macros = macros_1.macrosOf(target, position);
            macros
                .forEach(macro => {
                const item = new vscode.CompletionItem(macro.name, vscode.CompletionItemKind.Method);
                item.detail = macro.getDetailLabel();
                item.insertText = new vscode.SnippetString(macro.name);
                results.push(item);
            });
            return resolve(results);
        });
    });
}
exports.MacroCompletionItems = MacroCompletionItems;
//# sourceMappingURL=macroCompletion.js.map