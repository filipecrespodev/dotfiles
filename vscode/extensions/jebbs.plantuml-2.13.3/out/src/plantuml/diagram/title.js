"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regs = [
    // trim and remove Creole in head
    { find: /\s*[\*#=\|]*\s*(.+?)\s*$/mg, replace: '$1' },
    // \t to space
    // { find: /(?<!\\)\\t/, replace: ' ' },
    { find: /([^\\])\\[tn]/g, replace: '$1' },
    // \\ to \
    { find: /\\\\/g, replace: '\\' },
    // *=|
    { find: /\|(\s*[\*#=\|]*)?\s*/g, replace: ' ' },
    // |$
    { find: /\|\s*$/g, replace: '' },
    // \text\
    { find: /\*{2}(.+)\*{2}/g, replace: '$1' },
    // __text__
    { find: /_{2}(.+)_{2}/g, replace: '$1' },
    // //text//
    { find: /\/{2}(.+)\/{2}/g, replace: '$1' },
    // ""text""
    { find: /"{2}(.+)"{2}/g, replace: '$1' },
    // --text--
    { find: /-{2}(.+)-{2}/g, replace: '$1' },
    // ~~text~~
    { find: /~{2}(.+)~{2}/g, replace: '$1' },
    // remove invalid chrs
    { find: /[\\/:*?"<>|]/g, replace: ' ' }
];
function Deal(value) {
    let title = value;
    for (let rp of regs) {
        title = title.replace(rp.find, rp.replace).trim();
    }
    return title;
}
exports.Deal = Deal;
//# sourceMappingURL=title.js.map