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
const _ = require("lodash");
const server = require("vscode-languageserver");
const shared_1 = require("../../shared");
const command = require("../command");
class Analyzer {
    constructor(session) {
        this.session = session;
        return this;
    }
    clear(event) {
        this.session.connection.sendDiagnostics({
            diagnostics: [],
            uri: event.uri,
        });
    }
    dispose() {
        return;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.onDidChangeConfiguration();
        });
    }
    onDidChangeConfiguration() {
        this.refreshImmediate = this.refreshWithKind(server.TextDocumentSyncKind.Full);
        this.refreshDebounced = _.debounce(this.refreshWithKind(server.TextDocumentSyncKind.Incremental), this.session.settings.reason.debounce.linter, { trailing: true });
    }
    refreshWithKind(syncKind) {
        return (id) => __awaiter(this, void 0, void 0, function* () {
            if (syncKind === server.TextDocumentSyncKind.Full) {
                const document = yield command.getTextDocument(this.session, id);
                if (null != document)
                    yield this.session.merlin.sync(shared_1.merlin.Sync.tell("start", "end", document.getText()), id);
            }
            const errors = yield this.session.merlin.query(shared_1.merlin.Query.errors(), id);
            if (errors.class !== "return")
                return;
            const diagnostics = [];
            for (const report of errors.value)
                diagnostics.push(yield shared_1.merlin.IErrorReport.intoCode(this.session, id, report));
            this.session.connection.sendDiagnostics({ diagnostics, uri: id.uri });
        });
    }
}
exports.default = Analyzer;
//# sourceMappingURL=analyzer.js.map