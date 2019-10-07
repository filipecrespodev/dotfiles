"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zongmin Lei <leizongmin@gmail.com> All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
function isDirExists(file) {
    return new Promise((resolve, reject) => {
        fs.stat(file, (err, stats) => {
            if (err) {
                return resolve(false);
            }
            resolve(stats.isDirectory());
        });
    });
}
function getAllParentNodeModulesDir(dir) {
    const dirs = [path.resolve(dir, "node_modules")];
    while (true) {
        const parent = path.dirname(dir);
        if (parent === dir) {
            break;
        }
        dirs.push(path.resolve(parent, "node_modules"));
        dir = parent;
    }
    return dirs;
}
function resolvePackage(name, dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const dirs = getAllParentNodeModulesDir(dir);
        for (const item of dirs) {
            const p = path.resolve(item, name);
            if (yield isDirExists(p)) {
                return p;
            }
        }
        const err = new Error(`cannot find module "${name} in ${dir}"`);
        err.code = "MODULE_NOT_FOUND";
        throw err;
    });
}
exports.default = resolvePackage;
//# sourceMappingURL=resolve.js.map