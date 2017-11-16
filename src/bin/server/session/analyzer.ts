import * as _ from "lodash";
import * as server from "vscode-languageserver";
import { merlin, parser, types } from "../../../lib";
import * as command from "../command";
import * as processes from "../processes";
import Session from "./index";

export default class Analyzer implements server.Disposable {
  public readonly refreshImmediate: ((
    event: types.TextDocumentIdentifier,
  ) => Promise<void>);
  public readonly refreshDebounced: ((
    event: types.TextDocumentIdentifier,
  ) => Promise<void>) &
    _.Cancelable;
  private readonly bsbDiagnostics: { [key: string]: types.Diagnostic[] } = {};
  private _refreshCancellationTokenSource: server.CancellationTokenSource = new server.CancellationTokenSource();

  constructor(private readonly session: Session) {}

  public clear(event: types.TextDocumentIdentifier): void {
    if (
      this.bsbDiagnostics[event.uri] &&
      this.bsbDiagnostics[event.uri][0] &&
      this.bsbDiagnostics[event.uri][0].source !== "bucklescript"
    ) {
      this.session.connection.sendDiagnostics({
        diagnostics: [],
        uri: event.uri,
      });
    }
  }

  public dispose(): void {
    return;
  }

  public async initialize(): Promise<void> {
    this.onDidChangeConfiguration();
  }

  public onDidChangeConfiguration(): void {
    (this.refreshImmediate as any) = this.refreshWithKind(
      server.TextDocumentSyncKind.Full,
    );
    (this.refreshDebounced as any) = _.debounce(
      this.refreshWithKind(server.TextDocumentSyncKind.Incremental),
      this.session.settings.reason.debounce.linter,
      { trailing: true },
    );
  }

  public refreshWithKind(
    syncKind: server.TextDocumentSyncKind,
  ): (id: types.TextDocumentIdentifier) => Promise<void> {
    return async id => {
      const tools: Set<string> = new Set(
        this.session.settings.reason.diagnostics.tools,
      );
      if (tools.size < 1) return;

      // Reset state for every run. This currently can hide valid warnings in some cases
      // as they are not cached, but the alternative (trying to keep track of them) will
      // probably be worse. See https://github.com/BuckleScript/bucklescript/issues/2024
      Object.keys(this.bsbDiagnostics).forEach(fileUri => {
        this.bsbDiagnostics[fileUri] = [];
      });
      this.bsbDiagnostics[id.uri] = [];

      if (tools.has("bsb") && syncKind === server.TextDocumentSyncKind.Full) {
        this.refreshDebounced.cancel();
        const bsbProcess = new processes.BuckleScript(this.session);
        const bsbOutput = await bsbProcess.run();

        const diagnostics = parser.bucklescript.parseErrors(bsbOutput);
        Object.keys(diagnostics).forEach(fileUri => {
          if (!this.bsbDiagnostics[fileUri]) {
            this.bsbDiagnostics[fileUri] = [];
          }
          this.bsbDiagnostics[fileUri] = this.bsbDiagnostics[fileUri].concat(
            diagnostics[fileUri],
          );
        });

        Object.keys(this.bsbDiagnostics).forEach(fileUri => {
          this.session.connection.sendDiagnostics({
            diagnostics: this.bsbDiagnostics[fileUri],
            uri: fileUri,
          });
          if (this.bsbDiagnostics[fileUri].length === 0) {
            delete this.bsbDiagnostics[fileUri];
          }
        });
      } else if (tools.has("merlin")) {
        if (syncKind === server.TextDocumentSyncKind.Full) {
          const document = await command.getTextDocument(this.session, id);
          if (null != document)
            await this.session.merlin.sync(
              merlin.Sync.tell("start", "end", document.getText()),
              id,
            );
        }

        this._refreshCancellationTokenSource.cancel();
        this._refreshCancellationTokenSource = new server.CancellationTokenSource();
        const errors = await this.session.merlin.query(
          merlin.Query.errors(),
          this._refreshCancellationTokenSource.token,
          id,
        );
        if (errors.class !== "return") return;
        const diagnostics: types.Diagnostic[] = [];
        for (const report of errors.value)
          diagnostics.push(
            await merlin.IErrorReport.intoCode(this.session, id, report),
          );
        this.session.connection.sendDiagnostics({ diagnostics, uri: id.uri });
      }
    };
  }
}
