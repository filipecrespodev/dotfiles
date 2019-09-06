"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const appliedRender_1 = require("./appliedRender");
const path = require("path");
const config_1 = require("../config");
/**
 * export a diagram to file or to Buffer.
 * @param diagram The diagram to export.
 * @param format format of export file.
 * @param savePath if savePath is given, it exports to a file, or, to Buffer.
 * @param bar display prcessing message in bar if it's given.
 * @returns ExportTask.
 */
function exportDiagram(diagram, format, savePath, bar) {
    if (bar) {
        bar.show();
        bar.text = common_1.localize(7, null, diagram.title + "." + format.split(":")[0]);
    }
    let renderTask = appliedRender_1.appliedRender().render(diagram, format, savePath);
    if (!config_1.config.exportMapFile(diagram.parentUri) || !savePath)
        return renderTask;
    let bsName = path.basename(savePath);
    let ext = path.extname(savePath);
    let cmapx = path.join(path.dirname(savePath), bsName.substr(0, bsName.length - ext.length) + ".cmapx");
    let mapTask = appliedRender_1.appliedRender().getMapData(diagram, cmapx);
    return combine(renderTask, mapTask);
}
exports.exportDiagram = exportDiagram;
function combine(taskA, taskB) {
    let processes = [];
    processes.push(...taskA.processes, ...taskB.processes);
    let pms = new Promise((resolve, reject) => {
        Promise.all([taskA.promise, taskB.promise]).then(results => {
            let buffs = [];
            buffs = buffs.concat(...results);
            resolve(buffs);
        }, error => {
            reject(error);
        });
    });
    return {
        processes: processes,
        promise: pms,
        canceled: false
    };
}
//# sourceMappingURL=exportDiagram.js.map