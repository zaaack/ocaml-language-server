import * as server from "vscode-languageserver";
import { types } from "../../../lib";
import Session from "../session";

export default function(
  _session: Session,
): server.RequestHandler<
  server.DocumentOnTypeFormattingParams,
  types.TextEdit[],
  void
> {
  return async (_event, _token) => {
    return new server.ResponseError(
      -1,
      "onDocumentOnTypeFormatting: not implemented",
      undefined,
    );
  };
}
