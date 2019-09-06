"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_regex_1 = require("../utility/utility.regex");
const vscode_1 = require("vscode");
const autocomplete_units_1 = require("./schemas/autocomplete.units");
const fs_1 = require("fs");
const path_1 = require("path");
class AutocompleteUtilities {
    /**
     * Naive check whether currentWord is value for given property
     * @param {Object} cssSchema
     * @param {String} currentWord
     * @return {Boolean}
     */
    static isValue(cssSchema, currentWord) {
        const property = AutocompleteUtilities.getPropertyName(currentWord);
        return property && Boolean(AutocompleteUtilities.findPropertySchema(cssSchema, property));
    }
    /**
     * Formats property name
     * @param {String} currentWord
     * @return {String}
     */
    static getPropertyName(currentWord) {
        return currentWord
            .trim()
            .replace(':', ' ')
            .split(' ')[0];
    }
    /**
     * Search for property in cssSchema
     * @param {Object} cssSchema
     * @param {String} property
     * @return {Object}
     */
    static findPropertySchema(cssSchema, property) {
        return cssSchema.data.css.properties.find(item => item.name === property);
    }
    /**
     * Returns property list for completion
     * @param {Object} cssSchema
     * @param {String} currentWord
     * @return {CompletionItem}
     */
    static getProperties(cssSchema, currentWord) {
        if (utility_regex_1.isClassOrId(currentWord) || utility_regex_1.isAtRule(currentWord)) {
            return [];
        }
        return cssSchema.data.css.properties.map(property => {
            const completionItem = new vscode_1.CompletionItem(property.name);
            completionItem.insertText = property.name.concat(': ');
            completionItem.detail = property.desc;
            completionItem.kind = vscode_1.CompletionItemKind.Property;
            return completionItem;
        });
    }
    /**
     * Returns values for current property for completion list
     * @param {Object} cssSchema
     * @param {String} currentWord
     * @return {CompletionItem}
     */
    static getValues(cssSchema, currentWord) {
        const property = AutocompleteUtilities.getPropertyName(currentWord);
        const values = AutocompleteUtilities.findPropertySchema(cssSchema, property).values;
        if (!values) {
            return [];
        }
        return values.map(property => {
            const completionItem = new vscode_1.CompletionItem(property.name);
            completionItem.detail = property.desc;
            completionItem.kind = vscode_1.CompletionItemKind.Value;
            return completionItem;
        });
    }
    /**
     * Get the imports.
     * @param text text of the current File.
     */
    static getImports(text) {
        const regex = /\/?\/? {0,}@import{1}.*/g; //
        let m;
        const imports = [];
        while ((m = regex.exec(text)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            m.forEach((match) => {
                if (!match.startsWith('//')) {
                    let rep = match.replace('@import', '').trim();
                    const rEndsWithSass = /.sass$/;
                    if (!rEndsWithSass.test(rep)) {
                        rep = rep.concat('.sass');
                    }
                    imports.push(rep);
                }
            });
        }
        return imports;
    }
    /**
     * gets unit completions.
     * @param currentword
     */
    static getUnits(currentword) {
        const units = [];
        autocomplete_units_1.default.forEach(item => {
            const lastWord = currentword.split(' ');
            const rep = lastWord[lastWord.length - 1];
            const completionItem = new vscode_1.CompletionItem(rep + item.name);
            completionItem.insertText = new vscode_1.SnippetString(rep + item.body);
            completionItem.detail = item.desc;
            completionItem.kind = vscode_1.CompletionItemKind.Unit;
            units.push(completionItem);
        });
        return units;
    }
    static getImportSuggestionsForCurrentWord(document, currentWord) {
        const suggestions = [];
        const path = path_1.normalize(path_1.join(document.fileName, '../', currentWord.replace('@import', '').trim()));
        const dir = fs_1.readdirSync(path);
        for (const file of dir) {
            if (/.sass$/.test(file) && file !== path_1.basename(document.fileName)) {
                const rep = file.replace('.sass', '');
                const item = new vscode_1.CompletionItem(rep);
                item.insertText = rep;
                item.detail = `Import - ${rep}`;
                item.kind = vscode_1.CompletionItemKind.Reference;
                suggestions.push(item);
            }
            else if (fs_1.statSync(path + '/' + file).isDirectory()) {
                const item = new vscode_1.CompletionItem(file);
                item.insertText = file;
                item.detail = `Folder - ${file}`;
                item.kind = vscode_1.CompletionItemKind.Folder;
                suggestions.push(item);
            }
        }
        return suggestions;
    }
    static getHtmlClassOrIdCompletions(document) {
        const path = path_1.normalize(path_1.join(document.fileName, '../', './'));
        const dir = fs_1.readdirSync(path);
        const classesAndIds = this.getDocumentClassesAndIds(document);
        const res = [];
        const addedClasses = [];
        const regex = /class="([\w ]*)"|id="(\w*)"/g;
        for (const file of dir) {
            const fileName = path_1.basename(document.fileName).replace('.sass', '.html');
            if (new RegExp(fileName).test(file)) {
                const text = fs_1.readFileSync(path_1.normalize(document.fileName).replace('.sass', '.html')).toString();
                let m;
                while ((m = regex.exec(text)) !== null) {
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                    m.forEach((match, groupIndex) => {
                        if (groupIndex !== 0 && match !== undefined) {
                            if (groupIndex === 1) {
                                const classes = match.split(' ');
                                classes.forEach(className => {
                                    if (classesAndIds.find(value => value === '.'.concat(className)) === undefined) {
                                        if (addedClasses.find(item => className === item) === undefined) {
                                            addedClasses.push(className);
                                            const item = new vscode_1.CompletionItem('.'.concat(className));
                                            item.kind = vscode_1.CompletionItemKind.Class;
                                            item.detail = `Class From: ${fileName}`;
                                            item.insertText = new vscode_1.SnippetString('.'.concat(className, '\n\t$0'));
                                            res.push(item);
                                        }
                                    }
                                });
                            }
                            else {
                                if (classesAndIds.find(value => value === '#'.concat(match)) === undefined) {
                                    const item = new vscode_1.CompletionItem('#'.concat(match));
                                    item.kind = vscode_1.CompletionItemKind.Class;
                                    item.detail = `Id From: ${fileName}`;
                                    item.insertText = new vscode_1.SnippetString('#'.concat(match, '\n\t$0'));
                                    res.push(item);
                                }
                            }
                        }
                    });
                }
            }
        }
        return res;
    }
    /**
     * sets the block variable, don't get confused by the return values.
     */
    static isInVueStyleBlock(start, document) {
        for (let i = start.line; i > 0; i--) {
            const line = document.lineAt(i);
            if (/^ *<[\w"'= ]*lang=['"]sass['"][\w"'= ]*>/.test(line.text)) {
                if (!(i === start.line)) {
                    return false;
                }
                break;
            }
            else if (/<\/ *style *>/.test(line.text)) {
                if (!(i === start.line)) {
                    return true;
                }
                break;
            }
        }
        return true;
    }
    static isInMixinBlock(start, document) {
        for (let i = start.line; i > 0; i--) {
            const line = document.lineAt(i);
            if (/^ *@mixin/.test(line.text)) {
                const firstSplit = line.text.split('(');
                if (firstSplit[1] !== undefined) {
                    const resVar = [];
                    const mixinName = firstSplit[0].replace('@mixin', '').trim();
                    firstSplit[1].split('$').forEach(variable => {
                        if (variable) {
                            const rep = '$'.concat(variable.split(/[,: \)]/)[0]);
                            const completionItem = new vscode_1.CompletionItem(rep);
                            completionItem.insertText = new vscode_1.SnippetString(rep.replace('$', '\\$'));
                            completionItem.detail = `@mixin ${mixinName}\n(${rep.replace('$', '')}) - Local Variable`;
                            completionItem.kind = vscode_1.CompletionItemKind.Variable;
                            resVar.push(completionItem);
                        }
                    });
                    return resVar;
                }
                else {
                    return [];
                }
            }
            else if (/^\S.*/.test(line.text)) {
                return false;
            }
        }
        return false;
    }
    static getDocumentClassesAndIds(document) {
        const classesAndIds = [];
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            if (utility_regex_1.isClassOrId(line.text)) {
                classesAndIds.push(line.text.trim());
            }
        }
        return classesAndIds;
    }
}
exports.AutocompleteUtilities = AutocompleteUtilities;
//# sourceMappingURL=autocomplete.utility.js.map