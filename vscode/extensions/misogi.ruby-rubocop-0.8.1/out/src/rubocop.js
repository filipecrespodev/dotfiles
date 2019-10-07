"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taskQueue_1 = require("./taskQueue");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const configuration_1 = require("./configuration");
class RubocopAutocorrectProvider {
    provideDocumentFormattingEdits(document) {
        const config = configuration_1.getConfig();
        try {
            const args = [
                ...getCommandArguments(document.fileName),
                "--auto-correct"
            ];
            const options = {
                cwd: getCurrentPath(document.fileName),
                input: document.getText()
            };
            let stdout;
            if (config.useBundler) {
                stdout = cp.execSync(`${config.command} ${args.join(" ")}`, options);
            }
            else {
                stdout = cp.execFileSync(config.command, args, options);
            }
            return this.onSuccess(document, stdout);
        }
        catch (e) {
            // if there are still some offences not fixed rubocop will return status 1
            if (e.status !== 1) {
                vscode.window.showWarningMessage('An error occured during autocorrection');
                console.log(e);
                return [];
            }
            else {
                return this.onSuccess(document, e.stdout);
            }
        }
    }
    // Output of autocorrection looks like this:
    //
    // {"metadata": ... {"offense_count":5,"target_file_count":1,"inspected_file_count":1}}====================
    // def a
    //   3
    // end
    //
    // So we need to parse out the actual autocorrected ruby
    onSuccess(document, stdout) {
        const stringOut = stdout.toString();
        const autoCorrection = stringOut.match(/^{.*}====================(?:\n|\r\n)([.\s\S]*)/m);
        if (!autoCorrection) {
            throw new Error(`Error parsing autocorrection from CLI: ${stringOut}`);
        }
        return [
            new vscode.TextEdit(this.getFullRange(document), autoCorrection.pop())
        ];
    }
    getFullRange(document) {
        return new vscode.Range(new vscode.Position(0, 0), document.lineAt(document.lineCount - 1).range.end);
    }
}
exports.RubocopAutocorrectProvider = RubocopAutocorrectProvider;
function isFileUri(uri) {
    return uri.scheme === 'file';
}
function getCurrentPath(fileName) {
    return vscode.workspace.rootPath || path.dirname(fileName);
}
// extract argument to an array
function getCommandArguments(fileName) {
    let commandArguments = ['--stdin', fileName, '--format', 'json', '--force-exclusion'];
    const extensionConfig = configuration_1.getConfig();
    if (extensionConfig.configFilePath !== '') {
        if (fs.existsSync(extensionConfig.configFilePath)) {
            const config = ['--config', extensionConfig.configFilePath];
            commandArguments = commandArguments.concat(config);
        }
        else {
            vscode.window.showWarningMessage(`${extensionConfig.configFilePath} file does not exist. Ignoring...`);
        }
    }
    return commandArguments;
}
class Rubocop {
    constructor(diagnostics, additionalArguments = []) {
        this.taskQueue = new taskQueue_1.TaskQueue();
        this.diag = diagnostics;
        this.additionalArguments = additionalArguments;
        this.config = configuration_1.getConfig();
    }
    execute(document, onComplete) {
        if ((document.languageId !== 'gemfile' && document.languageId !== 'ruby') ||
            document.isUntitled ||
            !isFileUri(document.uri)) {
            // git diff has ruby-mode. but it is Untitled file.
            return;
        }
        const fileName = document.fileName;
        const uri = document.uri;
        let currentPath = getCurrentPath(fileName);
        let onDidExec = (error, stdout, stderr) => {
            if (this.hasError(error, stderr)) {
                return;
            }
            this.diag.delete(uri);
            let rubocop = this.parse(stdout);
            if (rubocop === undefined || rubocop === null) {
                return;
            }
            let entries = [];
            rubocop.files.forEach((file) => {
                let diagnostics = [];
                file.offenses.forEach((offence) => {
                    const loc = offence.location;
                    const range = new vscode.Range(loc.line - 1, loc.column - 1, loc.line - 1, loc.length + loc.column - 1);
                    const sev = this.severity(offence.severity);
                    const message = `${offence.message} (${offence.severity}:${offence.cop_name})`;
                    const diagnostic = new vscode.Diagnostic(range, message, sev);
                    diagnostics.push(diagnostic);
                });
                entries.push([uri, diagnostics]);
            });
            this.diag.set(entries);
        };
        const args = getCommandArguments(fileName).concat(this.additionalArguments);
        let task = new taskQueue_1.Task(uri, token => {
            let process = this.executeRubocop(args, document.getText(), { cwd: currentPath }, (error, stdout, stderr) => {
                if (token.isCanceled) {
                    return;
                }
                onDidExec(error, stdout, stderr);
                token.finished();
                if (onComplete) {
                    onComplete();
                }
            });
            return () => process.kill();
        });
        this.taskQueue.enqueue(task);
    }
    get isOnSave() {
        return this.config.onSave;
    }
    clear(document) {
        let uri = document.uri;
        if (isFileUri(uri)) {
            this.taskQueue.cancel(uri);
            this.diag.delete(uri);
        }
    }
    // execute rubocop
    executeRubocop(args, fileContents, options, cb) {
        let child;
        if (this.config.useBundler) {
            child = cp.exec(`${this.config.command} ${args.join(' ')}`, options, cb);
        }
        else {
            child = cp.execFile(this.config.command, args, options, cb);
        }
        child.stdin.write(fileContents);
        child.stdin.end();
        return child;
    }
    // parse rubocop(JSON) output
    parse(output) {
        let rubocop;
        if (output.length < 1) {
            let message = `command ${this.config.command} returns empty output! please check configuration.`;
            vscode.window.showWarningMessage(message);
            return null;
        }
        try {
            rubocop = JSON.parse(output);
        }
        catch (e) {
            if (e instanceof SyntaxError) {
                let regex = /[\r\n \t]/g;
                let message = output.replace(regex, ' ');
                let errorMessage = `Error on parsing output (It might non-JSON output) : "${message}"`;
                vscode.window.showWarningMessage(errorMessage);
                return null;
            }
        }
        return rubocop;
    }
    // checking rubocop output has error
    hasError(error, stderr) {
        let errorOutput = stderr.toString();
        if (error && error.code === 'ENOENT') {
            vscode.window.showWarningMessage(`${this.config.command} is not executable`);
            return true;
        }
        else if (error && error.code === 127) {
            vscode.window.showWarningMessage(stderr);
            return true;
        }
        else if (errorOutput.length > 0 && !this.config.suppressRubocopWarnings) {
            vscode.window.showWarningMessage(stderr);
            return true;
        }
        return false;
    }
    severity(sev) {
        switch (sev) {
            case 'refactor': return vscode.DiagnosticSeverity.Hint;
            case 'convention': return vscode.DiagnosticSeverity.Information;
            case 'warning': return vscode.DiagnosticSeverity.Warning;
            case 'error': return vscode.DiagnosticSeverity.Error;
            case 'fatal': return vscode.DiagnosticSeverity.Error;
            default: return vscode.DiagnosticSeverity.Error;
        }
    }
}
exports.Rubocop = Rubocop;
//# sourceMappingURL=rubocop.js.map