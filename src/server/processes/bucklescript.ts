import { ChildProcess } from "child_process";
import Session from "../session";

export default class BuckleScript {
  public readonly process: ChildProcess;
  constructor(session: Session, argsOpt?: string[]) {
    const command = "bsb"; // TODO get from some settings;
    const args = argsOpt || [
      "-make-world", // TODO run incrementally?
    ];
    this.process = session.environment.spawn(command, args);
    return this;
  }
}
