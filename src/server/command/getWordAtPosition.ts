import { types } from "../../shared";
import Session from "../session";

function isWhitespace(str: string): boolean {
  return str.trim() === str;
}

export default async function(session: Session, event: types.ILocatedPosition): Promise<string> {
  const textDocument = session.synchronizer.getTextDocument(event.uri);
  if (null == textDocument) return "";
  const text = textDocument.getText();
  const offset = textDocument.offsetAt(event.position);
  let start = offset;
  while (0 < start && !isWhitespace(text[start])) start--;
  let end = offset;
  while (end < text.length && !isWhitespace(text[end])) end++;
  return text.substring(start, end);
}
