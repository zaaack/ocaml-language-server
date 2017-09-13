import * as _ from "lodash";
import * as rpc from "vscode-jsonrpc";
import * as server from "vscode-languageserver";
import { merlin, types } from "../../shared";
import * as command from "../command";
import * as processes from "../processes";
import Session from "./index";

export default class Analyzer implements rpc.Disposable {
  public refreshImmediate: ((event: types.TextDocumentIdentifier) => Promise<void>);
  public refreshDebounced: ((event: types.TextDocumentIdentifier) => Promise<void>) & _.Cancelable;
  private session: Session;

  constructor(session: Session) {
    this.session = session;
    return this;
  }

  public clear(event: types.TextDocumentIdentifier): void {
    this.session.connection.sendDiagnostics({
      diagnostics: [],
      uri: event.uri,
    });
  }

  public dispose(): void {
    return;
  }

  public async initialize(): Promise<void> {
    this.onDidChangeConfiguration();
  }

  public onDidChangeConfiguration(): void {
    this.refreshImmediate = this.refreshWithKind(server.TextDocumentSyncKind.Full);
    this.refreshDebounced = _.debounce(
      this.refreshWithKind(server.TextDocumentSyncKind.Incremental),
      this.session.settings.reason.debounce.linter,
      { trailing: true },
    );
  }

  public refreshWithKind(syncKind: server.TextDocumentSyncKind): (id: types.TextDocumentIdentifier) => Promise<void> {
    return async (id) => {
      if (syncKind === server.TextDocumentSyncKind.Full) {
        const document = await command.getTextDocument(this.session, id);
        if (null != document) await this.session.merlin.sync(merlin.Sync.tell("start", "end", document.getText()), id);
      }
      const errors = await this.session.merlin.query(merlin.Query.errors(), id);
      if (errors.class !== "return") return;
      let diagnostics: types.Diagnostic[] = [];
      for (const report of errors.value) diagnostics.push(await merlin.IErrorReport.intoCode(this.session, id, report));

      // TEMP EXPERIMENT
      const bsb = new processes.BuckleScript(this.session).process;
      const bsbout = await new Promise<string>((resolve, reject) => {
        let buffer = "";
        bsb.stdout.on("error", (error: Error) => reject(error));
        bsb.stdout.on("data", (data: Buffer | string) => buffer += data.toString());
        bsb.stdout.on("end", () => resolve(buffer));
      });
      const bsbRegexp = /We've found a bug for you!\s*(\S*)\s*(\d+).+\s*([\S\s]*)ninja: build stopped: subcommand failed\./;
      const match = bsbRegexp.exec(bsbout);
      if (match) {
        diagnostics = [
          {
            code: "",
            message: match[3],
            range: {
              end: {
                character: 24, // TODO
                line: Number(match[2]) - 1,
              },
              start: {
                character: 13, // TODO
                line: Number(match[2]) - 1,
              },
            },
            severity: 1,
            source: "bucklescript",
          },
        ];
      }
      // END - TEMP EXPERIMENT

      this.session.connection.sendDiagnostics({ diagnostics, uri: id.uri });
    };
  }
}
