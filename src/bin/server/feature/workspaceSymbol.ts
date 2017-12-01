import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";

export default function(
  session: Session,
): LSP.RequestHandler<
  LSP.WorkspaceSymbolParams,
  LSP.SymbolInformation[],
  void
> {
  return event => {
    return session.indexer.findSymbols({ name: { $regex: event.query } });
  };
}
