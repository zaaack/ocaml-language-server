import * as path from "path";
import * as server from "vscode-languageserver";
import URI from "vscode-uri";
import * as command from "../command";
import Session from "../session";

export default function(
  session: Session,
): server.NotificationHandler<server.DidChangeWatchedFilesParams> {
  return async event => {
    for (const id of event.changes) {
      const p = path.parse(URI.parse(id.uri).path);
      if (".ml" === p.ext) {
        await session.indexer.refreshSymbols(id);
      }
      if (".re" === p.ext) {
        await session.indexer.refreshSymbols(id);
      }
      if (".merlin" === p.base) {
        await command.restartMerlin(session);
      }
      if ("command-exec" === p.name) {
        await command.restartMerlin(session);
      }
    }
  };
}
