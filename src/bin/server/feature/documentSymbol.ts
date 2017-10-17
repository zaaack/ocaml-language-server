import * as server from "vscode-languageserver";
import { merlin, types } from "../../../lib";
import Session from "../session";

export default function (session: Session): server.RequestHandler<server.DocumentSymbolParams, types.SymbolInformation[], void> {
  return async (event, token) => {
    const request = merlin.Query.outline();
    const response = await session.merlin.query(request, event.textDocument, Infinity);
    if (token.isCancellationRequested || response.class !== "return") return [];
    const symbols = merlin.Outline.intoCode(response.value, event.textDocument);
    return symbols;
  };
}
