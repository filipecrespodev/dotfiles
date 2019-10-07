"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class ColorUtilities {
    constructor() { }
    /**
     * **assumes that the input is valid**
     */
    static convertStringToColor(text) {
        if (text.startsWith('#')) {
            return convertHexStringToColor(text);
        }
        else if (text.startsWith('rgb')) {
            return convertRgbStringToColor(text);
        }
    }
    static convertColorToString(color, type) {
        switch (type) {
            case 'hex':
                const alpha = Math.round(color.alpha * 255).toString(16);
                const red = Math.round(color.red * 255).toString(16);
                const green = Math.round(color.green * 255).toString(16);
                const blue = Math.round(color.blue * 255).toString(16);
                return `#${(red.length === 1 ? red.concat(red) : red)
                    .concat(green.length === 1 ? green.concat(green) : green)
                    .concat(blue.length === 1 ? blue.concat(blue) : blue)
                    .concat(color.alpha === 1 ? '' : alpha.length === 1 ? alpha.concat(alpha) : alpha)}`;
            case 'rgb':
                return `rgb${color.alpha === 1 ? '' : 'a'}(${Math.round(color.red * 255)}, ${Math.round(color.green * 255)}, ${Math.round(color.blue * 255)}${color.alpha === 1 ? '' : ', '.concat(color.alpha.toString())})`;
        }
    }
}
exports.ColorUtilities = ColorUtilities;
function convertHexStringToColor(text) {
    let color = { red: 0, green: 0, blue: 0, alpha: 0 };
    const raw = text.replace('#', '');
    const length = raw.length;
    const modulo = length % 3;
    color.red = length > 4 ? parseInt(raw.substring(0, 2), 16) : parseInt(raw.substring(0, 1).concat(raw.substring(0, 1)), 16);
    color.green = length > 4 ? parseInt(raw.substring(2, 4), 16) : parseInt(raw.substring(1, 2).concat(raw.substring(1, 2)), 16);
    color.blue = length > 4 ? parseInt(raw.substring(4, 6), 16) : parseInt(raw.substring(2, 3).concat(raw.substring(2, 3)), 16);
    if (modulo) {
        color.alpha =
            length > 4
                ? parseInt(raw.substring(length - modulo, length), 16)
                : parseInt(raw.substring(length - modulo, length).concat(raw.substring(length - modulo, length)), 16);
    }
    else {
        color.alpha = 1;
    }
    return new vscode_1.Color(color.red / 255, color.green / 255, color.blue / 255, color.alpha / 255);
}
function convertRgbStringToColor(text) {
    const split = text.split(',');
    return new vscode_1.Color(parseInt(split[0].replace(/\D/g, '')) / 255, parseInt(split[1].replace(/\D/g, '')) / 255, parseInt(split[2].replace(/\D/g, '')) / 255, split[3] ? parseFloat(split[3].replace(/[^\.\d]/g, '')) : 1);
}
//# sourceMappingURL=color.utils.js.map