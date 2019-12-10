"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const config_1 = require("../config");
const plantumlURL_1 = require("../plantumlURL");
function MakeDiagramsURL(diagrams, format, bar) {
    return diagrams.map((diagram) => {
        return MakeDiagramURL(diagram, format, bar);
    });
}
exports.MakeDiagramsURL = MakeDiagramsURL;
function MakeDiagramURL(diagram, format, bar) {
    if (bar) {
        bar.show();
        bar.text = common_1.localize(16, null, diagram.title);
    }
    let server = config_1.config.server;
    return {
        name: diagram.title,
        urls: [...Array(diagram.pageCount).keys()].map(index => plantumlURL_1.makePlantumlURL(server, diagram, format, index))
    };
}
exports.MakeDiagramURL = MakeDiagramURL;
//# sourceMappingURL=urlMaker.js.map