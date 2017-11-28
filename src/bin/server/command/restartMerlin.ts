// import { remote } from "../../../lib";
import Session from "../session";

export default async function(session: Session): Promise<void> {
  // await session.connection.sendRequest(remote.client.clearDiagnostics);
  session.merlin.restart();
}
