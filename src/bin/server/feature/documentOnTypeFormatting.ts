import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";

export default function(
  _session: Session,
): LSP.RequestHandler<LSP.DocumentOnTypeFormattingParams, LSP.TextEdit[], void> {
  return async (_event, _token) => {
    return new LSP.ResponseError(-1, "onDocumentOnTypeFormatting: not implemented", undefined);
  };
}
