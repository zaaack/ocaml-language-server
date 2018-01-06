import * as LSP from "vscode-languageserver-protocol";
import * as command from "../command";
import Session from "../session";

export default function(session: Session): LSP.RequestHandler<LSP.DocumentFormattingParams, LSP.TextEdit[], void> {
  return async (event, token) => {
    if (token.isCancellationRequested) return [];

    const result = await command.getTextDocument(session, event.textDocument);
    if (token.isCancellationRequested) return [];
    if (!result) return [];

    const document = LSP.TextDocument.create(
      event.textDocument.uri,
      result.languageId,
      result.version,
      result.getText(),
    );

    let otxt: null | string = null;
    if (document.languageId === "ocaml") otxt = await command.getFormatted.ocpIndent(session, document);
    if (document.languageId === "reason") otxt = await command.getFormatted.refmt(session, document);
    if (token.isCancellationRequested) return [];
    if (otxt == null || otxt === "") return [];

    const edits: LSP.TextEdit[] = [];
    edits.push(
      LSP.TextEdit.replace(
        LSP.Range.create(document.positionAt(0), document.positionAt(result.getText().length)),
        otxt,
      ),
    );
    return edits;
  };
}
