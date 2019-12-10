"use strict";
// export class IncludeRouteNode {
//     identifier: string;
//     file: string;
//     sub: string;
//     children: IncludeRouteNode[] = [];
//     constructor(file: string, sub?: string) {
//         this.identifier = sub ? `${file}!${sub}` : file;
//         this.file = file;
//         this.sub = sub;
//     }
//     appendChild(file: string, sub?: string): IncludeRouteNode {
//         let node = new IncludeRouteNode(file, sub);
//         this.children.push(node);
//         return node;
//     }
// }
Object.defineProperty(exports, "__esModule", { value: true });
function NewIncludeNode(file, sub, parent) {
    return {
        identifier: getIncludeNodeIdentifier(file, sub),
        file: file,
        sub: sub,
        parent: parent,
        children: [],
    };
}
exports.NewIncludeNode = NewIncludeNode;
function getIncludeNodeIdentifier(file, sub) {
    return sub ? `${file}!${sub}` : file;
}
exports.getIncludeNodeIdentifier = getIncludeNodeIdentifier;
//# sourceMappingURL=includeNode.js.map