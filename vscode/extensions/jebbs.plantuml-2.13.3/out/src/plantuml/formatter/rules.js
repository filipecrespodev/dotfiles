"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Rules {
    constructor(includes, blocks, rules) {
        this.includes = includes;
        this.blocks = blocks;
        this.rules = rules;
    }
    get rootRules() {
        let rs = [];
        rs.push(...this.rules);
        rs.push(...this.getBlockRules(this.includes));
        return rs;
    }
    getPatternRules(patt) {
        if (!patt)
            return [];
        let rs = this.getBlockRules(patt.includes);
        if (patt.rules)
            rs.push(...patt.rules);
        return rs;
    }
    getBlockRules(blockNames) {
        if (!blockNames || !blockNames.length)
            return [];
        let rs = [];
        for (let inc of blockNames) {
            if (inc == "*") {
                for (let block of this.blocks) {
                    rs.push(...block.rules);
                }
                return rs;
            }
        }
        for (let inc of blockNames) {
            for (let block of this.blocks) {
                if (block.name == inc) {
                    rs.push(...block.rules);
                    break;
                }
            }
        }
        return rs;
    }
}
exports.Rules = Rules;
//# sourceMappingURL=rules.js.map