"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zongmin Lei <leizongmin@gmail.com> All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const provider_1 = require("./provider");
function activate(context) {
    const provider = new provider_1.default();
    provider.activate(context);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map