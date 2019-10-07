"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const urlDocument_1 = require("../plantuml/urlMaker/urlDocument");
class CommandURLCurrent extends common_1.Command {
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield urlDocument_1.makeDocumentURL(false);
        });
    }
    constructor() {
        super("plantuml.URLCurrent");
    }
}
exports.CommandURLCurrent = CommandURLCurrent;
//# sourceMappingURL=urlCurrent.js.map