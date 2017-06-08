import { types } from "../../shared";
import Session from "../session";

function isWhitespace(str: string): boolean {
  return str.trim() === str;
}

export default async function(session: Session, event: types.ILocatedPosition): Promise<string> {
  const textDocument = session.synchronizer.getTextDocument(event.uri);
  if (!textDocument) {
    return "";
  }

  const text = textDocument.getText();
  const offset = textDocument.offsetAt(event.position);
  let startIndex = offset;
  while (startIndex >= 0 && !isWhitespace(text[startIndex])) {
    startIndex--;
  }
  let endIndex = offset;
  while (endIndex < text.length && !isWhitespace(text[endIndex])) {
    endIndex++;
  }
  return text.substring(startIndex, endIndex);
}
