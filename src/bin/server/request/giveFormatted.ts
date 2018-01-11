import * as LSP from "vscode-languageserver-protocol";
import * as command from "../command";
import Session from "../session";

export default function(session: Session): LSP.RequestHandler<LSP.TextDocumentItem, string | null, void> {
  return event => {
    const textDoc = LSP.TextDocument.create(event.uri, event.languageId, event.version, event.text);
    return command.getFormatted.refmt(session, textDoc);
  };
}
