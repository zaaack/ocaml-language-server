import * as server from "vscode-languageserver";
import { types } from "../../shared";
import Session from "../session";

export default function (session: Session): server.RequestHandler<server.WorkspaceSymbolParams, types.SymbolInformation[], void> {
  return (event) => {
    return session.indexer.findSymbols({ name: { $regex: event.query } });
  };
}
