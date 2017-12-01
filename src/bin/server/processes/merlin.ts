import * as async from "async";
import * as childProcess from "child_process";
import * as _ from "lodash";
import * as readline from "readline";
import * as server from "vscode-languageserver";
import URI from "vscode-uri";
import { merlin, types } from "../../../lib";
import Session from "../session";

export default class Merlin implements server.Disposable {
  private readonly queue: async.AsyncPriorityQueue<merlin.Task>;
  private readonly readline: readline.ReadLine;
  private readonly process: childProcess.ChildProcess;

  constructor(private readonly session: Session) {}

  public dispose(): void {
    this.readline.close();
  }

  public async initialize(): Promise<void> {
    const ocamlmerlin = this.session.settings.reason.path.ocamlmerlin;
    const cwd = this.session.initConf.rootUri || this.session.initConf.rootPath;
    const options = cwd ? { cwd: URI.parse(cwd).fsPath } : {};

    (this.process as any) = this.session.environment.spawn(
      ocamlmerlin,
      [],
      options,
    );
    // this.process.on("exit", (code, signal) => {
    //   this.session.connection.console.log(JSON.stringify({ code, signal }));
    // });
    this.process.on("error", (error: Error & { code: string }) => {
      // this.session.connection.console.log(JSON.stringify({ error }));
      if (error.code === "ENOENT") {
        this.session.connection.window.showWarningMessage(
          `Cannot find merlin binary at "${ocamlmerlin}".`,
        );
        this.session.connection.window.showWarningMessage(
          `Double check your path or try configuring "reason.path.ocamlmerlin" under "User Settings".`,
        );
        throw error;
      }
    });
    this.process.stderr.on("data", (data: string) => {
      this.session.connection.window.showErrorMessage(
        `ocamlmerlin error: ${data}`,
      );
    });

    (this.readline as any) = readline.createInterface({
      input: this.process.stdout,
      output: this.process.stdin,
      terminal: false,
    });
    // this.readline.on("close", () => {
    //   this.session.connection.console.log("readline: close");
    // });

    const worker: async.AsyncWorker<merlin.Task, merlin.MerlinResponse<any>> = (
      task,
      callback,
    ) => {
      const begunProcessing = new Date();
      if (task.token && task.token.isCancellationRequested) {
        return callback({
          class: "canceled",
          value: "Request has been canceled.",
        });
      }
      this.readline.question(
        JSON.stringify(task.task),
        _.flow(JSON.parse, this.logMessage(begunProcessing, task), data => {
          // this.session.connection.console.log(JSON.stringify(data));
          return callback(data);
        }),
      );
    };
    (this.queue as any) = async.priorityQueue(worker, 1);

    this.establishProtocol();
  }

  public query<I, O>(
    { query }: merlin.Query<I, O>,
    token: server.CancellationToken | null,
    id?: types.TextDocumentIdentifier,
    priority: number = 0,
  ): merlin.Response<O> {
    // this.session.connection.console.log(
    //   JSON.stringify({ query, id, priority }),
    // );
    const context: ["auto", string] | undefined = id
      ? ["auto", URI.parse(id.uri).fsPath]
      : undefined;
    const request = context ? { context, query } : query;
    return new Promise(resolve =>
      this.queue.push(new merlin.Task(request, token), priority, resolve),
    );
  }

  public async restart(): Promise<void> {
    if (this.queue) {
      this.queue.kill();
      (this.queue as any) = null;
    }
    if (this.readline) {
      this.readline.close();
      (this.readline as any) = null;
    }
    if (this.process) {
      this.process.kill();
      (this.process as any) = null;
    }
    await this.initialize();
  }

  public sync<I, O>(
    { sync: query }: merlin.Sync<I, O>,
    id?: types.TextDocumentIdentifier,
    priority: number = 0,
  ): merlin.Response<O> {
    // this.session.connection.console.log(
    //   JSON.stringify({ query, id, priority }),
    // );
    const context: ["auto", string] | undefined = id
      ? ["auto", URI.parse(id.uri).fsPath]
      : undefined;
    const request = context ? { context, query } : query;
    return new Promise(resolve =>
      this.queue.push(new merlin.Task(request), priority, resolve),
    );
  }

  private async establishProtocol(): Promise<void> {
    const request = merlin.Sync.protocol.version.set(3);
    const response = await this.sync(request);
    if (response.class !== "return" || response.value.selected !== 3) {
      throw new Error("onInitialize: failed to establish protocol v3");
    }
  }

  private logMessage<A>(
    begunProcessing: Date,
    task: merlin.Task,
  ): (result: A) => A {
    return result => {
      if (
        this.session.settings.reason.diagnostics &&
        this.session.settings.reason.diagnostics.merlinPerfLogging
      ) {
        const queueDuration =
          begunProcessing.getTime() - task.enqueuedAt.getTime();
        const merlinDuration = new Date().getTime() - begunProcessing.getTime();
        this.session.connection.telemetry.logEvent(
          `(${this.queue.length()}) Task ${JSON.stringify(
            task.task,
          )} was in the queue for ${queueDuration} ms and took ${
            merlinDuration
          } ms to process.`,
        );
      }
      return result;
    };
  }
}
