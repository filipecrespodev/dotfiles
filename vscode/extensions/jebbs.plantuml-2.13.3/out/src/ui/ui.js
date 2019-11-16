"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const tools_1 = require("../plantuml/tools");
const DEFAULT_VIEWCOLUMN = vscode.ViewColumn.Two;
class UI extends vscode.Disposable {
    constructor(viewType, title, resourceRoot) {
        super(() => this.dispose());
        this._disposables = [];
        this._listener = {
            "open": [],
            "close": [],
            "message": [],
        };
        this._viewType = viewType;
        this._title = title;
        this._resourceRoot = resourceRoot;
    }
    dispose() {
        this.uiEventListerCatch("close");
        this._panel.dispose();
        this._disposables.length && this._disposables.map(d => d && d.dispose());
        this._disposables = [];
    }
    get visible() {
        return this._panel && this._panel.visible;
    }
    show(...args) {
        let viewColumn;
        // FIXME: file name may conflict with viewColumn keys
        if (args.length == 1 && args[0] in vscode.ViewColumn) {
            if (!this._panel)
                return;
            viewColumn = args[0];
        }
        else {
            let file = args[0];
            let env = args[1];
            viewColumn = args[2] || (this._panel ? this._panel.viewColumn : DEFAULT_VIEWCOLUMN);
            this.createIfNoPanel(viewColumn);
            this.update(file, env);
        }
        if (!this._panel.visible || viewColumn !== this._panel.viewColumn)
            this._panel.reveal(viewColumn ? viewColumn : this._panel.viewColumn);
    }
    close() {
        this.dispose();
    }
    update(file, env) {
        if (!this._panel)
            return;
        this._panel.webview.html = this.loadFile(file, env || {});
    }
    postMessage(message) {
        if (!this._panel)
            return;
        return this._panel.webview.postMessage(message);
    }
    addEventListener(type, listener) {
        this._listener[type].push(listener);
    }
    createIfNoPanel(viewColumn) {
        if (this._panel)
            return;
        this._panel = vscode.window.createWebviewPanel(this._viewType, this._title, viewColumn ? viewColumn : DEFAULT_VIEWCOLUMN, {
            enableScripts: true,
            enableCommandUris: false,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(this._resourceRoot)],
        });
        this.addMessageListener();
        this.uiEventListerCatch("open");
        this._panel.onDidDispose(() => {
            this.dispose();
            this._panel = undefined;
        }, this, this._disposables);
    }
    addMessageListener() {
        if (this._panel && this._listener)
            this._panel.webview.onDidReceiveMessage(this.messageListenerCatch, this, this._disposables);
    }
    uiEventListerCatch(type) {
        try {
            let e = {
                caller: this,
                panel: this._panel,
            };
            for (let listener of this._listener[type]) {
                let pm = listener(e);
                if (pm instanceof Promise) {
                    pm.catch(error => tools_1.showMessagePanel(error));
                }
            }
        }
        catch (error) {
            tools_1.showMessagePanel(error);
        }
    }
    messageListenerCatch(message) {
        try {
            let e = {
                caller: this,
                panel: this._panel,
                message: message,
            };
            for (let listener of this._listener["message"]) {
                let pm = listener(e);
                if (pm instanceof Promise) {
                    pm.catch(error => tools_1.showMessagePanel(error));
                }
            }
        }
        catch (error) {
            tools_1.showMessagePanel(error);
        }
    }
    loadFile(file, env) {
        file = path.join(this._resourceRoot, file);
        return this.evalHtml(fs.readFileSync(file).toString(), env);
    }
    evalHtml(html, env) {
        let envReg = /\$\{(.+?)\}/ig;
        html = html.replace(envReg, '${env.$1}');
        let result = eval('`' + html + '`');
        // convert relative "src", "href" paths to absolute
        let linkReg = /(src|href)\s*=\s*([`"'])(.+?)\2/ig;
        let base = this._resourceRoot;
        result = result.replace(linkReg, (match, ...subs) => {
            let uri = subs[2];
            if (!path.isAbsolute(uri))
                uri = path.join(base, uri);
            if (!fs.existsSync(uri))
                return match;
            uri = vscode.Uri.file(uri).with({ scheme: 'vscode-resource' }).toString();
            return `${subs[0]}=${subs[1]}${uri}${subs[1]}`;
        });
        return result;
    }
}
exports.UI = UI;
//# sourceMappingURL=ui.js.map