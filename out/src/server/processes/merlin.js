"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async = require("async");
const _ = require("lodash");
const readline = require("readline");
const vscode_uri_1 = require("vscode-uri");
class Merlin {
    constructor(session) {
        this.session = session;
        this.queue = async.priorityQueue((task, callback) => {
            this.readline.question(JSON.stringify(task), _.flow(JSON.parse, callback));
        }, 1);
        return this;
    }
    dispose() {
        this.readline.close();
    }
    initialize() {
        const ocamlmerlin = this.session.settings.reason.path.ocamlmerlin;
        const cwd = this.session.initConf.rootUri || this.session.initConf.rootPath;
        const options = cwd ? { cwd: vscode_uri_1.default.parse(cwd).fsPath } : {};
        this.process = this.session.environment.spawn(ocamlmerlin, [], options);
        this.process.on("error", (error) => {
            if (error.code === "ENOENT") {
                const msg = `Cannot find merlin binary at "${ocamlmerlin}".`;
                this.session.connection.window.showWarningMessage(msg);
                this.session.connection.window.showWarningMessage(`Double check your path or try configuring "reason.path.ocamlmerlin" under "User Settings".`);
                this.dispose();
                throw error;
            }
        });
        this.process.stderr.on("data", (data) => {
            this.session.connection.window.showErrorMessage(`ocamlmerlin error: ${data}`);
        });
        this.readline = readline.createInterface({
            input: this.process.stdout,
            output: this.process.stdin,
            terminal: false,
        });
    }
    query({ query }, id, priority = 0) {
        const context = id ? ["auto", id.uri] : undefined;
        const request = context ? { context, query } : query;
        return new Promise((resolve) => this.queue.push([request], priority, resolve));
    }
    sync({ sync: query }, id, priority = 0) {
        const context = id ? ["auto", id.uri] : undefined;
        const request = context ? { context, query } : query;
        return new Promise((resolve) => this.queue.push([request], priority, resolve));
    }
}
exports.default = Merlin;
//# sourceMappingURL=merlin.js.map