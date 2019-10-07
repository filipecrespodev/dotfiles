"use strict";
// 'Messages' modified from:
// https://github.com/eamodio/vscode-gitlens/blob/master/src/messages.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const common_1 = require("./common");
exports.SuppressedKeys = {
    UpdateNotice: 'suppressUpdateNotice'
};
class Messages {
    static configure(context) {
        this.context = context;
    }
    static showUpdateMessage(version) {
        return __awaiter(this, void 0, void 0, function* () {
            const viewDocs = common_1.localize(22, null);
            const viewReleaseNotes = common_1.localize(23, null);
            const dontShowAgain = common_1.localize(24, null);
            const result = yield Messages._showMessage('info', common_1.localize(25, null, version), exports.SuppressedKeys.UpdateNotice, dontShowAgain, viewDocs, viewReleaseNotes);
            if (result === viewReleaseNotes) {
                vscode_1.commands.executeCommand("vscode.open", vscode_1.Uri.parse('https://marketplace.visualstudio.com/items/jebbs.plantuml/changelog'));
            }
            else if (result === viewDocs) {
                vscode_1.commands.executeCommand("vscode.open", vscode_1.Uri.parse('https://marketplace.visualstudio.com/items/jebbs.plantuml'));
            }
            return result;
        });
    }
    static showWelcomeMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const viewDocs = common_1.localize(22, null);
            const result = yield vscode_1.window.showInformationMessage(common_1.localize(21, null), viewDocs);
            if (result === viewDocs) {
                vscode_1.commands.executeCommand("vscode.open", vscode_1.Uri.parse('https://marketplace.visualstudio.com/items/jebbs.plantuml'));
            }
            return result;
        });
    }
    static _showMessage(type, message, suppressionKey, dontShowAgain, ...actions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Messages.context.globalState.get(suppressionKey, false))
                return undefined;
            if (dontShowAgain !== null) {
                actions.push(dontShowAgain);
            }
            let result = undefined;
            switch (type) {
                case 'info':
                    result = yield vscode_1.window.showInformationMessage(message, ...actions);
                    break;
                case 'warn':
                    result = yield vscode_1.window.showWarningMessage(message, ...actions);
                    break;
                case 'error':
                    result = yield vscode_1.window.showErrorMessage(message, ...actions);
                    break;
            }
            if (dontShowAgain !== null || result === dontShowAgain) {
                yield Messages.context.globalState.update(suppressionKey, true);
                return undefined;
            }
            return result;
        });
    }
}
exports.Messages = Messages;
// code modified from:
// https://github.com/eamodio/vscode-gitlens
function notifyOnNewVersion(context, version) {
    return __awaiter(this, void 0, void 0, function* () {
        Messages.configure(context);
        if (context.globalState.get(exports.SuppressedKeys.UpdateNotice, false))
            return;
        const previousVersion = context.globalState.get("version");
        yield context.globalState.update("version", version);
        if (previousVersion === undefined) {
            yield Messages.showWelcomeMessage();
            return;
        }
        const [major, minor] = version.split('.');
        const [prevMajor, prevMinor] = previousVersion.split('.');
        if (major === prevMajor && minor === prevMinor)
            return;
        // Don't notify on downgrades
        if (major < prevMajor || (major === prevMajor && minor < prevMinor))
            return;
        yield Messages.showUpdateMessage(version);
    });
}
exports.notifyOnNewVersion = notifyOnNewVersion;
//# sourceMappingURL=messages.js.map