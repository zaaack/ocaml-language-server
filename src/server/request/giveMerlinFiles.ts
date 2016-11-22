import * as server from "vscode-languageserver";
import { types } from "../../shared";
import * as command from "../command";
import Session from "../session";

export default function (session: Session): server.RequestHandler<types.TextDocumentIdentifier, Promise<string[]>, void> {
  return (event) => command.getMerlinFiles(session, event);
}
