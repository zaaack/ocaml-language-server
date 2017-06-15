import { ChildProcess, SpawnOptions } from "child_process";
import * as childProcess from "child_process";
import * as path from "path";
import * as URL from "url";
import * as rpc from "vscode-jsonrpc";
import { types } from "../../shared";
import Session from "./index";

const fileSchemeLength = "file://".length - 1;

export default class Environment implements rpc.Disposable {
  public static pathToUri(path: string): types.TextDocumentIdentifier {
    const uri = URL.format(URL.parse(`file://${path}`));
    return { uri };
  }

  public static uriToPath({ uri }: types.TextDocumentIdentifier): string {
    return uri.substr(fileSchemeLength);
  }

  private preamble: null | string = null;
  private readonly session: Session;

  constructor(session: Session) {
    this.session = session;
    return this;
  }

  public dispose(): void {
    return;
  }

  public async initialize(): Promise<void> {
    await this.detectDependencyEnv();
  }

  public relativize(id: types.TextDocumentIdentifier): string | undefined {
    const rootPath = this.workspaceRoot();
    if (!rootPath) return;
    return path.relative(rootPath, Environment.uriToPath(id));
  }

  public spawn(command: string, args?: string[], options?: SpawnOptions): ChildProcess {
    let cmd = "";
    if (this.preamble != null) {
      cmd = `${this.preamble}${command} ${args ? args.join(" ") : ""}`;
      return childProcess.spawn("sh", ["-c", cmd], options);
    } else {
      cmd = command;
      return childProcess.spawn(command, args, options);
    }
  }

  public workspaceRoot(): string | null | undefined {
    return this.session.initConf.rootPath;
  }

  private async detectDependencyEnv(): Promise<void> {
    try {
      // Add preamble to run dependencyEnv, but only if it exists
      const dependencyEnvScript = `${this.session.environment.workspaceRoot()}/node_modules/.bin/dependencyEnv`;
      this.preamble = `[ ! -f ${dependencyEnvScript} ] || eval $(${dependencyEnvScript}) && `;
    } catch (err) {
      //
    }
    // FIXME: should also reflect this in the status item
  }
}
