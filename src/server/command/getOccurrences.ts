import * as server from "vscode-languageserver";
import { merlin } from "../../shared";
import Session from "../session";

export default async (session: Session, event: server.TextDocumentPositionParams, priority: number = 0): Promise<null | merlin.ILocation[]> => {
  const position = merlin.Position.fromCode(event.position);
  const request = merlin.Query.occurrences.ident.at(position);
  const response = await session.merlin.query(request, event.textDocument, priority);
  if (response.class !== "return") return null;
  return response.value;
};
