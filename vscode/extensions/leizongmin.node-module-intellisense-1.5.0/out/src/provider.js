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
const vscode = require("vscode");
const vscode_1 = require("vscode");
const resolve_1 = require("./resolve");
class IntellisenseProvider {
    constructor() {
        this.dependencies = [];
        this.packageJsonFile = this.resolveWorkspacePath("package.json");
        this.enableDevDependencies = true;
        this.enableFileModules = true;
        this.modulePaths = [];
        this.enableBuiltinModules = true;
        this.autoStripExtensions = IntellisenseProvider.defaultAutoStripExtensions;
        this.disposables = [];
    }
    activate(context) {
        this.context = context;
        context.subscriptions.push(this);
        // load configuration
        const loadConfig = () => {
            this.config = vscode.workspace.getConfiguration(IntellisenseProvider.configPath);
            this.enableBuiltinModules = this.config.get("scanBuiltinModules", true);
            this.enableDevDependencies = this.config.get("scanDevDependencies", true);
            this.enableFileModules = this.config.get("scanFileModules", true);
            this.modulePaths = this.config.get("modulePaths", []);
            this.autoStripExtensions = this.config.get("autoStripExtensions", IntellisenseProvider.defaultAutoStripExtensions);
            this.autoStripExtensions.sort((a, b) => b.length - a.length);
            // this.debug(this.autoStripExtensions);
        };
        vscode.workspace.onDidChangeConfiguration((e) => {
            loadConfig();
            // this.debug("reload config", this.config);
        });
        loadConfig();
        // this.debug("load config", this.config);
        // create completion provider
        vscode.languages.registerCompletionItemProvider(IntellisenseProvider.languageSelector, this, ...IntellisenseProvider.triggerCharacters);
        // this.debug("activate");
        // this.debug("builtinModules", IntellisenseProvider.builtinModules);
        // load dependencies from package.json file
        this.updateDependenciesFromPackageJson();
        // watching package.json and auto update dependencies info
        this.packageJsonWatcher = vscode.workspace.createFileSystemWatcher("**/package.json");
        this.disposables.push(this.packageJsonWatcher);
        const onPackageJsonFileChange = (e) => {
            // this.debug("workspace file change:", e);
            if (e.fsPath === this.packageJsonFile) {
                this.updateDependenciesFromPackageJson();
            }
        };
        this.packageJsonWatcher.onDidChange(onPackageJsonFileChange);
        this.packageJsonWatcher.onDidCreate(onPackageJsonFileChange);
        this.packageJsonWatcher.onDidDelete(onPackageJsonFileChange);
    }
    dispose() {
        // this.debug("dispose");
        this.disposables.forEach((item) => {
            try {
                item.dispose();
            }
            catch (err) {
                // this.debug("dispose", err);
            }
        });
    }
    /**
     * Provide completion items for the given position and document.
     *
     * @param document The document in which the command was invoked.
     * @param position The position at which the command was invoked.
     * @param token A cancellation token.
     * @return An array of completions, a [completion list](#CompletionList), or a thenable that resolves to either.
     * The lack of a result can be signaled by returning `undefined`, `null`, or an empty array.
     */
    provideCompletionItems(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = parseLine(document, position);
            if (!info) {
                return [];
            }
            // this.debug("provideCompletionItems: parseLine", position, info);
            let list = [];
            const isShowPackageSubPath = info.isPackagePath && info.search.indexOf("/") > 0;
            const isShowPackage = info.isPackagePath || info.search === "";
            const isShowFile = info.isAbsoultePath || info.isRelativePath || info.search === "";
            const isIncludeExtname = info.type === "reference";
            if (isShowPackageSubPath) {
                // package sub path
                let pkgDir;
                try {
                    pkgDir = yield resolvePackageDirectory(info.packageName, document.uri.fsPath);
                    const currentDir = path.resolve(pkgDir, info.packageSubPath);
                    const files = yield this.readCurrentDirectory(currentDir, info.search, false);
                    // fix insertText
                    files.forEach((item) => {
                        item.insertText = item.label.slice(info.search.length);
                    });
                    list = list.concat(files);
                }
                catch (err) {
                    this.debug("resolvePackageDirectory", err);
                }
            }
            else {
                // builtin modules
                if (isShowPackage && this.enableBuiltinModules) {
                    list = IntellisenseProvider.builtinModules.map((name) => {
                        return createCompletionItem(name, vscode_1.CompletionItemKind.Module, { detail: "builtin module" });
                    });
                }
                // packages npm dependencies
                if (isShowPackage) {
                    list = list.concat(this.dependencies.map((name) => {
                        return createCompletionItem(name, vscode_1.CompletionItemKind.Module, { detail: "npm dependencies" });
                    }));
                }
            }
            // packages from relative path
            if (isShowFile && this.enableFileModules) {
                const currentDir = path.resolve(path.dirname(document.uri.fsPath), info.search);
                const files = yield this.readCurrentDirectory(currentDir, info.search || "./", isIncludeExtname);
                // fix insertText
                files.forEach((item) => {
                    item.insertText = item.label.slice(info.search.length);
                });
                list = list.concat(files);
            }
            // packages from relative path
            if (this.modulePaths.length > 0) {
                for (const modulePath of this.modulePaths) {
                    const currentDir = this.resolveWorkspacePath(modulePath.replace("${workspaceRoot}", ""), info.search || "");
                    const files = yield this.readCurrentDirectory(currentDir, info.search || "", isIncludeExtname);
                    // fix insertText
                    files.forEach((item) => {
                        item.insertText = item.label.slice(info.search.length);
                    });
                    list = list.concat(files);
                }
            }
            // this.debug("provideCompletionItems", list);
            return list;
        });
    }
    /**
     * Given a completion item fill in more data, like [doc-comment](#CompletionItem.documentation)
     * or [details](#CompletionItem.detail).
     *
     * The editor will only resolve a completion item once.
     *
     * @param item A completion item currently active in the UI.
     * @param token A cancellation token.
     * @return The resolved completion item or a thenable that resolves to of such. It is OK to return the given
     * `item`. When no result is returned, the given `item` will be used.
     */
    resolveCompletionItem(item, token) {
        // this.debug("resolveCompletionItem", item);
        return item;
    }
    debug(...data) {
        // tslint:disable-next-line:no-console
        console.log("IntellisenseProvider debug:", ...data);
    }
    showWarning(msg) {
        vscode.window.showWarningMessage(`node-module-intellisense: ${msg}`);
    }
    resolveWorkspacePath(...paths) {
        if (vscode.workspace.rootPath) {
            return path.resolve(vscode.workspace.rootPath, ...paths);
        }
        return path.resolve(...paths);
    }
    updateDependenciesFromPackageJson() {
        return __awaiter(this, void 0, void 0, function* () {
            // check if file exists
            const exists = yield isFileExists(this.packageJsonFile);
            if (!exists) {
                // this.debug("package.json file not exists");
                return;
            }
            // get file content
            let data;
            try {
                data = (yield readFileContent(this.packageJsonFile)).toString();
            }
            catch (err) {
                return this.showWarning(err.message);
            }
            // parse JSON file
            let json;
            try {
                json = JSON.parse(data.toString());
            }
            catch (err) {
                return this.showWarning(`parsing package.json file error: ${err.message}`);
            }
            // get dependencies
            const list = new Set();
            if (json.dependencies) {
                Object.keys(json.dependencies).forEach((name) => list.add(name));
            }
            if (this.enableDevDependencies && json.devDependencies) {
                Object.keys(json.devDependencies).forEach((name) => list.add(name));
            }
            this.dependencies = Array.from(list.values());
            // this.debug("load dependencies from package.json:", this.dependencies);
        });
    }
    readCurrentDirectory(dir, prefix, isIncludeExtname) {
        return __awaiter(this, void 0, void 0, function* () {
            const names = yield readdir(dir);
            const list = [];
            const fileMap = new Map();
            const relativePathInfo = (p) => {
                if (vscode.workspace.rootPath) {
                    return `relative to workspace: ${path.relative(vscode.workspace.rootPath, p)}`;
                }
                return `absolute path: ${p}`;
            };
            list.push(createCompletionItem("..", vscode_1.CompletionItemKind.Module, {
                detail: "directory",
                documentation: relativePathInfo(path.dirname(dir)),
            }));
            for (const name of names) {
                const realPath = path.join(dir, name);
                const stats = yield readFileStats(realPath);
                if (stats.isDirectory()) {
                    // directory
                    list.push(createCompletionItem(`${prefix}${name}`, vscode_1.CompletionItemKind.Module, {
                        detail: "directory",
                        documentation: relativePathInfo(realPath),
                    }));
                }
                else if (stats.isFile()) {
                    // file
                    const [strip, ext] = parseFileExtensionName(name, this.autoStripExtensions);
                    this.debug("FILE", name, strip, ext);
                    let n = name;
                    if (!isIncludeExtname && strip) {
                        n = name.slice(0, name.length - ext.length);
                    }
                    if (!fileMap.has(n)) {
                        fileMap.set(n, true);
                        list.push(createCompletionItem(`${prefix}${n}`, vscode_1.CompletionItemKind.File, {
                            detail: "file module",
                            documentation: relativePathInfo(realPath),
                        }));
                    }
                }
            }
            return list;
        });
    }
}
/**
 * Builtin Node.js modules
 */
IntellisenseProvider.builtinModules = getBuiltinModules();
IntellisenseProvider.configPath = "node-module-intellisense";
IntellisenseProvider.defaultAutoStripExtensions = [".js", ".jsx", ".ts", ".d.ts", ".tsx"];
IntellisenseProvider.languageSelector = ["javascript", "javascriptreact", "typescript", "typescriptreact", "html"];
IntellisenseProvider.triggerCharacters = ["'", "\"", "/"];
exports.default = IntellisenseProvider;
/**
 * returns builtin modules
 */
function getBuiltinModules() {
    return Object.keys(process.binding("natives")).filter((n) => {
        if (n.indexOf("_") !== -1) {
            return false;
        }
        if (n.indexOf("/") !== -1) {
            return false;
        }
        if (n.indexOf("-") !== -1) {
            return false;
        }
        return true;
    });
}
/**
 * create CompletionItem
 */
function createCompletionItem(name, kind, info) {
    const item = new vscode_1.CompletionItem(name, kind);
    Object.assign(item, info);
    return item;
}
/**
 * returns true if file is exists
 */
function isFileExists(filename) {
    return new Promise((resolve, reject) => {
        fs.exists(filename, resolve);
    });
}
/**
 * returns file content
 */
function readFileContent(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
}
/**
 * returns file stats
 */
function readFileStats(filename) {
    return new Promise((resolve, reject) => {
        fs.stat(filename, (err, stats) => {
            if (err) {
                return reject(err);
            }
            resolve(stats);
        });
    });
}
/**
 * returns directory files
 */
function readdir(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, list) => {
            if (err) {
                return reject(err);
            }
            resolve(list);
        });
    });
}
/**
 * Parse current line
 */
function parseLine(document, position) {
    const info = {
        position,
    };
    const line = document.getText(document.lineAt(position).range);
    info.type = getStatementType(line);
    if (!info.type) {
        return;
    }
    const [i, quotation] = getForwardQuotation(line, position.character);
    info.quotation = quotation;
    info.quotationStart = i;
    info.search = line.slice(i + 1, position.character);
    if (info.search[0] === ".") {
        info.isRelativePath = true;
    }
    else if (info.search[0] === "/") {
        info.isAbsoultePath = true;
    }
    else {
        info.isPackagePath = true;
        let j = info.search.indexOf(path.sep);
        if (j !== -1 && info.search[0] === "@") {
            j = info.search.indexOf(path.sep, j + 1);
        }
        if (j === -1) {
            info.packageName = info.search;
            info.packageSubPath = "";
        }
        else {
            info.packageName = info.search.slice(0, j);
            info.packageSubPath = info.search.slice(j + 1);
        }
    }
    return info;
}
/**
 * Returns statement type
 */
function getStatementType(line) {
    line = line.trim();
    if (line.indexOf("import ") === 0) {
        return "import";
    }
    if (line.indexOf("require(") !== -1) {
        return "require";
    }
    if (line.indexOf("export ") === 0 && line.indexOf(" from ") !== -1) {
        return "export";
    }
    if (line.trim().indexOf("/// <reference ") === 0) {
        return "reference";
    }
    return false;
}
/**
 * Returns forward quotation position and character
 */
function getForwardQuotation(line, index) {
    const i = line.lastIndexOf("\"", index - 1);
    const j = line.lastIndexOf("'", index - 1);
    if (i > j) {
        return [i, "\""];
    }
    return [j, "'"];
}
/**
 * Parse File extension name
 */
function parseFileExtensionName(filename, autoStripExtensions) {
    const len = filename.length;
    for (const ext of autoStripExtensions) {
        if (filename.slice(len - ext.length) === ext) {
            return [true, ext];
        }
    }
    return [false, ""];
}
/**
 * Returns require package directory from current path
 */
function resolvePackageDirectory(pkgName, filename) {
    return resolve_1.default(pkgName, path.dirname(filename));
}
//# sourceMappingURL=provider.js.map