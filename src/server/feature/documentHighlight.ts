import * as server from "vscode-languageserver";
import { merlin, types } from "../../shared";
import * as command from "../command";
import Session from "../session";

const METHOD_NAME = "textDocument/highlight";

export default function (session: Session): server.RequestHandler<server.TextDocumentPositionParams, types.DocumentHighlight[], void> {
  return async (event, token) => {
    const cachedResult = session.synchronizer.getCachedResult(METHOD_NAME, event);
    if (cachedResult) {
      return cachedResult;
    }

    const occurrences = await command.getOccurrences(session, event);
    if (token.isCancellationRequested) return [];
    if (occurrences == null) return [];
    const highlights = occurrences.map((loc) => {
      const range = merlin.Location.intoCode(loc);
      const kind = types.DocumentHighlightKind.Write;
      return types.DocumentHighlight.create(range, kind);
    });
    session.synchronizer.addCachedResult(METHOD_NAME, event, highlights);
    return highlights;
  };
}
