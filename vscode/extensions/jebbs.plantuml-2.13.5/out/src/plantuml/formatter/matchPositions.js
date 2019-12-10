"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MatchPositions {
    constructor(line) {
        this._positions = [];
        this._line = line;
    }
    get Raw() {
        return this._positions;
    }
    get LineText() {
        return this._line;
    }
    AddPosition(start, end, offset) {
        offset = offset ? offset : 0;
        this._positions.push(...[start + offset, end + offset]);
        this._positions.sort((a, b) => a - b);
    }
    GetUnmatchedTexts() {
        let posCount = this._positions.length;
        if (!posCount)
            return [{
                    text: this._line,
                    offset: 0,
                    original: this._line,
                }];
        let texts = [];
        if (this._positions[0] > 0) {
            texts.push({
                text: this._line.substring(0, this._positions[0]),
                offset: 0,
                original: this._line,
            });
        }
        for (let i = 1; i < posCount - 1; i += 2) {
            let s = this._positions[i] + 1;
            let e = this._positions[i + 1] - 1;
            if (s <= e)
                texts.push({
                    text: this._line.substring(s, e + 1),
                    offset: s,
                    original: this._line,
                });
        }
        if (this._positions[posCount - 1] < this._line.length - 1) {
            texts.push({
                text: this._line.substring(this._positions[posCount - 1] + 1, this._line.length),
                offset: this._positions[posCount - 1] + 1,
                original: this._line,
            });
        }
        return texts;
    }
}
exports.MatchPositions = MatchPositions;
//# sourceMappingURL=matchPositions.js.map