import * as rpc from "vscode-jsonrpc";
import { TextDocumentPositionParams } from "vscode-languageserver/lib/main";
import { merlin, types } from "../../shared";
import { TextDocumentContentChangeEvent } from "../../shared/types";
import { getWordAtPosition } from "../command";
import Session from "./index";

export default class Synchronizer implements rpc.Disposable {
  private session: Session;
  private textDocuments: Map<string, types.TextDocument> = new Map();
  private eventCache: Map<string, Map<string, any>> = new Map();

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
      this.textDocuments.set(
        event.textDocument.uri,
        types.TextDocument.create(
          event.textDocument.uri,
          event.textDocument.languageId,
          event.textDocument.version,
          event.textDocument.text,
        ),
      );
      const request = merlin.Sync.tell("start", "end", event.textDocument.text);
      await this.session.merlin.sync(request, event.textDocument, Infinity);
      this.session.analyzer.refreshImmediate(event.textDocument);
      // this.session.indexer.refreshSymbols(event.textDocument);
      await this.session.indexer.populate(event.textDocument);
      // this.session.analyzer.refreshWorkspace(event.textDocument);
    });

    this.session.connection.onDidChangeTextDocument(async (event): Promise<void> => {
      this.clearCache();

      for (const change of event.contentChanges) {
        if (change && change.range) {
          const oldDocument = this.textDocuments.get(event.textDocument.uri);
          if (null != oldDocument) {
            const newContent = this.applyChangesToTextDocumentContent(oldDocument, change);
            if (null != newContent) {
              this.textDocuments.set(
                event.textDocument.uri,
                types.TextDocument.create(
                  oldDocument.uri,
                  oldDocument.languageId,
                  event.textDocument.version,
                  newContent,
                ),
              );
            }
          }

          const startPos = merlin.Position.fromCode(change.range.start);
          const endPos = merlin.Position.fromCode(change.range.end);
          const request = merlin.Sync.tell(startPos, endPos, change.text);
          await this.session.merlin.sync(request, event.textDocument, Infinity);
        }
      }
      this.session.analyzer.refreshDebounced(event.textDocument);
    });

    this.session.connection.onDidSaveTextDocument(async (event): Promise<void> => {
      this.session.analyzer.refreshImmediate(event.textDocument);
      // this.session.analyzer.refreshWorkspace(event.textDocument);
    });
  }

  public getCachedResult(method: string, key: TextDocumentPositionParams): null | any {
    const methodCache = this.eventCache.get(method);
    if (methodCache) {
      return methodCache.get(this.getCacheKey(key));
    }
    return null;
  }

  public addCachedResult(method: string, key: TextDocumentPositionParams, result: any): void {
    const methodCache = this.eventCache.get(method) || new Map();
    methodCache.set(this.getCacheKey(key), result);
    this.eventCache.set(method, methodCache);
  }

  public onDidChangeConfiguration(): void {
    return;
  }

  public getTextDocument(uri: string): null | types.TextDocument {
    const document = this.textDocuments.get(uri);
    if (null == document) return null;
    return document;
  }

  private applyChangesToTextDocumentContent(oldDocument: types.TextDocument, change: TextDocumentContentChangeEvent): null | string {
    if (null == change.range) return null;
    const startOffset = oldDocument.offsetAt(change.range.start);
    const endOffset = oldDocument.offsetAt(change.range.end);
    const before = oldDocument.getText().substr(0, startOffset);
    const after = oldDocument.getText().substr(endOffset);
    return `${before}${change.text}${after}`;
  }

  private getCacheKey(from: TextDocumentPositionParams): string {
    const position = { position: from.position, uri: from.textDocument.uri };
    const word = getWordAtPosition(this.session, position);
    return JSON.stringify(word);
  }

  private clearCache(): void {
    this.eventCache = new Map();
  }
}
