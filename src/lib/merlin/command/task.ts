import * as server from "vscode-languageserver";

export class Task {
  constructor(
    readonly task: any,
    readonly token: server.CancellationToken | null = null,
    readonly enqueuedAt: Date = new Date(),
  ) {}
}
