import * as async from "async";
import * as childProcess from "child_process";
import * as _ from "lodash";
import * as readline from "readline";
import * as server from "vscode-languageserver";
import Uri from "vscode-uri";
import { merlin, types } from "../../../lib";
import Session from "../session";

export default class Merlin implements server.Disposable {
  private readonly queue: async.AsyncPriorityQueue<merlin.Task>;
  private readline: readline.ReadLine;
  private process: childProcess.ChildProcess;

  constructor(private readonly session: Session) {
    this.queue = async.priorityQueue((task, callback) => {
      const begunProcessing = new Date();
      const logMessage = (result: any) => {
        if (this.session.settings.reason.diagnostics.merlinPerfLogging) {
          const queueDuration =
            begunProcessing.getTime() - task.enqueuedAt.getTime();
          const merlinDuration =
            new Date().getTime() - begunProcessing.getTime();
          this.session.log(
            `(${this.queue.length()}) Task ${JSON.stringify(
              task.task,
            )} was in the queue for ${queueDuration} ms and took ${
              merlinDuration
            } ms to process.`,
          );
        }
        return result;
      };

      if (task.token && task.token.isCancellationRequested) {
        return callback({
          class: "canceled",
          value: "Request has been canceled.",
        });
      }
      this.readline.question(
        JSON.stringify(task.task),
        _.flow(JSON.parse, logMessage, callback),
      );
    }, 1);
  }

  public dispose(): void {
    this.readline.close();
  }

  public initialize(): void {
    const ocamlmerlin = this.session.settings.reason.path.ocamlmerlin;
    const cwd = this.session.initConf.rootUri || this.session.initConf.rootPath;
    const options = cwd ? { cwd: Uri.parse(cwd).fsPath } : {};
    this.process = this.session.environment.spawn(ocamlmerlin, [], options);

    this.process.on("error", (error: Error & { code: string }) => {
      if (error.code === "ENOENT") {
        const msg = `Cannot find merlin binary at "${ocamlmerlin}".`;
        this.session.connection.window.showWarningMessage(msg);
        this.session.connection.window.showWarningMessage(
          `Double check your path or try configuring "reason.path.ocamlmerlin" under "User Settings".`,
        );
        this.dispose();
        throw error;
      }
    });

    this.process.stderr.on("data", (data: string) => {
      this.session.connection.window.showErrorMessage(
        `ocamlmerlin error: ${data}`,
      );
    });

    this.readline = readline.createInterface({
      input: this.process.stdout,
      output: this.process.stdin,
      terminal: false,
    });
  }

  public query<I, O>(
    { query }: merlin.Query<I, O>,
    token: server.CancellationToken | null,
    id?: types.TextDocumentIdentifier,
    priority: number = 0,
  ): merlin.Response<O> {
    const context: ["auto", string] | undefined = id
      ? ["auto", Uri.parse(id.uri).fsPath]
      : undefined;
    const request = context ? { context, query } : query;
    return new Promise(resolve =>
      this.queue.push(new merlin.Task(request, token), priority, resolve),
    );
  }

  public sync<I, O>(
    { sync: query }: merlin.Sync<I, O>,
    id?: types.TextDocumentIdentifier,
    priority: number = 0,
  ): merlin.Response<O> {
    const context: ["auto", string] | undefined = id
      ? ["auto", Uri.parse(id.uri).fsPath]
      : undefined;
    const request = context ? { context, query } : query;
    return new Promise(resolve =>
      this.queue.push(new merlin.Task(request), priority, resolve),
    );
  }
}
