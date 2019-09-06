"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
  The core functionality of the autocomplete is work done by Stanislav Sysoev (@d4rkr00t)
  in his stylus extension and been adjusted to account for the slight differences between
  the languages.

  Original stylus version: https://github.com/d4rkr00t/language-stylus
*/
const vscode_1 = require("vscode");
const cssSchema = require("./schemas/autocomplete.cssSchema");
const autocomplete_schema_1 = require("./schemas/autocomplete.schema");
const path = require("path");
const autocomplete_at_1 = require("./schemas/autocomplete.at");
const autocomplete_pseudo_1 = require("./schemas/autocomplete.pseudo");
const util_1 = require("util");
const autocomplete_utility_1 = require("./autocomplete.utility");
const autocomplete_scan_1 = require("./scan/autocomplete.scan");
const autocomplete_commentCompletions_1 = require("./schemas/autocomplete.commentCompletions");
const utility_regex_1 = require("../utility/utility.regex");
class SassCompletion {
    constructor(context) {
        this.context = context;
        this.scan = new autocomplete_scan_1.Scanner(context);
    }
    provideCompletionItems(document, position, token) {
        const start = new vscode_1.Position(position.line, 0);
        const range = new vscode_1.Range(start, position);
        const currentWord = document.getText(range).trim();
        const currentWordUT = document.getText(range);
        const text = document.getText();
        const isValue = autocomplete_utility_1.AutocompleteUtilities.isValue(cssSchema, currentWord);
        const config = vscode_1.workspace.getConfiguration();
        const disableUnitCompletion = config.get('sass.disableUnitCompletion');
        let block = false;
        let isInMixinBlock = false;
        let atRules = [];
        let Units = [], properties = [], values = [], classesAndIds = [], functions = [], variables = [];
        let completions = [];
        if (document.languageId === 'vue') {
            block = autocomplete_utility_1.AutocompleteUtilities.isInVueStyleBlock(start, document);
        }
        if (!block && vscode_1.extensions.getExtension('syler.sass-next') !== undefined && currentWord.startsWith('?')) {
            console.log('a');
            vscode_1.commands.executeCommand('sass.abbreviations').then(() => '', err => console.log('[Sass Abbreviations Error]: ', err));
        }
        if (!block && /^@import/.test(currentWord)) {
            completions = autocomplete_utility_1.AutocompleteUtilities.getImportSuggestionsForCurrentWord(document, currentWord);
            block = true;
        }
        if (!block && currentWord.startsWith('&')) {
            completions = autocomplete_pseudo_1.sassPseudo(config.get('sass.andStared'));
            block = true;
        }
        if (!block && !disableUnitCompletion && util_1.isNumber(currentWordUT)) {
            Units = autocomplete_utility_1.AutocompleteUtilities.getUnits(currentWord);
        }
        if (!block && currentWord.startsWith('/')) {
            completions = autocomplete_commentCompletions_1.sassCommentCompletions();
            block = true;
        }
        if (!block && utility_regex_1.isPath(currentWord)) {
            block = true;
        }
        if (!block) {
            let imports = autocomplete_utility_1.AutocompleteUtilities.getImports(text);
            // also get current file from the workspace State.
            imports.push(path.basename(document.fileName));
            isInMixinBlock = autocomplete_utility_1.AutocompleteUtilities.isInMixinBlock(start, document);
            this.scan.scanFile(document);
            if (isValue) {
                values = autocomplete_utility_1.AutocompleteUtilities.getValues(cssSchema, currentWord);
                if (isInMixinBlock === false) {
                    imports.forEach(item => {
                        const state = this.context.workspaceState.get(path.normalize(path.join(document.fileName, '../', item)));
                        if (state) {
                            for (const key in state) {
                                if (state.hasOwnProperty(key)) {
                                    const element = state[key];
                                    if (element.type === 'Variable') {
                                        const completionItem = new vscode_1.CompletionItem(element.item.title);
                                        completionItem.insertText = element.item.insert;
                                        completionItem.detail = element.item.detail;
                                        completionItem.kind = element.item.kind;
                                        variables.push(completionItem);
                                    }
                                }
                            }
                        }
                    });
                }
                else {
                    variables = isInMixinBlock;
                }
                functions = autocomplete_schema_1.default;
            }
            else {
                variables = [];
                imports.forEach(item => {
                    const state = this.context.workspaceState.get(path.normalize(path.join(document.fileName, '../', item)));
                    if (state) {
                        for (const key in state) {
                            if (state.hasOwnProperty(key)) {
                                const element = state[key];
                                if (element.type === 'Mixin') {
                                    const completionItem = new vscode_1.CompletionItem(element.item.title);
                                    completionItem.insertText = new vscode_1.SnippetString(element.item.insert);
                                    completionItem.detail = element.item.detail;
                                    completionItem.kind = element.item.kind;
                                    variables.push(completionItem);
                                }
                            }
                        }
                    }
                });
                classesAndIds = autocomplete_utility_1.AutocompleteUtilities.getHtmlClassOrIdCompletions(document);
                atRules = autocomplete_at_1.sassAt;
                properties = autocomplete_utility_1.AutocompleteUtilities.getProperties(cssSchema, currentWord);
            }
            completions = [].concat(properties, values, functions, Units, variables, atRules, classesAndIds);
        }
        return completions;
    }
}
exports.default = SassCompletion;
//# sourceMappingURL=autocomplete.js.map