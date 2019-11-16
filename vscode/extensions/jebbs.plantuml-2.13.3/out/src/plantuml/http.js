"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const https = require("https");
const url = require("url");
const fs = require("fs");
const plantumlURL_1 = require("./plantumlURL");
const diagram_1 = require("./diagram/diagram");
exports.ERROR_405 = new Error("HTTP method POST is not supported by this URL");
function httpWrapper(method, server, diagram, format, index, savePath) {
    let requestPath, requestUrl;
    requestPath = [server, format, index, "..."].join("/");
    switch (method) {
        case "GET":
            requestUrl = plantumlURL_1.makePlantumlURL(server, diagram, format, index);
            break;
        case "POST":
            // "om80" is used to bypass the pagination bug of the POST method.
            // https://github.com/plantuml/plantuml-server/pull/74#issuecomment-551061156
            requestUrl = [server, format, index, "om80"].join("/");
            break;
        default:
            return Promise.reject("Unsupported request method: " + method);
    }
    let u = url.parse(requestUrl);
    let protocol = u.protocol == "http:" ? http : https;
    return new Promise((resolve, reject) => {
        let buffBody = [];
        let buffBodyLen = 0;
        let response;
        let httpError;
        let options = {
            protocol: u.protocol,
            auth: u.auth,
            host: u.host,
            hostname: u.hostname,
            port: parseInt(u.port),
            path: u.path,
            method: method,
        };
        let req = protocol.request(options, function (res) {
            // console.log('STATUS: ' + res.statusCode);
            // console.log('HEADERS: ' + JSON.stringify(res.headers));
            response = res;
            // res.setEncoding('utf8');
            res.on('data', function (chunk) {
                buffBody.push(chunk);
                buffBodyLen += chunk.length;
            });
        });
        req.on('error', function (err) {
            httpError = err;
        });
        req.on('close', () => {
            if (httpError) {
                reject(httpError);
                return;
            }
            let body = Buffer.concat(buffBody, buffBodyLen);
            if (response.statusCode === 200) {
                if (savePath) {
                    if (body.length) {
                        fs.writeFileSync(savePath, body);
                        body = Buffer.from(savePath);
                    }
                    else {
                        body = Buffer.from("");
                    }
                }
            }
            else if (response.headers['x-plantuml-diagram-error']) {
                httpError = parsePlantumlError(response.headers['x-plantuml-diagram-error'], parseInt(response.headers['x-plantuml-diagram-error-line']), response.headers['x-plantuml-diagram-description'], diagram);
            }
            else if (response.statusCode === 405) {
                reject(exports.ERROR_405);
                return;
            }
            else {
                httpError = response.statusCode + " " + response.statusMessage + "\n\n" +
                    method + " " + requestPath;
            }
            if (httpError) {
                reject({ error: httpError, out: body });
                return;
            }
            resolve(body);
        });
        if (method == "POST") {
            req.write(diagram.contentWithInclude);
        }
        req.end();
    });
}
exports.httpWrapper = httpWrapper;
function parsePlantumlError(error, line, description, diagram) {
    if (diagram_1.diagramStartReg.test(diagram.lines[0]))
        line += 1;
    let fileLine = line;
    let blankLineCount = 0;
    for (let i = 1; i < diagram.lines.length; i++) {
        if (diagram.lines[i].trim())
            break;
        blankLineCount++;
    }
    fileLine += blankLineCount;
    let lineContent = diagram.lines[fileLine - 1];
    fileLine += diagram.start.line;
    return `${error} (@ Diagram Line ${line}, File Line ${fileLine})\n"${lineContent}"\n${description}\n`;
}
//# sourceMappingURL=http.js.map