import * as LSP from "vscode-languageserver-protocol";
import * as command from "../command";
import Session from "../session";

export default function(session: Session): LSP.RequestHandler<LSP.CodeLens, LSP.CodeLens, void> {
  return async (event, token) => {
    if (token.isCancellationRequested) return event;

    const data: LSP.SymbolInformation & {
      event: LSP.TextDocumentPositionParams;
      fileKind: "ml" | "re";
    } =
      event.data;
    const itemType = await command.getType(session, data.event, token, 1);
    if (token.isCancellationRequested) return event;
    if (itemType == null) return event;

    event.command = { command: "", title: itemType.type };
    if ("re" === data.fileKind) event.command.title = event.command.title.replace(/ : /g, ": ");

    if (!session.settings.reason.codelens.unicode) return event;
    if ("ml" === data.fileKind) event.command.title = event.command.title.replace(/->/g, "→");
    if ("ml" === data.fileKind) event.command.title = event.command.title.replace(/\*/g, "×");
    if ("re" === data.fileKind) event.command.title = event.command.title.replace(/=>/g, "⇒");

    return event;
  };
}
