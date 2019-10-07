"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const config_1 = require("../config");
const common_1 = require("../common");
const tools_1 = require("../tools");
const appliedRender_1 = require("./appliedRender");
const exportDiagram_1 = require("./exportDiagram");
/**
 *  export diagram to file.
 * @param diagrams The diagrams array to export.
 * @param format format of export file.
 * @param bar if bar is given, exporting diagram name shown.
 * @returns Promise<Buffer[][]>. A promise of Buffer[digrams][pages] array
 */
function exportDiagrams(diagrams, format, bar) {
    if (appliedRender_1.appliedRender().limitConcurrency()) {
        let concurrency = config_1.config.exportConcurrency;
        return doExportsLimited(diagrams, format, concurrency, bar);
    }
    else {
        return doExportsUnLimited(diagrams, format, bar);
    }
}
exports.exportDiagrams = exportDiagrams;
/**
 * export diagrams to file.
 * @param diagrams The diagrams array to export.
 * @param format format of export file.
 * @param bar if bar is given, exporting diagram name shown.
 * @returns Promise<Buffer[][]>. A promise of Buffer[digrams][pages] array
 */
function doExportsUnLimited(diagrams, format, bar) {
    let errors = [];
    let promises = diagrams.map((diagram, index) => {
        if (!path.isAbsolute(diagram.dir))
            return Promise.reject(common_1.localize(1, null));
        let savePath = tools_1.calculateExportPath(diagram, format.split(":")[0]);
        tools_1.mkdirsSync(path.dirname(savePath));
        return exportDiagram_1.exportDiagram(diagram, format, savePath, bar).promise.then(r => r, err => {
            errors.push(...tools_1.parseError(err));
            return [];
        });
    });
    return new Promise((resolve, reject) => {
        Promise.all(promises).then(r => {
            if (errors.length)
                reject(errors);
            else
                resolve(r);
        }, e => {
            errors.push(...tools_1.parseError(e));
            reject(errors);
        });
    });
}
/**
 * export diagrams to file.
 * @param diagrams The diagrams array to export.
 * @param format format of export file.
 * @param concurrency concurrentcy count only applied when base exporter cliams to limit concurrentcy.
 * @param bar if bar is given, exporting diagram name shown.
 * @returns Promise<Buffer[][]>. A promise of Buffer[digrams][pages] array
 */
function doExportsLimited(diagrams, format, concurrency, bar) {
    concurrency = concurrency > 0 ? concurrency : 1;
    concurrency = concurrency > diagrams.length ? diagrams.length : concurrency;
    let promises = [];
    let errors = [];
    for (let i = 0; i < concurrency; i++) {
        //each i starts a task chain, which export indexes like 0,3,6,9... (task 1, concurrency 3 for example.)
        promises.push(diagrams.reduce((prev, diagram, index) => {
            if (index % concurrency != i) {
                // ignore indexes belongs to other task chain
                return prev;
            }
            if (!path.isAbsolute(diagram.dir))
                return Promise.reject(common_1.localize(1, null));
            let savePath = tools_1.calculateExportPath(diagram, format.split(":")[0]);
            tools_1.mkdirsSync(path.dirname(savePath));
            return prev.then(() => {
                return exportDiagram_1.exportDiagram(diagram, format, savePath, bar).promise;
            }, err => {
                errors.push(...tools_1.parseError(err));
                // return Promise.reject(err);
                //continue next diagram
                return exportDiagram_1.exportDiagram(diagram, format, savePath, bar).promise;
            });
        }, Promise.resolve([])).then(
        //to push last error of a chain
        r => {
            return r;
        }, err => {
            errors.push(...tools_1.parseError(err));
            return [];
        }));
    }
    let all = Promise.all(promises);
    return new Promise((resolve, reject) => {
        all.then(r => {
            if (errors.length)
                reject(errors);
            else
                resolve(r);
        });
    });
}
//# sourceMappingURL=exportDiagrams.js.map