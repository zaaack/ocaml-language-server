import { types } from "../../shared";
import Session from "../session";

export default async function(session: Session, event: types.Location): Promise<string | undefined> {
  const textDocument = session.synchronizer.getTextDocument(event.uri);
  if (textDocument) {
    return textDocument.getText();
  } else {
    return undefined;
  }
}
