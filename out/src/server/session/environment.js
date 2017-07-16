"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const childProcess = require("child_process");
const path = require("path");
const URL = require("url");
const fileSchemeLength = "file://".length - 1;
class Environment {
    constructor(session) {
        this.preamble = null;
        this.session = session;
        return this;
    }
    static pathToUri(path) {
        const uri = URL.format(URL.parse(`file://${path}`));
        return { uri };
    }
    static uriToPath({ uri }) {
        return uri.substr(fileSchemeLength);
    }
    dispose() {
        return;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.detectDependencyEnv();
        });
    }
    relativize(id) {
        const rootPath = this.workspaceRoot();
        if (!rootPath)
            return;
        return path.relative(rootPath, Environment.uriToPath(id));
    }
    spawn(command, args, options) {
        let cmd = "";
        if (this.preamble != null) {
            cmd = `${this.preamble}${command} ${args ? args.join(" ") : ""}`;
            return childProcess.spawn("sh", ["-c", cmd], options);
        }
        else {
            cmd = command;
            return childProcess.spawn(command, args, options);
        }
    }
    workspaceRoot() {
        return this.session.initConf.rootPath;
    }
    detectDependencyEnv() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dependencyEnvScript = `${this.session.environment.workspaceRoot()}/node_modules/.bin/dependencyEnv`;
                this.preamble = `[ ! -f ${dependencyEnvScript} ] || eval $(${dependencyEnvScript}) && `;
            }
            catch (err) {
            }
        });
    }
}
exports.default = Environment;
//# sourceMappingURL=environment.js.map