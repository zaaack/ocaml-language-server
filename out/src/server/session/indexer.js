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
const shared_1 = require("../../shared");
const command = require("../command");
const Loki = require("lokijs");
const rpc = require("vscode-jsonrpc");
class Indexer {
    constructor(session) {
        this.populated = false;
        this.db = new Loki(".vscode.reasonml.loki");
        this.session = session;
        this.symbols = this.db.addCollection("symbols", {
            indices: ["name"],
        });
        return this;
    }
    dispose() {
        return;
    }
    findSymbols(query) {
        let result = [];
        try {
            result = this.symbols.chain().find(query).simplesort("name").data();
        }
        catch (err) {
        }
        return result;
    }
    indexSymbols(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = shared_1.merlin.Query.outline();
            const response = yield this.session.merlin.query(request, id);
            if (response.class !== "return")
                return new rpc.ResponseError(-1, "indexSymbols: failed", undefined);
            for (const item of shared_1.merlin.Outline.intoCode(response.value, id)) {
                const prefix = item.containerName ? `${item.containerName}.` : "";
                item.name = `${prefix}${item.name}`;
                item.containerName = this.session.environment.relativize(id);
                this.symbols.insert(item);
            }
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    populate(origin) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.populated) {
                this.populated = true;
                const modules = yield command.getModules(this.session, origin);
                for (const id of modules) {
                    if (/\.(ml|re)i$/.test(id.uri))
                        continue;
                    const document = yield command.getTextDocument(this.session, id);
                    if (null != document) {
                        yield this.session.merlin.sync(shared_1.merlin.Sync.tell("start", "end", document.getText()), id);
                        yield this.refreshSymbols(id);
                    }
                }
            }
        });
    }
    refreshSymbols(id) {
        this.removeSymbols(id);
        return this.indexSymbols(id);
    }
    removeSymbols({ uri }) {
        this.symbols
            .chain()
            .where((item) => item.location.uri === uri)
            .remove();
    }
}
exports.default = Indexer;
//# sourceMappingURL=indexer.js.map