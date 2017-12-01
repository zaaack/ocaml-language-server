import * as server from "vscode-languageserver";
import { types } from "../../../lib";
import * as command from "../command";
import Session from "../session";

export default function(
  session: Session,
): server.RequestHandler<
  server.DocumentFormattingParams,
  types.TextEdit[],
  void
> {
  return async (event, token) => {
    if (token.isCancellationRequested) return [];

    const result = await command.getTextDocument(session, event.textDocument);
    if (token.isCancellationRequested) return [];
    if (!result) return [];

    const document = types.TextDocument.create(
      event.textDocument.uri,
      result.languageId,
      result.version,
      result.getText(),
    );

    let otxt: null | string = null;
    if (document.languageId === "ocaml")
      otxt = await command.getFormatted.ocpIndent(session, document);
    if (document.languageId === "reason")
      otxt = await command.getFormatted.refmt(session, document);
    if (token.isCancellationRequested) return [];
    if (otxt == null || otxt === "") return [];

    const edits: types.TextEdit[] = [];
    edits.push(
      types.TextEdit.replace(
        types.Range.create(
          document.positionAt(0),
          document.positionAt(result.getText().length),
        ),
        otxt,
      ),
    );
    return edits;
  };
}
