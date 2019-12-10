"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const config_1 = require("../config");
// http://plantuml.com/en/preprocessing
const INCLUDE_REG = /^\s*!(include(?:sub)?)\s+(.+?)(?:!(\w+))?$/i;
const STARTSUB_TEST_REG = /^\s*!startsub\s+(\w+)/i;
const ENDSUB_TEST_REG = /^\s*!endsub\b/i;
function getContentWithInclude(diagram) {
    let searchPaths = getSearchPaths(diagram.parentUri);
    return resolveInclude(diagram.lines, searchPaths);
}
exports.getContentWithInclude = getContentWithInclude;
function resolveInclude(content, searchPaths, included) {
    if (!included)
        included = {};
    let lines = content instanceof Array ? content : content.split('\n');
    let processedLines = lines.map(line => line.replace(INCLUDE_REG, (match, ...args) => {
        let Action = args[0].toLowerCase();
        let target = args[1].trim();
        let sub = args[2];
        let file = path.isAbsolute(target) ? target : findFile(target, searchPaths);
        let result;
        if (Action == "include") {
            result = getIncludeContent(file, included);
        }
        else {
            result = getIncludesubContent(file, sub, included);
        }
        return result === undefined ? match : result;
    }));
    return processedLines.join('\n');
}
function getSearchPaths(uri) {
    if (!uri)
        return [];
    let searchPaths = [path.dirname(uri.fsPath)];
    searchPaths.push(...config_1.config.includepaths(uri));
    let diagramsRoot = config_1.config.diagramsRoot(uri);
    if (diagramsRoot)
        searchPaths.push(diagramsRoot.fsPath);
    return Array.from(new Set(searchPaths));
}
function findFile(file, searchPaths) {
    let found;
    for (let dir of searchPaths) {
        found = path.join(dir, file);
        if (fs.existsSync(found))
            return found;
    }
    return undefined;
}
function getIncludeContent(file, included) {
    if (!file)
        return undefined;
    if (included[file]) {
        // console.log("ignore file already included:", file);
        return "";
    }
    let content = fs.readFileSync(file).toString();
    included[file] = true;
    return resolveInclude(content, getSearchPaths(vscode.Uri.file(file)), included);
}
function getIncludesubContent(file, sub, included) {
    if (!file || !sub)
        return undefined;
    // // FIXME: Disable sub block duplication check, to keep same behavior with PlantUML project
    // // Diabled: Cannot prevent potentially '!includesub' loop.
    // // Enabled: Cannot repeatedly including with `!includesub`, even it's not a loop.
    // let identifier = `${file}!${sub}`;
    // if (included[file]) {
    //     // console.log("ignore block already included:", file);
    //     return "";
    // }
    let blocks = getSubBlocks(file);
    if (!blocks)
        return undefined;
    // included[identifier] = true;
    return resolveInclude(blocks[sub], getSearchPaths(vscode.Uri.file(file)), included);
}
function getSubBlocks(file) {
    if (!file)
        return {};
    let blocks = {};
    let lines = fs.readFileSync(file).toString().split('\n');
    let subName = "";
    let match;
    for (let line of lines) {
        match = STARTSUB_TEST_REG.exec(line);
        if (match) {
            subName = match[1];
            continue;
        }
        else if (ENDSUB_TEST_REG.test(line)) {
            subName = "";
            continue;
        }
        else {
            if (subName) {
                if (!blocks[subName])
                    blocks[subName] = [];
                blocks[subName].push(line);
            }
        }
    }
    return blocks;
}
//# sourceMappingURL=include.js.map