import * as rpc from "vscode-jsonrpc";
import { merlin, types } from "../../shared";
import { TextDocumentContentChangeEvent } from "../../shared/types";
import Session from "./index";

export default class Synchronizer implements rpc.Disposable {
    private session: Session;
    private textDocuments: Map<string, types.TextDocument> = new Map();

    constructor(session: Session) {
        this.session = session;
        return this;
    }

    public dispose(): void {
        return;
    }

    public async initialize(): Promise<void> {
        return;
    }

    public listen(): void {
        this.session.connection.onDidCloseTextDocument((event) => {
            this.textDocuments.delete(event.textDocument.uri);
            this.session.analyzer.clear(event.textDocument);
        });

        this.session.connection.onDidOpenTextDocument(async (event): Promise<void> => {
            await this.doFullSync(event.textDocument, event.textDocument.languageId, event.textDocument.text);
            this.session.analyzer.refreshImmediate(event.textDocument);
            // this.session.indexer.refreshSymbols(event.textDocument);
            await this.session.indexer.populate(event.textDocument);
            // this.session.analyzer.refreshWorkspace(event.textDocument);
        });

        this.session.connection.onDidChangeTextDocument(async (event): Promise<void> => {
            for (const change of event.contentChanges) {

                if (!change) continue;

                const oldDocument = this.textDocuments.get(event.textDocument.uri);

                if (!oldDocument) continue;

                if (!change.range) {
                    await this.doFullSync(event.textDocument, oldDocument.languageId, change.text);
                } else {
                    await this.doIncrementalSync(oldDocument, event.textDocument, change);
                }

                this.session.analyzer.refreshDebounced(event.textDocument);
            }
        });

        this.session.connection.onDidSaveTextDocument(async (event): Promise<void> => {
            this.session.analyzer.refreshImmediate(event.textDocument);
            // this.session.analyzer.refreshWorkspace(event.textDocument);
        });
    }

    public onDidChangeConfiguration(): void {
        return;
    }

    public getTextDocument(uri: string): null | types.TextDocument {
        const document = this.textDocuments.get(uri);
        if (null == document) return null;
        return document;
    }

    private async doFullSync(textDocument: types.VersionedTextDocumentIdentifier, languageId: string, content: string): Promise<void> {
        this.textDocuments.set(
            textDocument.uri,
            types.TextDocument.create(
                textDocument.uri,
                languageId,
                textDocument.version,
                content
            ),
        );

        const request = merlin.Sync.tell("start", "end", content);
        await this.session.merlin.sync(request, textDocument, Infinity);
    }

    private async doIncrementalSync(oldDocument: types.TextDocument, newDocument: types.VersionedTextDocumentIdentifier, change: TextDocumentContentChangeEvent): Promise<void> {
        if (!change || !change.range) return;

        const newContent = this.applyChangesToTextDocumentContent(oldDocument, change);
        if (null != newContent) {
            this.textDocuments.set(
                newDocument.uri,
                types.TextDocument.create(
                    oldDocument.uri,
                    oldDocument.languageId,
                    newDocument.version,
                    newContent,
                ),
            );
        }

        const startPos = merlin.Position.fromCode(change.range.start);
        const endPos = merlin.Position.fromCode(change.range.end);
        const request = merlin.Sync.tell(startPos, endPos, change.text);
        await this.session.merlin.sync(request, newDocument, Infinity);
    }

    private applyChangesToTextDocumentContent(oldDocument: types.TextDocument, change: TextDocumentContentChangeEvent): null | string {
        if (null == change.range) return null;
        const startOffset = oldDocument.offsetAt(change.range.start);
        const endOffset = oldDocument.offsetAt(change.range.end);
        const before = oldDocument.getText().substr(0, startOffset);
        const after = oldDocument.getText().substr(endOffset);
        return `${before}${change.text}${after}`;
    }
}
