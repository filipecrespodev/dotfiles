"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const diagram_1 = require("./diagram");
var DiagramType;
(function (DiagramType) {
    DiagramType[DiagramType["UML"] = 0] = "UML";
    DiagramType[DiagramType["Ditaa"] = 1] = "Ditaa";
    DiagramType[DiagramType["Dot"] = 2] = "Dot";
    DiagramType[DiagramType["Gantt"] = 3] = "Gantt";
    DiagramType[DiagramType["Salt"] = 4] = "Salt";
})(DiagramType = exports.DiagramType || (exports.DiagramType = {}));
function getType(diagram) {
    let lineOne = undefined;
    let lineTwo = undefined;
    let match;
    let type = undefined;
    if (match = diagram_1.diagramStartReg.exec(diagram.lines[0])) {
        lineOne = diagram.lines[0];
        lineTwo = diagram.lines[1];
        switch (match[1].toLocaleLowerCase()) {
            case "uml":
                type = DiagramType.UML;
                break;
            case "ditaa":
                type = DiagramType.Ditaa;
                break;
            case "dot":
                type = DiagramType.Dot;
                break;
            case "gantt":
                type = DiagramType.Gantt;
                break;
            case "salt":
                type = DiagramType.Salt;
                break;
            default:
                type = DiagramType.UML;
        }
    }
    else {
        lineOne = undefined;
        lineTwo = diagram.lines[0];
    }
    if (type === DiagramType.UML) {
        if (/^\s*salt\s*/i.test(lineTwo))
            type = DiagramType.Salt;
        else if (/^\s*ditaa/i.test(lineTwo))
            type = DiagramType.Ditaa;
        else if (/^\s*digraph\s+[0-9a-z_]+\s*\{\s*/i.test(lineTwo))
            type = DiagramType.Dot;
    }
    return type;
}
exports.getType = getType;
//# sourceMappingURL=type.js.map