import server from "vscode-languageserver";
import { types } from "../../shared";
import command from "../command";
import Session from "../session";

export default function (session: Session): server.RequestHandler<types.TextDocumentIdentifier, string[], void> {
  return (event) => command.getMerlinFiles(session, event);
}
