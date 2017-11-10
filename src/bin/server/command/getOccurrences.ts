import { TextDocumentPositionParams } from "vscode-languageserver";
import { merlin } from "../../../lib";
import { ILocation } from "../../../lib/merlin/ordinal";
import Session from "../session";

export default async (
  session: Session,
  event: TextDocumentPositionParams,
  priority: number = 0,
): Promise<null | merlin.ILocation[]> => {
  const __: ILocation | null = null;
  void __; // tslint:disable-line no-unused-expression
  const position = merlin.Position.fromCode(event.position);
  const request = merlin.Query.occurrences.ident.at(position);
  const response = await session.merlin.query(
    request,
    null,
    event.textDocument,
    priority,
  );
  if (response.class !== "return") return null;
  return response.value;
};
