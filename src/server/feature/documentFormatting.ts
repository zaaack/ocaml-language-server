import * as server from "vscode-languageserver";
import { types } from "../../shared";
import * as command from "../command";
import Session from "../session";

export default function (session: Session): server.RequestHandler<server.DocumentFormattingParams, types.TextEdit[], void> {
  return async (event, token) => {
    const result = await command.getTextDocument(session, event.textDocument);
    if (null == result) return [];
    const document = types.TextDocument.create(event.textDocument.uri, result.languageId, result.version, result.getText());
    if (token.isCancellationRequested) return [];
    let otxt: null | string = null;
    if (document.languageId === "ocaml") {
      otxt = await command.getFormatted.ocpIndent(session, document);
    } else if (document.languageId === "reason") {
      otxt = await command.getFormatted.refmt(session, document);
    } else {
      session.connection.window.showErrorMessage(
        `Can't format this file: its language ID is ${document.languageId}, which is not "ocaml" or "reason".`,
      );
    }
    if (token.isCancellationRequested) return [];
    if (otxt == null) return [];
    const edits: types.TextEdit[] = [];
    edits.push(
      types.TextEdit.replace(
        types.Range.create(
          document.positionAt(0),
          document.positionAt(result.getText().length)),
        otxt));
    return edits;
  };
}
