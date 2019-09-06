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
const vscode = require("vscode");
const config_1 = require("../config");
const common_1 = require("../common");
const tools_1 = require("../tools");
const appliedRender_1 = require("./appliedRender");
const exportURI_1 = require("./exportURI");
/**
 * export diagrams of multiple vscode.Uris to file
 * @param files the uris to export.
 * @param format format of export file.
 * @param bar display prcessing message in bar if it's given.
 * @returns Promise<Buffer[][]>. A promise of exportURIsResult
 */
function exportFiles(files, bar) {
    return __awaiter(this, void 0, void 0, function* () {
        if (appliedRender_1.appliedRender().limitConcurrency()) {
            let concurrency = config_1.config.exportConcurrency;
            return exportFilesLimited(files, concurrency, bar);
        }
        else {
            return exportFilesUnLimited(files, bar);
        }
    });
}
exports.exportFiles = exportFiles;
function exportFilesLimited(files, concurrency, bar) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!files.length) {
            vscode.window.showInformationMessage(common_1.localize(8, null));
            return;
        }
        let errors = [];
        let results = [];
        let promiseChain = files.reduce((prev, file, index) => {
            return prev.then(result => {
                if (result && result.length)
                    results.push(result);
                return exportURI_1.exportFile(file, bar);
            }, errs => {
                errors.push(...tools_1.parseError(common_1.localize(11, null, errs.length, files[index - 1].uri.fsPath)));
                errors.push(...tools_1.parseError(errs));
                // continue next file
                return exportURI_1.exportFile(file, bar);
            });
        }, Promise.resolve([]));
        return new Promise((resolve, reject) => {
            promiseChain.then(result => {
                if (result && result.length)
                    results.push(result);
                resolve({ results: results, errors: errors });
            }, errs => {
                errors.push(...tools_1.parseError(common_1.localize(11, null, errs.length, files[files.length - 1].uri.fsPath)));
                errors.push(...tools_1.parseError(errs));
                resolve({ results: results, errors: errors });
            });
        });
    });
}
function exportFilesUnLimited(files, bar) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!files.length) {
            vscode.window.showInformationMessage(common_1.localize(8, null));
            return;
        }
        let errors = [];
        let results = [];
        let promises = files.map((file, index) => exportURI_1.exportFile(file, bar).then(result => {
            if (result && result.length)
                results.push(result);
        }, errs => {
            errors.push(...tools_1.parseError(common_1.localize(11, null, errs.length, files[index].uri.fsPath)));
            errors.push(...tools_1.parseError(errs));
        }));
        return new Promise((resolve, reject) => {
            Promise.all(promises).then(() => resolve({ results: results, errors: errors }), () => resolve({ results: results, errors: errors }));
        });
    });
}
//# sourceMappingURL=exportURIs.js.map