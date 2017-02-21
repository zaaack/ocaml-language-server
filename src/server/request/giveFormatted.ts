import * as server from "vscode-languageserver";
import { types } from "../../shared";
import * as command from "../command";
import Session from "../session";

export default function (session: Session): server.RequestHandler<types.UnformattedTextDocument, string | null, void> {
  return (event) => {
    const textDoc = types.TextDocument.create(event.uri, event.languageId, event.version, event.content);
    return command.getFormatted.refmt(session, textDoc);
  }
}
