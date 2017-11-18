import { RequestType0 } from "vscode-jsonrpc";

export const clearDiagnostics = new RequestType0<void, void, void>(
  "reason.client.clearDiagnostics",
);
