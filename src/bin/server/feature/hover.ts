import * as server from "vscode-languageserver";
import { parser, types } from "../../../lib";
import * as command from "../command";
import Session from "../session";

export default function(
  session: Session,
): server.RequestHandler<server.TextDocumentPositionParams, types.Hover, void> {
  return async (event, token) => {
    if (token.isCancellationRequested) return { contents: [] };

    const position = { position: event.position, uri: event.textDocument.uri };
    const word = await command.getWordAtPosition(session, position);
    if (token.isCancellationRequested) return { contents: [] };

    const markedStrings: types.MarkedString[] = [];
    const itemType = await command.getType(session, event, token);
    if (token.isCancellationRequested) return { contents: [] };

    const itemDocs = await command.getDocumentation(session, event);
    if (token.isCancellationRequested) return { contents: [] };

    if (itemType != null) {
      let language = "plaintext";
      if (/\.mli?/.test(event.textDocument.uri)) language = "ocaml.hover.type";
      if (/\.rei?/.test(event.textDocument.uri))
        language = /^[A-Z]/.test(word)
          ? "reason.hover.signature"
          : "reason.hover.type";
      markedStrings.push({ language, value: itemType.type });
      if (itemDocs != null && !parser.ocamldoc.ignore.test(itemDocs))
        markedStrings.push(parser.ocamldoc.intoMarkdown(itemDocs));
    }
    return { contents: markedStrings };
  };
}
