"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_regex_1 = require("../../utility/utility.regex");
const cssSchema = require("../../autocomplete/schemas/autocomplete.cssSchema");
const autocomplete_utility_1 = require("../../autocomplete/autocomplete.utility");
class SassHoverProvider {
    constructor() { }
    provideHover(document, position, token) {
        const line = document.lineAt(position.line);
        const currentWord = SassHoverProvider._GET_CURRENT_WORD(line, position);
        if (utility_regex_1.isProperty(line.text)) {
            const propData = autocomplete_utility_1.AutocompleteUtilities.findPropertySchema(cssSchema, currentWord.replace(/:/g, ''));
            if (propData) {
                return {
                    contents: [
                        `\`\`\`sass\n${SassHoverProvider.capitalizeFirstLetter(propData.name)} (css property)\n\`\`\``,
                        `${propData.desc !== undefined ? propData.desc : ''}`,
                        `${SassHoverProvider._GET_PROPERTY_VALUES(propData.values)}`
                    ]
                };
            }
            else {
                return { contents: [] };
            }
        }
        return {
            contents: []
        };
    }
    static _GET_CURRENT_WORD(line, position) {
        let firstHalfArr = [];
        for (let i = position.character - 1; i > 0; i--) {
            const char = line.text[i];
            if (char === ' ') {
                if (i <= position.character) {
                    break;
                }
                else {
                    firstHalfArr = [];
                }
            }
            else {
                firstHalfArr.unshift(char);
            }
        }
        let firstHalf = firstHalfArr.join('');
        let secondHalf = '';
        for (let i = position.character; i < line.text.length; i++) {
            const char = line.text[i];
            if (char === ' ') {
                if (i >= position.character) {
                    break;
                }
                else {
                    secondHalf = '';
                }
            }
            else {
                secondHalf = secondHalf + char;
            }
        }
        return firstHalf + secondHalf;
    }
    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
    static _GET_PROPERTY_VALUES(values) {
        if (values === undefined) {
            return '';
        }
        else {
            let text = '**Values**';
            for (let i = 0; i < values.length; i++) {
                const value = values[i];
                text = text.concat('\n* ', value.name !== undefined ? '**`' + value.name + '`**' : '', value.desc !== undefined ? ' *' + value.desc + '*' : '');
            }
            return text;
        }
    }
}
exports.SassHoverProvider = SassHoverProvider;
//# sourceMappingURL=hover.provider.js.map