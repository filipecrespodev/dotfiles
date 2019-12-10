"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const matchPositions_1 = require("./matchPositions");
var ElementType;
(function (ElementType) {
    ElementType[ElementType["none"] = 0] = "none";
    ElementType[ElementType["word"] = 1] = "word";
    ElementType[ElementType["operater"] = 2] = "operater";
    ElementType[ElementType["punctRightSpace"] = 3] = "punctRightSpace";
    ElementType[ElementType["punctLeftSpace"] = 4] = "punctLeftSpace";
    ElementType[ElementType["connector"] = 5] = "connector";
    ElementType[ElementType["asIs"] = 6] = "asIs";
})(ElementType = exports.ElementType || (exports.ElementType = {}));
var BlockElementType;
(function (BlockElementType) {
    BlockElementType[BlockElementType["blockStart"] = 0] = "blockStart";
    BlockElementType[BlockElementType["blockAgain"] = 1] = "blockAgain";
    BlockElementType[BlockElementType["blockEnd"] = 2] = "blockEnd";
})(BlockElementType = exports.BlockElementType || (exports.BlockElementType = {}));
class Position {
    constructor(line, position, match) {
        this.line = line;
        this.position = position;
        this._match = match;
    }
    get positionAtMatchLeft() {
        let pos = new Position(this.line, this.position - this._match.length, "");
        return pos;
    }
    get positionAtMatchRight() {
        let pos = new Position(this.line, this.position + this._match.length, "");
        return pos;
    }
}
class Analyst {
    constructor(lines, rules, keepBlankElement) {
        this._blockLevel = [];
        this._keepBlankElement = false;
        this._lines = lines.map(v => {
            return {
                text: v,
                matchPositions: new matchPositions_1.MatchPositions(v),
                elements: [],
                blockElements: []
            };
        });
        this._rules = rules;
        this._keepBlankElement = keepBlankElement;
    }
    get lines() {
        return this._lines;
    }
    analysis() {
        this.match(this._rules.rootRules);
        this._lines.map(v => this.makeLineElements(v));
    }
    makeLineElements(line) {
        if (line.elements.length)
            line.elements.sort((a, b) => a.start - b.start);
        let pos = 0;
        let els = [];
        for (let e of line.elements) {
            let elText = line.text.substring(pos, e.start);
            if (e.start > pos && (this._keepBlankElement || elText.trim()))
                els.push({
                    type: ElementType.none,
                    text: elText,
                    start: pos,
                    end: e.start - 1
                });
            pos = e.end + 1;
        }
        let elText = line.text.substring(pos, line.text.length);
        if (pos < line.text.length && (this._keepBlankElement || elText.trim())) {
            els.push({
                type: ElementType.none,
                text: elText,
                start: pos,
                end: line.text.length - 1
            });
        }
        line.elements.push(...els);
        if (line.elements.length)
            line.elements.sort((a, b) => a.start - b.start);
    }
    match(rules, start, stopRule) {
        let matchStartPos = new Position(0, 0, "");
        let blockEndPos;
        if (start)
            matchStartPos = start.positionAtMatchRight;
        let blockStartPos;
        for (let rule of rules) {
            //test match    
            if (rule.match) {
                this.doMatch(rule, matchStartPos, stopRule);
            }
            //test block in
            else if (rule.begin && rule.end) {
                let blockIndex = 0;
                while (blockStartPos = this.doBeginMatch(rule, matchStartPos, stopRule, ++blockIndex)) {
                    // return if find stop
                    blockEndPos = this.doEndMatch(rule, matchStartPos.positionAtMatchRight, blockIndex);
                    if (blockEndPos)
                        this.markElementsInBlock(rule.patterns.type ? rule.patterns.type : ElementType.none, blockStartPos.positionAtMatchRight, blockEndPos.positionAtMatchLeft);
                }
            }
        }
        return blockEndPos;
    }
    doMatch(rule, start, stopRule) {
        if (!rule.match)
            return;
        for (let i = 0; i < this._lines.length; i++) {
            if (start && start.line > i)
                continue;
            let line = this._lines[i];
            for (let u of line.matchPositions.GetUnmatchedTexts()) {
                if (start && start.line == i && start.position > u.offset + u.text.length - 1)
                    continue;
                if (!u.text.trim())
                    continue;
                // console.log("test", u.text, "with", patt.regExp.source);
                let matches = [];
                let shouldEndAt = u.text.length;
                let hasEnd = false;
                if (stopRule) {
                    stopRule.end.regExp.lastIndex = 0;
                    if (matches = stopRule.end.exec(u)) {
                        // console.log("stop:", rule.comment, "by:", matches[0].match, "at", i, ":", matches[0].start + u.offset - 1);
                        shouldEndAt = matches[0].start;
                        hasEnd = true;
                    }
                }
                rule.match.regExp.lastIndex = 0;
                while (matches = rule.match.exec(u)) {
                    //in-block match should not reach the end sign, or it's a invalid match
                    if (matches[0].end < shouldEndAt) {
                        // console.log("TEST", u.text, "MATCH", matches[0].match, "WITH", rule.match.regExp.source);
                        this.markElement(line, matches, rule.captures, u.offset);
                    }
                }
                // return if find stop
                if (hasEnd)
                    return;
            }
        }
    }
    doBeginMatch(rule, start, stopRule, blockIndex) {
        if (!rule.begin || !rule.end)
            return;
        let beginAt;
        let hasFindBegin = false;
        for (let i = start ? start.line : 0; i < this._lines.length; i++) {
            let line = this._lines[i];
            for (let u of line.matchPositions.GetUnmatchedTexts()) {
                rule.begin.regExp.lastIndex = 0;
                if (rule.again)
                    rule.again.regExp.lastIndex = 0;
                rule.end.regExp.lastIndex = 0;
                if (start && start.line == i && start.position > u.offset + u.text.length - 1)
                    continue;
                if (!u.text.trim())
                    continue;
                let matches = [];
                let shouldEndAt = u.text.length;
                let hasEnd = false;
                let endMatch = "";
                if (stopRule) {
                    stopRule.end.regExp.lastIndex = 0;
                    if (matches = stopRule.end.exec(u)) {
                        // console.log("stop:", rule.comment, "by:", matches[0].match, "at", i, ":", matches[0].start + u.offset - 1);
                        shouldEndAt = matches[0].start;
                        hasEnd = true;
                        endMatch = matches[0].capture;
                    }
                }
                //find begin
                if (matches = rule.begin.exec(u)) {
                    //in-block match should not reach the end sign, or it's a invalid match
                    if (matches[0].end < shouldEndAt) {
                        hasFindBegin = true;
                        beginAt = new Position(i, matches[0].start + u.offset, matches[0].capture);
                        this._blockLevel.push(rule.comment);
                        // console.log("ENTER BLOCK LEVEL", this._blockLevel, "INDEX", blockIndex, "OF", rule.comment, "BY", matches[0].capture, "AT", beginAt.line, beginAt.position);
                        this.markElement(line, matches, rule.beginCaptures, u.offset);
                        this.markBlockElement(line, rule, BlockElementType.blockStart, this._blockLevel, blockIndex, matches, u.offset);
                        let blockRules = this._rules.getPatternRules(rule.patterns);
                        //current rule must be the first to match the sub block
                        if (blockRules.length) {
                            blockRules.unshift(rule);
                            let lastEnd;
                            while (lastEnd = this.match(blockRules, beginAt, rule)) {
                                if (lastEnd)
                                    beginAt = lastEnd;
                            }
                        }
                    }
                    // if (stopRule) return this.doEndMatch(stopRule, beginAt.positionAtMatchRight);
                }
                //find again
                if (rule.comment === this._blockLevel[this._blockLevel.length - 1] && !beginAt && rule.again) {
                    if (matches = rule.again.exec(u)) {
                        this.markElement(line, matches, rule.beginCaptures, u.offset);
                        this.markBlockElement(line, rule, BlockElementType.blockAgain, this._blockLevel, blockIndex, matches, u.offset);
                        // console.log("FIND AGAIN", "OF LEVEL", this._blockLevel, "INDEX", blockIndex, "BY", matches[0].capture, "AT", i, matches[0].start + u.offset)
                    }
                }
                if (hasEnd || hasFindBegin)
                    return beginAt;
            }
        }
        return beginAt;
    }
    doEndMatch(rule, start, blockIndex) {
        if (!rule || !rule.begin || !rule.end)
            return start;
        for (let i = start ? start.line : 0; i < this._lines.length; i++) {
            let line = this._lines[i];
            for (let u of line.matchPositions.GetUnmatchedTexts()) {
                rule.end.regExp.lastIndex = 0;
                if (start && start.line == i && start.position > u.offset + u.text.length - 1)
                    continue;
                // console.log("test rule", u.text, "with", rule.comment);
                let matches = [];
                if (matches = rule.end.exec(u)) {
                    this.markElement(line, matches, rule.endCaptures, u.offset);
                    this.markBlockElement(line, rule, BlockElementType.blockEnd, this._blockLevel, blockIndex, matches, u.offset);
                    // console.log("Find end:", matches[0].match, "at", i, ":", matches[0].start + u.offset - 1);
                    let endAt = new Position(i, matches[0].start + u.offset, matches[0].capture);
                    this._blockLevel.pop();
                    // console.log("LEAVE BLOCK LEVEL", this._blockLevel + 1, "INDEX", blockIndex, "FROM", rule.comment, "BY", matches[0].capture, "AT", endAt.line, endAt.position);
                    return endAt;
                }
            }
        }
        // console.log("WARNING: LEAVE BLOCK LEVEL", this._blockLevel--, "FROM", rule.comment, "DUE TO EOF.");
    }
    markElement(line, matches, captures, offset) {
        // console.log(matches[0].match);
        let mp = new matchPositions_1.MatchPositions(matches[0].capture);
        let startOffset = -matches[0].start;
        line.matchPositions.AddPosition(matches[0].start, matches[0].end, offset);
        if (captures) {
            for (let capture of captures) {
                if (matches[capture.index] && matches[capture.index].capture) {
                    line.elements.push({
                        type: capture.type,
                        text: matches[capture.index].capture,
                        start: matches[capture.index].start + offset,
                        end: matches[capture.index].end + offset,
                    });
                    mp.AddPosition(matches[capture.index].start, matches[capture.index].end, startOffset);
                }
            }
        }
        for (let u of mp.GetUnmatchedTexts()) {
            if (u.text.trim())
                line.elements.push({
                    type: ElementType.none,
                    text: u.text,
                    start: u.offset - startOffset + offset,
                    end: u.text.length - 1 + u.offset - startOffset + offset,
                });
        }
    }
    markElementsInBlock(type, start, end) {
        // console.log("markElementsInBlock, from", start.line + ":" + start.position, "to", end.line + ":" + end.position);
        for (let i = start ? start.line : 0; i <= end.line; i++) {
            let line = this._lines[i];
            for (let u of line.matchPositions.GetUnmatchedTexts()) {
                if (start && start.line == i && start.position > u.offset + u.text.length - 1)
                    continue;
                if (end && end.line == i && end.position < u.offset + u.text.length - 1)
                    continue;
                // console.log("test rule", u.text, "with", rule.comment);
                if (type != ElementType.asIs && !u.text.trim())
                    continue;
                line.matchPositions.AddPosition(0, u.text.length - 1, u.offset);
                line.elements.push({
                    type: type,
                    text: u.text,
                    start: u.offset,
                    end: u.text.length - 1 + u.offset
                });
            }
        }
    }
    markBlockElement(line, rule, type, blockLevel, blockIndex, matches, offset) {
        if (!rule.isBlock)
            return;
        line.blockElements.push({
            level: blockLevel.length - 1,
            index: blockIndex,
            type: type,
            text: matches[0].capture,
            start: matches[0].start + offset,
            end: matches[0].end + offset,
        });
    }
}
exports.Analyst = Analyst;
//# sourceMappingURL=analyst.js.map