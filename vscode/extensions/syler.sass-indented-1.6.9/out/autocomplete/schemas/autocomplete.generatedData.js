"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const autocomplete_data_dataProps_1 = require("./generatedData/autocomplete.data.dataProps");
const vscode_1 = require("vscode");
const utilityFunctions_1 = require("../../utilityFunctions");
exports.generatedData = mapProps();
function mapProps() {
    const items = [];
    for (const key in autocomplete_data_dataProps_1.dataProps) {
        if (autocomplete_data_dataProps_1.dataProps.hasOwnProperty(key)) {
            const prop = autocomplete_data_dataProps_1.dataProps[key];
            const item = new vscode_1.CompletionItem(key, vscode_1.CompletionItemKind.Property);
            item.insertText = key.concat(': ');
            item.tags = prop.status === 'obsolete' ? [1] : [];
            item.documentation = utilityFunctions_1.GetPropertyDescription(key, prop);
            items.push(item);
        }
    }
    return items;
}
//# sourceMappingURL=autocomplete.generatedData.js.map