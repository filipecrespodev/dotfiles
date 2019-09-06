"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const title = require("./title");
const type_1 = require("./type");
exports.diagramStartReg = /@start(\w+)/i;
exports.diagramEndReg = /@end(\w+)/i;
class Diagram {
    constructor(content, ...para) {
        this.pageCount = 1;
        this.index = 0;
        this.type = type_1.DiagramType.UML;
        this.content = content;
        this.lines = content.replace(/\r/g, "").split('\n');
        this.type = type_1.getType(this);
        if (para && para.length == 3) {
            this.document = para[0];
            this.start = para[1];
            this.end = para[2];
            this.parentUri = this.document.uri;
            this.path = this.document.uri.fsPath;
            this.fileName = path.basename(this.path);
            let i = this.fileName.lastIndexOf(".");
            if (i >= 0)
                this.fileName = this.fileName.substr(0, i);
            this.dir = path.dirname(this.path);
            if (!path.isAbsolute(this.dir))
                this.dir = "";
            this.getIndex();
        }
        this.getPageCount();
        this.getTitle();
    }
    isEqual(d) {
        if (this.parentUri.scheme !== d.parentUri.scheme)
            return false;
        if (this.dir !== d.dir)
            return false;
        if (this.fileName !== d.fileName)
            return false;
        if (!this.start || !d.start)
            return false;
        if (!this.start.isEqual(d.start))
            return false;
        return true;
    }
    getPageCount() {
        let regNewPage = /^\s*newpage\b/i;
        for (let text of this.lines) {
            if (regNewPage.test(text))
                this.pageCount++;
        }
    }
    getTitle() {
        let RegFName = /@start(\w+)\s+(.+?)\s*$/i;
        let matches;
        ;
        if (matches = this.lines[0].match(RegFName)) {
            this.titleRaw = matches[2];
            this.title = title.Deal(this.titleRaw);
            return;
        }
        let inlineTitle = /^\s*title\s+(.+?)\s*$/i;
        let multLineTitle = /^\s*title\s*$/i;
        for (let text of this.lines) {
            if (inlineTitle.test(text)) {
                let matches = text.match(inlineTitle);
                this.titleRaw = matches[1];
            }
        }
        if (this.titleRaw) {
            this.title = title.Deal(this.titleRaw);
        }
        else if (this.start && this.end) {
            // this.title = `${this.fileName}@${this.start.line + 1}-${this.end.line + 1}`;
            if (this.index)
                this.title = `${this.fileName}-${this.index}`;
            else
                this.title = this.fileName;
        }
        else {
            this.title = "";
        }
    }
    getIndex() {
        for (let i = 0; i < this.start.line; i++) {
            if (exports.diagramStartReg.test(this.document.lineAt(i).text))
                this.index++;
        }
    }
}
exports.Diagram = Diagram;
//# sourceMappingURL=diagram.js.map