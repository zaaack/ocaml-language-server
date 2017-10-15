import server from "vscode-languageserver";
import { merlin, types } from "../../shared";
import command from "../command";
import Session from "../session";

export default function (session: Session): server.RequestHandler<server.RenameParams, types.WorkspaceEdit, void> {
  return async (event, token) => {
    const occurrences = await command.getOccurrences(session, event);
    if (token.isCancellationRequested) return { changes: {} };
    if (occurrences == null) return { changes: {} };
    const renamings = occurrences.map((loc) => types.TextEdit.replace(merlin.Location.intoCode(loc), event.newName));
    // FIXME: versioning
    const documentChanges = [types.TextDocumentEdit.create(types.VersionedTextDocumentIdentifier.create(event.textDocument.uri, 0), renamings)];
    const edit: types.WorkspaceEdit = { documentChanges };
    return edit;
  };
}
