import { ChildProcess } from "child_process";
import * as childProcess from "child_process";
import { types } from "../../shared";
import Session from "../session";

export default class ReFMT {
  public readonly process: ChildProcess;
  constructor(session: Session, id?: types.TextDocumentIdentifier, argsOpt?: string[]) {
    const dependencyEnv = session.environment.hasDependencyEnv
      ? `eval $((${session.environment.workspaceRoot()}/node_modules/.bin/dependencyEnv) || true) &&`
      : "";
    const uri = id ? id.uri : ".re";
    const refmt = session.settings.reason.path.refmt;
    const refmtArgs = argsOpt || [
      "-use-stdin", "true",
      "-parse", "re",
      "-print", "re",
      "-is-interface-pp", `${/\.rei$/.test(uri)}`,
    ];
    const command = `${dependencyEnv} ${refmt} ${refmtArgs.join(" ")}`;
    this.process = childProcess.spawn("sh", ["-c", command]);
    return this;
  }
}
