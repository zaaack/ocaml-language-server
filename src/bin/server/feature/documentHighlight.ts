import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import * as command from "../command";
import Session from "../session";

export default function(
  session: Session,
): LSP.RequestHandler<
  LSP.TextDocumentPositionParams,
  LSP.DocumentHighlight[],
  void
> {
  return async (event, token) => {
    if (token.isCancellationRequested) return [];

    const occurrences = await command.getOccurrences(session, event, token);
    if (token.isCancellationRequested) return [];
    if (occurrences == null) return [];

    const highlights = occurrences.map(loc => {
      const range = merlin.Location.intoCode(loc);
      const kind = LSP.DocumentHighlightKind.Write;
      return LSP.DocumentHighlight.create(range, kind);
    });
    return highlights;
  };
}
