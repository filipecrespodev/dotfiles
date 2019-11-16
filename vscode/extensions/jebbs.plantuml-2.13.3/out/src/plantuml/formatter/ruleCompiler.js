"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multiRegExp2_1 = require("./multiRegExp2");
const rules_1 = require("./rules");
function compile(rules, regVars) {
    let compiled = new rules_1.Rules([], [], []);
    compiled.includes = rules.includes;
    if (rules.rules)
        compiled.rules = compileBlockRules(rules.rules);
    if (rules.blocks)
        compiled.blocks = compileBlocks(rules.blocks);
    return compiled;
    function compileBlocks(blocks) {
        let compiled = [];
        for (let b of blocks) {
            let c = {
                name: b.name,
                rules: compileBlockRules(b.rules)
            };
            compiled.push(c);
        }
        return compiled;
    }
    function compileBlockRules(rules) {
        let compiled = [];
        for (let r of rules) {
            let c = {};
            c.comment = r.comment ? r.comment : "";
            c.isBlock = r.isBlock ? true : false;
            if (r.begin)
                c.begin = compileRegExp(r.begin);
            if (r.again)
                c.again = compileRegExp(r.again);
            if (r.end)
                c.end = compileRegExp(r.end);
            if (r.match)
                c.match = compileRegExp(r.match);
            if (r.captures)
                c.captures = compileCaptures(r.captures);
            if (r.beginCaptures)
                c.beginCaptures = compileCaptures(r.beginCaptures);
            if (r.againCaptures)
                c.againCaptures = compileCaptures(r.againCaptures);
            if (r.endCaptures)
                c.endCaptures = compileCaptures(r.endCaptures);
            if (r.patterns) {
                c.patterns = {};
                if (r.patterns.includes)
                    c.patterns.includes = r.patterns.includes;
                if (r.patterns.type)
                    c.patterns.type = r.patterns.type;
                if (r.patterns.rules)
                    c.patterns.rules = compileBlockRules(r.patterns.rules);
            }
            compiled.push(c);
        }
        return compiled;
    }
    function compileRegExp(reg) {
        let str = reg.source.replace(/\{\{(\w+)\}\}/g, "${regVars.$1}");
        str = str.replace(/\\/g, "\\\\");
        str = eval("`" + str + "`");
        let flags = "";
        flags += reg.ignoreCase ? "i" : "";
        flags += "g";
        let r = new multiRegExp2_1.MultiRegExp2(new RegExp(str, flags));
        return r;
    }
    function compileCaptures(captures) {
        let compiled = [];
        let properties = Object.getOwnPropertyNames(captures);
        for (let i = 0; i < properties.length; i++) {
            let c = {
                index: Number(properties[i]),
                type: captures[properties[i]]
            };
            compiled.push(c);
        }
        return compiled;
    }
}
exports.compile = compile;
//# sourceMappingURL=ruleCompiler.js.map