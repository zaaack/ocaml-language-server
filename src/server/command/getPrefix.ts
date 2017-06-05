import * as server from "vscode-languageserver";
import Session from "../session";

export default async function(session: Session, event: server.TextDocumentPositionParams): Promise<null | string> {
  const document = session.synchronizer.getTextDocument(event.textDocument.uri);
  if (!document) {
    return null;
  }
  const startPosition = {
    character: 0,
    line: event.position.line,
  };
  const endPosition = event.position;
  const startOffset = document.offsetAt(startPosition);
  const endOffset = document.offsetAt(endPosition);
  return document.getText().substring(startOffset, endOffset);
}
