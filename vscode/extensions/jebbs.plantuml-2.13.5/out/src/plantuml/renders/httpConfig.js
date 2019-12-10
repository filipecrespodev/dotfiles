"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configReader_1 = require("../configReader");
class HttpConfig extends configReader_1.ConfigReader {
    constructor() {
        super('http');
    }
    onChange() { }
    proxy() {
        return this.read('proxy');
    }
}
exports.httpConfig = new HttpConfig();
//# sourceMappingURL=httpConfig.js.map