"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
exports.escapeRegExp = escapeRegExp;
/**
 * Check whether text is a variable.
 */
function isVar(text) {
    return /^ *?\$[\w-]+:[\w\-%"']*/.test(text);
}
exports.isVar = isVar;
/**
 * Check whether text is a *
 */
function isStar(text) {
    return /^ *?\*/.test(text);
}
exports.isStar = isStar;
/**
 * Check whether text is class, id or placeholder
 */
function isClassOrId(text) {
    return /^ *[#\.%]/.test(text);
}
exports.isClassOrId = isClassOrId;
/**
 * Check whether text is a property
 */
function isProperty(text, empty) {
    if (empty) {
        return !/^ *[\w\-]+: *\S+/.test(text);
    }
    return /^ *[\w\-]+:/.test(text);
}
exports.isProperty = isProperty;
/**
 * Check whether text is a include
 */
function isInclude(text) {
    return /^ *@include/.test(text);
}
exports.isInclude = isInclude;
/**
 * Check whether text is a keyframe
 */
function isKeyframes(text) {
    return /^ *@keyframes/.test(text);
}
exports.isKeyframes = isKeyframes;
/**
 * Check whether text is a mixin
 */
function isMixin(text) {
    return /^ *@mixin/.test(text);
}
exports.isMixin = isMixin;
/**
 * Check whether text is a each
 */
function isEach(text) {
    return /^ *@each/.test(text);
}
exports.isEach = isEach;
/**
 * Check whether text starts with &
 */
function isAnd(text) {
    return /^ *&/.test(text);
}
exports.isAnd = isAnd;
/**
 * Check whether text is at rule
 */
function isAtRule(text) {
    return /^ *@/.test(text);
}
exports.isAtRule = isAtRule;
/**
 * Check whether text is bracket selector
 */
function isBracketSelector(text) {
    return /^ *\[[\w=\-*"' ]*\]/.test(text);
}
exports.isBracketSelector = isBracketSelector;
/**
 * checks if text last char is a number
 * @param {String} text
 * @return {CompletionItem}
 */
function isNumber(text) {
    const reg = /[0-9]$/;
    return reg.test(text) && !text.includes('#');
}
exports.isNumber = isNumber;
/**
 * Check whether text starts with an html tag.
 */
function isHtmlTag(text) {
    let isTag = false;
    if (/^ *(a|abbr|address|area|article|aside|audio|b|base|bdi|bdo|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|data|datalist|dd|del|details|dfn|dialog|div|dl|dt|em|embed|fieldset|figure|footer|form|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|main|map|mark|menu|menuitem|meta|meter|nav|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rb|rp|rt|rtc|ruby|s|samp|script|section|select|small|source|span|strong|style|sub|summary|sup|svg|table|tbody|td|template|textarea|tfoot|th|thead|time|title|tr|track|u|ul|var|video|wbr)(:|::|,|\.|#)[:$#{}()\w\-\[\]='",\.# ]*$/.test(text)) {
        isTag = true;
    }
    return isTag;
}
exports.isHtmlTag = isHtmlTag;
/**
 * Check whether text starts with a self closing html tag.
 */
function isVoidHtmlTag(text) {
    let isTag = false;
    if (/^ *(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr|command|keygen|menuitem)(:|::|,|\.|#)[:$#{}()\w\-\[\]='",\.# ]*$/.test(text)) {
        isTag = true;
    }
    return isTag;
}
exports.isVoidHtmlTag = isVoidHtmlTag;
/**
 * Check whether text starts with ::.
 */
function isPseudo(text) {
    return /^ *::?/.test(text);
}
exports.isPseudo = isPseudo;
/**
 * Check whether text starts with @if.
 */
function isIfOrElse(text) {
    return /^ *@if|^ *@else/.test(text);
}
exports.isIfOrElse = isIfOrElse;
/**
 * Check whether text starts with @else.
 */
function isElse(text) {
    return /^ *@else/.test(text);
}
exports.isElse = isElse;
/**
 * Check whether text starts with //R.
 */
function isReset(text) {
    return /^ *\/?\/\/ *R *$/.test(text);
}
exports.isReset = isReset;
/**
 * Check whether text starts with //I.
 */
function isIgnore(text) {
    return /^ *\/?\/\/ *I *$/.test(text);
}
exports.isIgnore = isIgnore;
/**
 * Check whether text starts with //S.
 */
function isSassSpace(text) {
    return /^ *\/?\/\/ *S *$/.test(text);
}
exports.isSassSpace = isSassSpace;
/**
 *
 */
function isPath(text) {
    return /^.*['"]\.?[\.\/]$/.test(text);
}
exports.isPath = isPath;
/**
 *
 */
function isScssOrCss(text, wasLastLineCss = false) {
    if (wasLastLineCss && text.endsWith(',') && isClassOrId(text)) {
        return true;
    }
    // comments get handled somewhere else.
    return /[;\{\}] *(\/\/.*)?$/.test(text);
}
exports.isScssOrCss = isScssOrCss;
/**
 *
 */
function isCssPseudo(text) {
    return /^ *[&.#%].*:/.test(text);
}
exports.isCssPseudo = isCssPseudo;
/**
 *
 */
function isCssOneLiner(text) {
    return /^ *[&.#%][\w-]*(?!#)\{.*[;\}]$/.test(text);
}
exports.isCssOneLiner = isCssOneLiner;
/**
 *
 */
function isPseudoWithParenthesis(text) {
    return /^ *::?[\w\-]+\(.*\)/.test(text);
}
exports.isPseudoWithParenthesis = isPseudoWithParenthesis;
/**
 *
 */
function isComment(text) {
    return /^ *\/\/|^ *\/\*/.test(text);
}
exports.isComment = isComment;
/**
 *
 */
function isBlockCommentStart(text) {
    return /^ *(\/\*)/.test(text);
}
exports.isBlockCommentStart = isBlockCommentStart;
/**
 *
 */
function isBlockCommentEnd(text) {
    return / *\*\/|(?=^[a-zA-Z0-9#.%$@\\[=*+])/.test(text);
}
exports.isBlockCommentEnd = isBlockCommentEnd;
/**
 *
 */
function isMoreThanOneClassOrId(text) {
    return /^ *[\.#%].* ?, *[\.#%].*/.test(text);
}
exports.isMoreThanOneClassOrId = isMoreThanOneClassOrId;
/**
 *
 */
function hasColor(text) {
    return /^.*#[a-fA-F\d]{3,4}\b|^.*#[a-fA-F\d]{6}\b|^.*#[a-fA-F\d]{8}\b|rgba?\([\d. ]+,[\d. ]+,[\d. ]+(,[\d. ]+)?\)/.test(text);
}
exports.hasColor = hasColor;
//# sourceMappingURL=utility.regex.js.map