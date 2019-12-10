"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const common_1 = require("../common");
const tools_1 = require("../tools");
const httpWrapper_1 = require("./httpWrapper");
let noPOSTServers = {};
class PlantumlServer {
    /**
     * Indicates the exporter should limt concurrency or not.
     * @returns boolean
     */
    limitConcurrency() {
        return false;
    }
    /**
     * formats return an string array of formats that the exporter supports.
     * @returns an array of supported formats
     */
    formats() {
        return [
            "png",
            "svg",
            "txt"
        ];
    }
    /**
     * export a diagram to file or to Buffer.
     * @param diagram The diagram to export.
     * @param format format of export file.
     * @param savePath if savePath is given, it exports to a file, or, to Buffer.
     * @returns ExportTask.
     */
    render(diagram, format, savePath) {
        let server = config_1.config.server;
        if (!server) {
            return {
                processes: [],
                promise: Promise.reject(common_1.localize(53, null)),
            };
        }
        let allPms = [...Array(diagram.pageCount).keys()].map((index) => {
            let savePath2 = savePath ? tools_1.addFileIndex(savePath, index, diagram.pageCount) : "";
            if (noPOSTServers[server]) {
                // Servers like the official one doesn't support POST
                return httpWrapper_1.httpWrapper("GET", server, diagram, format, index, savePath2);
            }
            else {
                return httpWrapper_1.httpWrapper("POST", server, diagram, format, index, savePath2)
                    .catch(err => {
                    if (err === httpWrapper_1.ERROR_405) {
                        // do not retry POST again with this server
                        noPOSTServers[server] = true;
                        // fallback to GET
                        return httpWrapper_1.httpWrapper("GET", server, diagram, format, index, savePath2);
                    }
                    return Promise.reject(err);
                });
            }
        }, Promise.resolve(Buffer.alloc(0)));
        return {
            processes: [],
            promise: Promise.all(allPms),
        };
    }
    getMapData(diagram, savePath) {
        return this.render(diagram, "map", savePath);
    }
}
exports.plantumlServer = new PlantumlServer();
//# sourceMappingURL=plantumlServer.js.map