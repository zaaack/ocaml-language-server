import * as server from "vscode-languageserver";
import { merlin } from "../../../lib";
import Session from "../session";

export default async function(
  session: Session,
  token: server.CancellationToken | null,
  event: server.TextDocumentIdentifier,
  priority: number = 0,
): Promise<string[]> {
  const request = merlin.Query.project.get();
  const response = await session.merlin.query(request, token, event, priority);
  if (response.class !== "return") return [];
  return response.value.result;
}
