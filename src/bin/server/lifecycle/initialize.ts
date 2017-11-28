import * as server from "vscode-languageserver";
import { ISettings } from "../../../lib";
import capabilities from "../capabilities";
import Session from "../session";

export default function(
  session: Session,
): server.RequestHandler<
  server.InitializeParams,
  server.InitializeResult,
  server.InitializeError
> {
  return async event => {
    (session.initConf as any) = event;
    session.settings.reason = event.initializationOptions
      ? event.initializationOptions
      : ISettings.defaults.reason;
    await session.initialize();
    return { capabilities };
  };
}
