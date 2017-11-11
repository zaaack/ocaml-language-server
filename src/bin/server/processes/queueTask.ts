import * as server from "vscode-languageserver";

export default class QueueTask {
  constructor(
    readonly task: any,
    readonly token: server.CancellationToken | null = null,
  ) {}
}
