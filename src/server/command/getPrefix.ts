import * as server from "vscode-languageserver";
import { remote } from "../../shared";
import Session from "../session";

export default async function(session: Session, event: server.TextDocumentPositionParams): Promise<null | string> {
  return session.connection.sendRequest<null | string>(remote.client.givePrefix.method, event);
}
