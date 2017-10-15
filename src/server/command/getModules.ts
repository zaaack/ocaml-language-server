import { Glob } from "glob";
import server from "vscode-languageserver";
import { merlin } from "../../shared";
import { default as Session, Environment } from "../session";

export default async function (session: Session, event: server.TextDocumentIdentifier, priority: number = 0): Promise<server.TextDocumentIdentifier[]> {
  const request = merlin.Query.path.list.source();
  const response = await session.merlin.query(request, event, priority);
  if (response.class !== "return") return [];
  const srcDirs: Set<string> = new Set();
  const srcMods: server.TextDocumentIdentifier[] = [];
  for (const cwd of response.value) {
    if (cwd && !(/\.opam\b/.test(cwd) || srcDirs.has(cwd))) {
      srcDirs.add(cwd);
      const cwdMods = new Glob("*.@(ml|re)?(i)", { cwd, realpath: true, sync: true }).found;
      for (const path of cwdMods) srcMods.push(Environment.pathToUri(path));
    }
  }
  return srcMods;
}
