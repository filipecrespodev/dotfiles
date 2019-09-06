"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const utility_regex_1 = require("../utility/utility.regex");
const format_utility_1 = require("./format.utility");
const utility_1 = require("../utility/utility");
class FormattingProvider {
    constructor(context) {
        this.context = context;
    }
    provideDocumentFormattingEdits(document, options) {
        const config = vscode_1.workspace.getConfiguration('sass.format');
        if (config.get('enabled') === true) {
            let enableDebug = config.get('debug');
            if (enableDebug) {
                console.log('FORMAT');
            }
            let result = [];
            let tabs = 0;
            let currentTabs = 0;
            let keyframes_tabs = 0;
            let keyframes_is = false;
            let AllowSpace = false;
            let convert_additionalTabs = 0;
            let convert_lastSelector = '';
            let convert = false;
            let convert_wasLastLineCss = false;
            let isInBlockComment = false;
            let ignoreLine = false;
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                if (ignoreLine) {
                    ignoreLine = false;
                }
                else {
                    if (utility_regex_1.isIgnore(line.text)) {
                        ignoreLine = true;
                    }
                    else {
                        const keyframes_isPointCheck = format_utility_1.isKeyframePoint(line.text, keyframes_is);
                        if (keyframes_is && keyframes_isPointCheck) {
                            tabs = Math.max(0, keyframes_tabs);
                        }
                        const isKeyframesCheck = utility_regex_1.isKeyframes(line.text);
                        let isIfOrElse_ = utility_regex_1.isIfOrElse(line.text);
                        let keyframes_isIfOrElseAProp = false;
                        if (keyframes_is && isIfOrElse_) {
                            isIfOrElse_ = false;
                            keyframes_isIfOrElseAProp = true;
                            tabs = keyframes_tabs + options.tabSize;
                        }
                        if (isIfOrElse_ && !keyframes_is && utility_regex_1.isElse(line.text)) {
                            keyframes_isIfOrElseAProp = true;
                            isIfOrElse_ = false;
                            tabs = Math.max(0, currentTabs - options.tabSize);
                        }
                        convert_additionalTabs = 0;
                        convert = false;
                        const ResetTabs = utility_regex_1.isReset(line.text);
                        const isAnd_ = utility_regex_1.isAnd(line.text);
                        const isProp = utility_regex_1.isProperty(line.text);
                        const indentation = format_utility_1.getIndentationOffset(line.text, tabs);
                        const isClassOrIdSelector = utility_regex_1.isClassOrId(line.text);
                        if (utility_regex_1.isSassSpace(line.text)) {
                            AllowSpace = true;
                        }
                        if (utility_regex_1.isBlockCommentStart(line.text)) {
                            isInBlockComment = true;
                        }
                        if (utility_regex_1.isBlockCommentEnd(line.text)) {
                            isInBlockComment = false;
                        }
                        if (!isInBlockComment) {
                            //####### Block Header #######
                            if (isClassOrIdSelector ||
                                utility_regex_1.isMixin(line.text) ||
                                utility_regex_1.isHtmlTag(line.text.trim().split(' ')[0]) ||
                                utility_regex_1.isStar(line.text) ||
                                isIfOrElse_ ||
                                ResetTabs ||
                                isAnd_ ||
                                utility_regex_1.isBracketSelector(line.text) ||
                                utility_regex_1.isPseudo(line.text) ||
                                isKeyframesCheck ||
                                utility_regex_1.isEach(line.text)) {
                                const offset = format_utility_1.getCLassOrIdIndentationOffset(indentation.distance, options.tabSize, currentTabs, ResetTabs);
                                keyframes_is = isKeyframesCheck || keyframes_isPointCheck;
                                AllowSpace = false;
                                let lineText = line.text;
                                if (config.get('convert') && utility_regex_1.isScssOrCss(line.text, convert_wasLastLineCss) && !utility_regex_1.isComment(line.text)) {
                                    const convert_Res = format_utility_1.convertScssOrCss(lineText, options.tabSize, convert_lastSelector, enableDebug);
                                    convert_lastSelector = convert_Res.lastSelector;
                                    if (convert_Res.increaseTabSize) {
                                        convert_additionalTabs = options.tabSize;
                                    }
                                    lineText = convert_Res.text;
                                    convert = true;
                                }
                                if (!convert && isClassOrIdSelector) {
                                    convert_lastSelector = '';
                                }
                                if (offset !== 0) {
                                    if (enableDebug) {
                                        console.log('NEW TAB', i + 1, 'CONVERT', convert);
                                    }
                                    result.push(new vscode_1.TextEdit(line.range, format_utility_1.replaceWithOffset(lineText, offset).trimRight()));
                                }
                                else if (utility_1.getDistanceReversed(line.text) > 0 && config.get('deleteWhitespace')) {
                                    if (enableDebug) {
                                        console.log('TRAIL', i + 1, 'CONVERT', convert);
                                    }
                                    result.push(new vscode_1.TextEdit(line.range, lineText.trimRight()));
                                }
                                else if (convert) {
                                    if (enableDebug) {
                                        console.log('CONVERT', i + 1);
                                    }
                                    result.push(new vscode_1.TextEdit(line.range, lineText));
                                }
                                //§ set Tabs
                                if (isKeyframesCheck) {
                                    keyframes_tabs = Math.max(0, indentation.distance + offset + options.tabSize);
                                }
                                if (ResetTabs) {
                                    tabs = Math.max(0, indentation.distance + offset);
                                    currentTabs = tabs;
                                }
                                else {
                                    tabs = Math.max(0, indentation.distance + offset + options.tabSize + convert_additionalTabs);
                                    currentTabs = tabs;
                                }
                            }
                            // ####### Properties #######
                            else if (isProp || utility_regex_1.isInclude(line.text) || keyframes_isPointCheck || keyframes_isIfOrElseAProp) {
                                let lineText = line.text;
                                let setSpace = false;
                                if (!utility_regex_1.isHtmlTag && !format_utility_1.hasPropertyValueSpace(line.text) && isProp && config.get('setPropertySpace')) {
                                    lineText = lineText.replace(/(^ *[\$\w-]+:) */, '$1 ');
                                    setSpace = true;
                                }
                                if (config.get('convert') && utility_regex_1.isScssOrCss(line.text, convert_wasLastLineCss) && !utility_regex_1.isComment(line.text)) {
                                    const convert_Res = format_utility_1.convertScssOrCss(lineText, options.tabSize, convert_lastSelector, enableDebug);
                                    lineText = convert_Res.text;
                                    convert = true;
                                }
                                if (indentation.offset !== 0 && !utility_regex_1.isComment(line.text)) {
                                    if (enableDebug) {
                                        console.log('MOVE', 'Offset:', indentation.offset, 'Row:', i + 1, 'space', setSpace, 'CONVERT', convert);
                                    }
                                    result.push(new vscode_1.TextEdit(line.range, format_utility_1.replaceWithOffset(lineText, indentation.offset).trimRight()));
                                }
                                else if (utility_1.getDistanceReversed(line.text) > 0 && config.get('deleteWhitespace')) {
                                    if (enableDebug) {
                                        console.log('TRAIL', i + 1, 'space', setSpace, 'CONVERT', convert);
                                    }
                                    result.push(new vscode_1.TextEdit(line.range, lineText.trimRight()));
                                }
                                else if (setSpace) {
                                    if (enableDebug) {
                                        console.log('SPACE', i + 1, 'CONVERT', convert);
                                    }
                                    result.push(new vscode_1.TextEdit(line.range, lineText));
                                }
                                else if (convert) {
                                    if (enableDebug) {
                                        console.log('CONVERT', i + 1, 'SET SPACE', setSpace);
                                    }
                                    result.push(new vscode_1.TextEdit(line.range, lineText));
                                }
                                // § set Tabs
                                if (keyframes_is && keyframes_isPointCheck) {
                                    tabs = Math.max(0, keyframes_tabs + options.tabSize);
                                }
                                if (keyframes_isIfOrElseAProp && keyframes_is) {
                                    tabs = keyframes_tabs + options.tabSize * 2;
                                }
                                else if (keyframes_isIfOrElseAProp && !keyframes_is) {
                                    tabs = currentTabs;
                                }
                            }
                            // ####### Convert #######
                            else if (config.get('convert') && utility_regex_1.isScssOrCss(line.text, convert_wasLastLineCss) && !utility_regex_1.isComment(line.text)) {
                                let lineText = line.text;
                                const convert_Res = format_utility_1.convertScssOrCss(lineText, options.tabSize, convert_lastSelector, enableDebug);
                                lineText = convert_Res.text;
                                convert = true;
                                if (enableDebug) {
                                    console.log('CONVERT', i + 1);
                                }
                                result.push(new vscode_1.TextEdit(line.range, lineText));
                            }
                            // ####### Empty Line #######
                            else if (line.isEmptyOrWhitespace) {
                                let pass = true;
                                if (document.lineCount - 1 > i) {
                                    const nextLine = document.lineAt(i + 1);
                                    const compact = config.get('deleteCompact') ? true : !utility_regex_1.isProperty(nextLine.text);
                                    if (config.get('deleteEmptyRows') &&
                                        !utility_regex_1.isClassOrId(nextLine.text) &&
                                        !utility_regex_1.isAtRule(nextLine.text) &&
                                        compact &&
                                        !utility_regex_1.isAnd(nextLine.text) &&
                                        !utility_regex_1.isHtmlTag(nextLine.text) &&
                                        !utility_regex_1.isStar(nextLine.text) &&
                                        !utility_regex_1.isBracketSelector(nextLine.text) &&
                                        !AllowSpace &&
                                        !utility_regex_1.isComment(nextLine.text) &&
                                        !utility_regex_1.isPseudo(nextLine.text)) {
                                        if (enableDebug) {
                                            console.log('DEL', i + 1);
                                        }
                                        pass = false;
                                        result.push(new vscode_1.TextEdit(new vscode_1.Range(line.range.start, nextLine.range.start), ''));
                                    }
                                }
                                if (line.text.length > 0 && pass && config.get('deleteWhitespace')) {
                                    if (enableDebug) {
                                        console.log('WHITESPACE', i + 1);
                                    }
                                    result.push(new vscode_1.TextEdit(line.range, ''));
                                }
                            }
                            else if (utility_1.getDistanceReversed(line.text) > 0 && config.get('deleteWhitespace')) {
                                let lineText = line.text;
                                if (config.get('convert') && utility_regex_1.isScssOrCss(line.text, convert_wasLastLineCss) && !utility_regex_1.isComment(line.text)) {
                                    const convert_Res = format_utility_1.convertScssOrCss(lineText, options.tabSize, convert_lastSelector, enableDebug);
                                    lineText = convert_Res.text;
                                    convert = true;
                                }
                                if (enableDebug) {
                                    console.log('TRAIL', i + 1, 'CONVERT', convert);
                                }
                                result.push(new vscode_1.TextEdit(line.range, lineText.trimRight()));
                            }
                        }
                        if (!line.isEmptyOrWhitespace) {
                            convert_wasLastLineCss = convert;
                        }
                    }
                }
            }
            return result;
        }
        else {
            return [];
        }
    }
}
exports.default = FormattingProvider;
//# sourceMappingURL=format.provider.js.map