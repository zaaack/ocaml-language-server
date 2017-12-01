import * as server from "vscode-languageserver";
import { merlin, types } from "../../../lib";
import Session from "./index";

export default class Synchronizer implements server.Disposable {
  public readonly documents: Map<string, types.TextDocument> = new Map();

  constructor(private readonly session: Session) {}

  public dispose(): void {
    return;
  }

  public async initialize(): Promise<void> {
    return;
  }

  public listen(): void {
    this.session.connection.onDidCloseTextDocument(
      this.onDidCloseTextDocument.bind(this),
    );
    this.session.connection.onDidOpenTextDocument(
      this.onDidOpenTextDocument.bind(this),
    );
    this.session.connection.onDidChangeTextDocument(
      this.onDidChangeTextDocument.bind(this),
    );
    this.session.connection.onDidSaveTextDocument(
      this.onDidSaveTextDocument.bind(this),
    );
  }

  public onDidChangeConfiguration(): void {
    return;
  }

  public getTextDocument(uri: string): null | types.TextDocument {
    const document = this.documents.get(uri);
    return document ? document : null;
  }

  private applyChangesToTextDocumentContent(
    oldDocument: types.TextDocument,
    change: types.TextDocumentContentChangeEvent,
  ): null | string {
    if (!change.range) return null;
    const startOffset = oldDocument.offsetAt(change.range.start);
    const endOffset = oldDocument.offsetAt(change.range.end);
    const before = oldDocument.getText().substr(0, startOffset);
    const after = oldDocument.getText().substr(endOffset);
    return `${before}${change.text}${after}`;
  }

  private async doFullSync(
    document: types.VersionedTextDocumentIdentifier,
    languageId: string,
    content: string,
  ): Promise<void> {
    this.documents.set(
      document.uri,
      types.TextDocument.create(
        document.uri,
        languageId,
        document.version,
        content,
      ),
    );

    const request = merlin.Sync.tell("start", "end", content);
    await this.session.merlin.sync(request, document, Infinity);
  }

  private async doIncrementalSync(
    oldDocument: types.TextDocument,
    newDocument: types.VersionedTextDocumentIdentifier,
    change: types.TextDocumentContentChangeEvent,
  ): Promise<void> {
    if (!change || !change.range) return;

    const newContent = this.applyChangesToTextDocumentContent(
      oldDocument,
      change,
    );
    if (newContent) {
      this.documents.set(
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

  private async onDidChangeTextDocument(
    event: server.DidChangeTextDocumentParams,
  ): Promise<void> {
    for (const change of event.contentChanges) {
      if (!change) continue;
      const oldDocument = this.documents.get(event.textDocument.uri);
      if (!oldDocument) continue;
      if (!change.range) {
        await this.doFullSync(
          event.textDocument,
          oldDocument.languageId,
          change.text,
        );
      } else {
        await this.doIncrementalSync(oldDocument, event.textDocument, change);
      }
      await this.session.analyzer.refreshDebounced(event.textDocument);
    }
  }

  private async onDidOpenTextDocument(
    event: server.DidOpenTextDocumentParams,
  ): Promise<void> {
    await this.doFullSync(
      event.textDocument,
      event.textDocument.languageId,
      event.textDocument.text,
    );
    await this.session.analyzer.refreshImmediate(event.textDocument);
    await this.session.indexer.populate(event.textDocument);
  }

  private onDidCloseTextDocument(
    event: server.DidCloseTextDocumentParams,
  ): void {
    this.documents.delete(event.textDocument.uri);
    this.session.analyzer.clear(event.textDocument);
  }

  private async onDidSaveTextDocument(
    event: server.DidSaveTextDocumentParams,
  ): Promise<void> {
    await this.session.analyzer.refreshImmediate(event.textDocument);
  }
}
