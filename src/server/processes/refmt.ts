import { ChildProcess } from "child_process";
import { types } from "../../shared";
import Session from "../session";

export default class ReFMT {
  public readonly process: ChildProcess;
  constructor(session: Session, id?: types.TextDocumentIdentifier, argsOpt?: string[]) {
    const uri = id ? id.uri : ".re";
    const command = session.settings.reason.path.refmt;
    const args = argsOpt || [
      "--parse", "re",
      "--print", "re",
      "--interface", `${/\.rei$/.test(uri)}`,
    ];
    this.process = session.environment.spawn(command, args);
    return this;
  }
}
