import * as server from "vscode-languageserver";
import { merlin, types } from "../../../lib";
import Session from "../session";

export default function(
  session: Session,
): server.RequestHandler<
  server.DocumentSymbolParams,
  types.SymbolInformation[],
  void
> {
  return async (event, token) => {
    if (token.isCancellationRequested) return [];

    const request = merlin.Query.outline();
    const response = await session.merlin.query(
      request,
      token,
      event.textDocument,
      Infinity,
    );
    if (token.isCancellationRequested) return [];
    if (response.class !== "return") return [];

    const symbols = merlin.Outline.intoCode(response.value, event.textDocument);
    return symbols;
  };
}
