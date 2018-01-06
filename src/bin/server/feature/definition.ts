import * as LSP from "vscode-languageserver-protocol";
import URI from "vscode-uri";
import { merlin } from "../../../lib";
import Session from "../session";

export default function(session: Session): LSP.RequestHandler<LSP.TextDocumentPositionParams, LSP.Definition, void> {
  return async (event, token) => {
    if (token.isCancellationRequested) return [];

    const find = async (kind: "ml" | "mli"): Promise<null | LSP.Location> => {
      const request = merlin.Query.locate(null, kind).at(merlin.Position.fromCode(event.position));
      const response = await session.merlin.query(request, token, event.textDocument);
      if (response.class !== "return" || response.value.pos == null) return null;
      const value = response.value;
      const uri = value.file ? URI.file(value.file).toString() : event.textDocument.uri;
      const position = merlin.Position.intoCode(value.pos);
      const range = LSP.Range.create(position, position);
      const location = LSP.Location.create(uri, range);
      return location;
    };

    const locML = await find("ml");
    if (token.isCancellationRequested) return [];

    // const locMLI = await find("mli"");

    const locations: LSP.Location[] = [];
    if (locML) locations.push(locML);
    // if (locMLI) locations.push(locMLI);

    return locations;
  };
}
