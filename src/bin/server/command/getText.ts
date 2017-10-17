import { types } from "../../../lib";
import Session from "../session";

export default async function (session: Session, event: types.Location): Promise<null | string> {
  const textDocument = session.synchronizer.getTextDocument(event.uri);
  if (null == textDocument) return null;
  return textDocument.getText();
}
