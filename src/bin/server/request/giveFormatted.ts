import * as LSP from "vscode-languageserver-protocol";
import { types } from "../../../lib";
import * as command from "../command";
import Session from "../session";

export default function(
  session: Session,
): LSP.RequestHandler<types.IUnformattedTextDocument, string | null, void> {
  return event => {
    const textDoc = LSP.TextDocument.create(
      event.uri,
      event.languageId,
      event.version,
      event.content,
    );
    return command.getFormatted.refmt(session, textDoc);
  };
}
