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
class Synchronizer {
    constructor(session) {
        this.textDocuments = new Map();
        this.session = session;
        return this;
    }
    dispose() {
        return;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    listen() {
        this.session.connection.onDidCloseTextDocument((event) => {
            this.textDocuments.delete(event.textDocument.uri);
            this.session.analyzer.clear(event.textDocument);
        });
        this.session.connection.onDidOpenTextDocument((event) => __awaiter(this, void 0, void 0, function* () {
            this.textDocuments.set(event.textDocument.uri, shared_1.types.TextDocument.create(event.textDocument.uri, event.textDocument.languageId, event.textDocument.version, event.textDocument.text));
            const request = shared_1.merlin.Sync.tell("start", "end", event.textDocument.text);
            yield this.session.merlin.sync(request, event.textDocument, Infinity);
            this.session.analyzer.refreshImmediate(event.textDocument);
            yield this.session.indexer.populate(event.textDocument);
        }));
        this.session.connection.onDidChangeTextDocument((event) => __awaiter(this, void 0, void 0, function* () {
            for (const change of event.contentChanges) {
                if (change && change.range) {
                    const oldDocument = this.textDocuments.get(event.textDocument.uri);
                    if (null != oldDocument) {
                        const newContent = this.applyChangesToTextDocumentContent(oldDocument, change);
                        if (null != newContent) {
                            this.textDocuments.set(event.textDocument.uri, shared_1.types.TextDocument.create(oldDocument.uri, oldDocument.languageId, event.textDocument.version, newContent));
                        }
                    }
                    const startPos = shared_1.merlin.Position.fromCode(change.range.start);
                    const endPos = shared_1.merlin.Position.fromCode(change.range.end);
                    const request = shared_1.merlin.Sync.tell(startPos, endPos, change.text);
                    yield this.session.merlin.sync(request, event.textDocument, Infinity);
                }
            }
            this.session.analyzer.refreshDebounced(event.textDocument);
        }));
        this.session.connection.onDidSaveTextDocument((event) => __awaiter(this, void 0, void 0, function* () {
            this.session.analyzer.refreshImmediate(event.textDocument);
        }));
    }
    onDidChangeConfiguration() {
        return;
    }
    getTextDocument(uri) {
        const document = this.textDocuments.get(uri);
        if (null == document)
            return null;
        return document;
    }
    applyChangesToTextDocumentContent(oldDocument, change) {
        if (null == change.range)
            return null;
        const startOffset = oldDocument.offsetAt(change.range.start);
        const endOffset = oldDocument.offsetAt(change.range.end);
        const before = oldDocument.getText().substr(0, startOffset);
        const after = oldDocument.getText().substr(endOffset);
        return `${before}${change.text}${after}`;
    }
}
exports.default = Synchronizer;
//# sourceMappingURL=synchronizer.js.map