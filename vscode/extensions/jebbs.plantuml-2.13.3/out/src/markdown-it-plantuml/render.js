"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const diagram_1 = require("../plantuml/diagram/diagram");
const type_1 = require("../plantuml/diagram/type");
const urlMaker_1 = require("../plantuml/urlMaker/urlMaker");
const config_1 = require("../plantuml/config");
const common_1 = require("../plantuml/common");
function renderHtml(tokens, idx) {
    // console.log("request html for:", idx, tokens[idx].content);
    let token = tokens[idx];
    if (token.type !== "plantuml")
        return tokens[idx].content;
    let diagram = new diagram_1.Diagram(token.content);
    // Ditaa only supports png
    let format = diagram.type == type_1.DiagramType.Ditaa ? "png" : "svg";
    let mimeType = diagram.type == type_1.DiagramType.Ditaa ? "image/png" : "image/svg+xml";
    let result = urlMaker_1.MakeDiagramURL(diagram, format, null);
    let renderAsObject = token.tag == "object" && format == "svg";
    return config_1.config.server ?
        result.urls.reduce((p, url) => {
            p += renderAsObject ?
                `\n<object type="${mimeType}" data="${url}"></object>` : // work with markdown extended export, solve #253
                `\n<img style="background-color:#FFF;" src="${url}">`; // work with preview, solve #258
            return p;
        }, "") :
        `\n<pre><code><code>⚠️${common_1.localize(53, null)}\n\n${diagram.content}</code></code></pre>`;
}
exports.renderHtml = renderHtml;
//# sourceMappingURL=render.js.map