import { types } from "../../../lib";
import Session from "../session";

export default async function(
  session: Session,
  event: types.TextDocumentIdentifier,
): Promise<null | types.TextDocument> {
  return session.synchronizer.getTextDocument(event.uri);
}
