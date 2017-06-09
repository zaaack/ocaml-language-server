import { types } from "../../shared";
import Session from "../session";

function isIdentifierCharacter(str: string): boolean {
  return /^[a-zA-Z0-9_']$/.test(str);
}

export default function(session: Session, event: types.ILocatedPosition): {
  word: string,
  wordStartOffset?: number,
} {
  const textDocument = session.synchronizer.getTextDocument(event.uri);
  if (null == textDocument) return { word: "" };
  const text = textDocument.getText();
  const offset = textDocument.offsetAt(event.position);
  let start = offset;
  while (0 < start && isIdentifierCharacter(text[start])) start--;
  let end = offset;
  while (end < text.length && isIdentifierCharacter(text[end])) end++;
  return { word: text.substring(start, end), wordStartOffset: start };
}
