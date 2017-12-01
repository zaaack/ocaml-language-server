import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import Session from "../session";

export default function(
  session: Session,
): LSP.RequestHandler<LSP.DocumentSymbolParams, LSP.SymbolInformation[], void> {
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
