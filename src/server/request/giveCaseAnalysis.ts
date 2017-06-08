import * as server from "vscode-languageserver";
import { merlin, types } from "../../shared";
import Session from "../session";

export default function (session: Session): server.RequestHandler<types.ITextDocumentRange, null | merlin.Case.Destruct, void> {
  return async (event, token) => {
    const start = merlin.Position.fromCode(event.range.start);
    const end = merlin.Position.fromCode(event.range.end);
    const request = merlin.Query.kase.analysis.from(start).to(end);
    const response = await session.merlin.query(request, event.textDocument);
    if (token.isCancellationRequested) return null;
    if (response.class !== "return") throw response.value;
    return response.value;
  };
}
