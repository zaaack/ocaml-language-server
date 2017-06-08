import * as rpc from "vscode-jsonrpc";
import { merlin, types } from "../../shared";
import { TextDocumentContentChangeEvent } from "../../shared/types";
import Session from "./index";

/**
 * Document synchronizer for the session.
 */
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
      for (const change of event.contentChanges) {
        if (change && change.range) {
          const oldDocument = this.textDocuments.get(event.textDocument.uri);
          if (oldDocument) {
            const newContent = this.applyChangesToTextDocumentContent(oldDocument, change);
            if (newContent) {
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

  public onDidChangeConfiguration(): void {
    return;
  }

  public getTextDocument(uri: string): types.TextDocument | undefined {
    return this.textDocuments.get(uri);
  }

  private applyChangesToTextDocumentContent(oldDocument: types.TextDocument, change: TextDocumentContentChangeEvent): string | null {
    if (!change.range) {
      return null;
    }
    const startOffset = oldDocument.offsetAt(change.range.start);
    const endOffset = oldDocument.offsetAt(change.range.end);
    const before = oldDocument.getText().substr(0, startOffset);
    const after = oldDocument.getText().substr(endOffset);
    return before + change.text + after;
  }
}
