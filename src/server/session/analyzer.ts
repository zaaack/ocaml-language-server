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
  private bsbDiagnostics: { [key: string]: types.Diagnostic[] };

  constructor(session: Session) {
    this.session = session;
    return this;
  }

  public clear(event: types.TextDocumentIdentifier): void {
    if (this.bsbDiagnostics[event.uri].length > 0 && this.bsbDiagnostics[event.uri][0].source !== "bucklescript") {
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
    this.refreshImmediate = this.refreshWithKind(server.TextDocumentSyncKind.Full);
    this.refreshDebounced = _.debounce(
      this.refreshWithKind(server.TextDocumentSyncKind.Incremental),
      this.session.settings.reason.debounce.linter,
      { trailing: true },
    );
  }

  public refreshWithKind(syncKind: server.TextDocumentSyncKind): (id: types.TextDocumentIdentifier) => Promise<void> {
    return async (id) => {

      this.bsbDiagnostics = {};
      this.bsbDiagnostics[id.uri] = [];

      if (syncKind === server.TextDocumentSyncKind.Full) {
        this.refreshDebounced.cancel();
        const bsbProcess = new processes.BuckleScript(this.session).process;
        const bsbOutput = await new Promise<string>((resolve, reject) => {
          let buffer = "";
          bsbProcess.stdout.on("error", (error: Error) => reject(error));
          bsbProcess.stdout.on("data", (data: Buffer | string) => buffer += data.toString());
          bsbProcess.stdout.on("end", () => resolve(buffer));
        });

        const reErrors = new RegExp ([
          /(?:We've found a bug for you!|Warning number \d+)\n\s*/, // Heading of the error / warning
          /(.*), from l(\d*)-c(\d*) to l(\d*)-c(\d*)\n  \n/, // Capturing file name and lines / indexes
          /(?:.|\n)*?\n  \n/, // Ignoring actual lines content being printed
          /((?:.|\n)*?)\n/, // Capturing error / warning message
          // TODO: Improve message tail/ending pattern in Bucklescript to ease this detection
          /(?:\[\d+\/\d+\] (?:\x1b\[[0-9;]*?m)?Building|ninja: build stopped:)/, // Tail
        ].map((r) => r.source).join(""), "g");

        let errorMatch;

        while (errorMatch = reErrors.exec(bsbOutput)) {
          const fileUri = "file://" + errorMatch[1];
          const startLine = Number(errorMatch[2]) - 1;
          const startCharacter = Number(errorMatch[3]);
          const endLine = Number(errorMatch[4]) - 1;
          const endCharacter = Number(errorMatch[5]);
          const message = errorMatch[6].replace(/\n  /g, "\n");

          const bsbDiagnostic: types.Diagnostic = {
            code: "",
            message,
            range: {
              end: {
                character: endCharacter,
                line: endLine,
              },
              start: {
                character: startCharacter,
                line: startLine,
              },
            },
            severity: /^Warning number \d+/.exec(errorMatch[0]) ? types.DiagnosticSeverity.Warning : types.DiagnosticSeverity.Error,
            source: "bucklescript",
          };

          if (!this.bsbDiagnostics[fileUri]) { this.bsbDiagnostics[fileUri] = []; }
          this.bsbDiagnostics[fileUri].push(bsbDiagnostic);
        }
        Object.keys(this.bsbDiagnostics).forEach((fileUri) => {
          this.session.connection.sendDiagnostics({ diagnostics: this.bsbDiagnostics[fileUri], uri: fileUri });
        });
      }
      if (syncKind !== server.TextDocumentSyncKind.Full || this.bsbDiagnostics[id.uri].length === 0) {
        if (syncKind === server.TextDocumentSyncKind.Full) {
          const document = await command.getTextDocument(this.session, id);
          if (null != document) await this.session.merlin.sync(merlin.Sync.tell("start", "end", document.getText()), id);
        }
        const errors = await this.session.merlin.query(merlin.Query.errors(), id);
        if (errors.class !== "return") return;
        const diagnostics: types.Diagnostic[] = [];
        for (const report of errors.value) diagnostics.push(await merlin.IErrorReport.intoCode(this.session, id, report));
        this.session.connection.sendDiagnostics({ diagnostics, uri: id.uri });
      }
    };
  }
}
