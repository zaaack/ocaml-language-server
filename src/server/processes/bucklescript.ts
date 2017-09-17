import { ChildProcess } from "child_process";
import Session from "../session";

export default class BuckleScript {
  public readonly process: ChildProcess;
  constructor(session: Session, argsOpt?: string[]) {
    const command = session.settings.reason.path.bsb;
    const args = argsOpt || [
      "-make-world",
    ];
    this.process = session.environment.spawn(command, args);
    return this;
  }
}
