import * as server from "vscode-languageserver";
import { merlin } from "../../../lib";
import Session from "../session";

export default async function (session: Session, event: server.TextDocumentIdentifier, priority: number = 0): Promise<string[]> {
  const request = merlin.Query.project.get();
  const response = await session.merlin.query(request, event, priority);
  if (response.class !== "return") return [];
  return response.value.result;
}
