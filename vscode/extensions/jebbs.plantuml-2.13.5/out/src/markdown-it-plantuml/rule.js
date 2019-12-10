"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function plantumlWorker(state) {
    // debugInfo(state.tokens);
    let blockTokens = state.tokens;
    for (let blockToken of blockTokens) {
        if (blockToken.type == "fence" && blockToken.info.startsWith("plantuml")) {
            blockToken.type = "plantuml";
            // always render as <img> for maximum compatibility:
            // https://github.com/qjebbs/vscode-markdown-extended/issues/67#issuecomment-554996262
            blockToken.tag = "img";
            // if (state.env && state.env.htmlExporter) { // work with markdown extended export, solve #253
            //     blockToken.tag = "object";
            // } else {
            //     blockToken.tag = "img";
            // }
        }
    }
}
exports.plantumlWorker = plantumlWorker;
function debugInfo(blockTokens) {
    for (let blockToken of blockTokens) {
        console.log(blockToken.type, blockToken.info, blockToken.tag, blockToken.content);
        if (!blockToken.children)
            continue;
        for (let token of blockToken.children) {
            console.log("children:", token.type, token.info, token.tag, token.content);
        }
    }
}
//# sourceMappingURL=rule.js.map