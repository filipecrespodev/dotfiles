"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("../utility/utility");
const utility_regex_1 = require("../utility/utility.regex");
/**
 * returns the relative distance that the class or id should be at.
 */
function getCLassOrIdIndentationOffset(distance, tabSize, current, ignoreCurrent) {
    if (distance === 0) {
        return 0;
    }
    if (tabSize * Math.round(distance / tabSize - 0.1) > current && !ignoreCurrent) {
        return current - distance;
    }
    return tabSize * Math.round(distance / tabSize - 0.1) - distance;
}
exports.getCLassOrIdIndentationOffset = getCLassOrIdIndentationOffset;
/**
 * adds or removes whitespace based on the given offset, a positive value adds whitespace a negative value removes it.
 */
function replaceWithOffset(text, offset) {
    if (offset < 0) {
        text = text.replace(new RegExp(`^ {${Math.abs(offset)}}`), '');
    }
    else {
        let space = '';
        for (let i = 0; i < offset; i++) {
            space = space.concat(' ');
        }
        text = text.replace(/^/, space);
    }
    return text;
}
exports.replaceWithOffset = replaceWithOffset;
/**
 * returns the difference between the current indentation and the indentation of the given text.
 */
function getIndentationOffset(text, indentation) {
    let distance = utility_1.getDistance(text);
    return { offset: indentation - distance, distance };
}
exports.getIndentationOffset = getIndentationOffset;
/**
 *
 */
function isKeyframePoint(text, isAtKeyframe) {
    if (isAtKeyframe === false) {
        return false;
    }
    return /^ *\d+%/.test(text) || /^ *from|^ *to/.test(text);
}
exports.isKeyframePoint = isKeyframePoint;
/**
 * if the Property Value Space is none or more that one, this function returns false, else true;
 */
function hasPropertyValueSpace(text) {
    const split = text.split(':');
    return split[1] === undefined
        ? true
        : split[1][0] === undefined
            ? true
            : split[1].startsWith(' ')
                ? split[1][1] === undefined
                    ? true
                    : !split[1][1].startsWith(' ')
                : false;
}
exports.hasPropertyValueSpace = hasPropertyValueSpace;
/**
 * converts scss/css to sass.
 */
function convertScssOrCss(text, tabSize, lastSelector, enableDebug) {
    const isMultiple = utility_regex_1.isMoreThanOneClassOrId(text);
    console.log('TEXT', text);
    if (lastSelector && new RegExp('^.*' + utility_regex_1.escapeRegExp(lastSelector)).test(text)) {
        if (enableDebug) {
            console.log('+  LAST SELECTOR');
        }
        let newText = text.replace(lastSelector, '');
        if (utility_regex_1.isPseudoWithParenthesis(text)) {
            newText = newText.split('(')[0].trim() + '(&' + ')';
        }
        else if (text.trim().startsWith(lastSelector)) {
            newText = text.replace(lastSelector, '&');
        }
        else {
            newText = newText.replace(/ /g, '') + ' &';
        }
        return {
            lastSelector,
            increaseTabSize: true,
            text: replaceWithOffset(removeInvalidChars(newText).trimRight(), tabSize)
        };
    }
    else if (utility_regex_1.isCssOneLiner(text)) {
        if (enableDebug) {
            console.log('+  ONE LINER', text);
        }
        const split = text.split('{');
        return {
            increaseTabSize: false,
            lastSelector: split[0].trim(),
            text: removeInvalidChars(split[0].trim().concat('\n', replaceWithOffset(split[1].trim(), tabSize))).trimRight()
        };
    }
    else if (utility_regex_1.isCssPseudo(text) && !isMultiple) {
        if (enableDebug) {
            console.log('+  PSEUDO');
        }
        return {
            increaseTabSize: false,
            lastSelector,
            text: removeInvalidChars(text).trimRight()
        };
    }
    else if (utility_regex_1.isClassOrId(text)) {
        if (enableDebug) {
            console.log('+  CLASS OR ID');
        }
        lastSelector = removeInvalidChars(text).trimRight();
    }
    if (enableDebug) {
        console.log('+  DEFAULT');
    }
    return { text: removeInvalidChars(text).trimRight(), increaseTabSize: false, lastSelector };
}
exports.convertScssOrCss = convertScssOrCss;
function removeInvalidChars(text) {
    let newText = '';
    let isInQuotes = false;
    let isInComment = false;
    let isInVarSelector = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (!isInQuotes && char === '/' && text[i + 1] === '/') {
            isInComment = true;
        }
        else if (/['"]/.test(char)) {
            isInQuotes = !isInQuotes;
        }
        else if (/#/.test(char) && /{/.test(text[i + 1])) {
            isInVarSelector = true;
        }
        else if (isInVarSelector && /}/.test(text[i - 1])) {
            isInVarSelector = false;
        }
        if (!/[;\{\}]/.test(char) || isInQuotes || isInComment || isInVarSelector) {
            newText += char;
        }
    }
    return newText;
}
//# sourceMappingURL=format.utility.js.map