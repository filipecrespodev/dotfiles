"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exportDiagram_1 = require("./exportDiagram");
const appliedRender_1 = require("./appliedRender");
/**
 * export diagram to buffer
 * @param diagram the diagram to export.
 * @param format format of export file.
 * @param bar display prcessing message in bar if it's given.
 * @returns ExportTask.
 */
function exportToBuffer(diagram, format, bar) {
    return exportDiagram_1.exportDiagram(diagram, format, "", bar);
}
exports.exportToBuffer = exportToBuffer;
/**
 * export diagram to buffer
 * @param diagram the diagram to export.
 * @param format format of export file.
 * @param bar display prcessing message in bar if it's given.
 * @returns ExportTask.
 */
function getMapData(diagram) {
    return appliedRender_1.appliedRender().getMapData(diagram, "");
}
exports.getMapData = getMapData;
//# sourceMappingURL=exportToBuffer.js.map