"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const includeNode_1 = require("./includeNode");
class IncludeRoute {
    constructor(...args) {
        this.allNodes = {};
        if (typeof args[0] != "string") {
            this.rootNode = args[0];
            return;
        }
        let file = args[0];
        let sub = args.length > 1 ? args[1] : undefined;
        this.rootNode = includeNode_1.NewIncludeNode(file, sub);
    }
    appendNode(parent, ...args) {
        let node;
        if (typeof args[0] != "string") {
            node = args[0];
            return;
        }
        let file = args[0];
        let sub = args.length > 1 ? args[1] : undefined;
        node = includeNode_1.NewIncludeNode(file, sub, parent);
        this.loopDetect(node);
        parent.children.push(node);
        this.allNodes[node.identifier] = node;
        return node;
    }
    loopDetect(node) {
        if (!this.allNodes[node.identifier])
            return;
        // include loop detected
        let route = [node];
        let loopPoint = undefined;
        let parent = this.allNodes[node.identifier];
        do {
            route.push(parent);
            if (loopPoint === undefined && parent.identifier == node.identifier) {
                loopPoint = route.length - 1;
            }
        } while (parent.parent);
        let lines = [];
        lines.push("Error: Include loop detected.", "");
        for (let i = 0; i < loopPoint; i++) {
            lines.push(route[i].identifier);
        }
        lines.push("-> " + route[loopPoint].identifier);
        for (let i = loopPoint + 1; i < route.length - 2; i++) {
            lines.push("|  " + route[i].identifier);
        }
        lines.push("<- " + route[route.length - 1].identifier);
        console.log(lines.join('\n'));
    }
}
exports.IncludeRoute = IncludeRoute;
//# sourceMappingURL=includeRoute.js.map