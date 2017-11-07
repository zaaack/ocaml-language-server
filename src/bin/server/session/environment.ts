import * as childProcess from "child_process";
import * as path from "path";
import * as URL from "url";
import * as server from "vscode-languageserver";
import { types } from "../../../lib";
import Session from "./index";

const fileSchemeLength = "file://".length - 1;

export default class Environment implements server.Disposable {
  public static pathToUri(path: string): types.TextDocumentIdentifier {
    const uri = URL.format(URL.parse(`file://${path}`));
    return { uri };
  }

  public static uriToPath({ uri }: types.TextDocumentIdentifier): string {
    return uri.substr(fileSchemeLength);
  }

  constructor(private readonly session: Session) {
  }

  public dispose(): void {
    return;
  }

  public relativize(id: types.TextDocumentIdentifier): string | undefined {
    const rootPath = this.workspaceRoot();
    if (!rootPath) return;
    return path.relative(rootPath, Environment.uriToPath(id));
  }

  public spawn(command: string, args: string[] = [], options: childProcess.SpawnOptions = {}): childProcess.ChildProcess {
    options.shell = process.platform === "win32" ? true : options.shell;
    return childProcess.spawn(command, args, options);
  }

  public workspaceRoot(): string | null | undefined {
    return this.session.initConf.rootPath;
  }
}
