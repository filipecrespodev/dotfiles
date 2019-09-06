"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * returns the distance between the beginning and the first char that is not the checkAgainstChar in form of a number.
 * @param checkAgainstChar defaults to `' '` should always be only one char.
 */
function getDistance(text, checkAgainstChar = ' ') {
    let count = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char !== checkAgainstChar) {
            break;
        }
        count++;
    }
    return count;
}
exports.getDistance = getDistance;
/**
 * returns the distance between the end and the first char that is not the checkAgainstChar in form of a number.
 * @param checkAgainstChar defaults to `' '` should always be only one char.
 */
function getDistanceReversed(text, checkAgainstChar = ' ') {
    let count = 0;
    for (let i = text.length - 1; i > 0; i--) {
        const char = text[i];
        if (char !== checkAgainstChar) {
            break;
        }
        count++;
    }
    return count;
}
exports.getDistanceReversed = getDistanceReversed;
/**
 *
 */
function splitOnce(text, splitter) {
    const split = text.split(splitter);
    const key = split.shift();
    return { body: (split.length > 0 ? splitter : '') + split.join(splitter), key };
}
exports.splitOnce = splitOnce;
//# sourceMappingURL=utility.js.map