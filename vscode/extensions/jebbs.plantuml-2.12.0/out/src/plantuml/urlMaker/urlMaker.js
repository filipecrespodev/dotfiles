"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const plantumlServer_1 = require("../renders/plantumlServer");
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
    return {
        name: diagram.title,
        urls: [...Array(diagram.pageCount).keys()].map(index => plantumlServer_1.plantumlServer.makeURL(diagram, format, index))
    };
}
exports.MakeDiagramURL = MakeDiagramURL;
//# sourceMappingURL=urlMaker.js.map