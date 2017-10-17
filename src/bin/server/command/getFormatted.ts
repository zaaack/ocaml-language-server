import { types } from "../../../lib";
import * as processes from "../processes";
import Session from "../session";

export async function ocpIndent(session: Session, doc: types.TextDocument): Promise<string> {
  const text = doc.getText();
  const ocpIndent = new processes.OcpIndent(session, []).process;
  ocpIndent.stdin.write(text);
  ocpIndent.stdin.end();
  const otxt = await new Promise<string>((resolve, reject) => {
    let buffer = "";
    ocpIndent.stdout.on("error", (error: Error) => reject(error));
    ocpIndent.stdout.on("data", (data: Buffer | string) => buffer += data.toString());
    ocpIndent.stdout.on("end", () => resolve(buffer));
  });
  ocpIndent.unref();
  return otxt;
}

export async function ocpIndentRange(session: Session, doc: types.TextDocument, range: types.Range): Promise<number[]> {
  const text = doc.getText();
  const args: string[] = [
    "--indent-empty",
    `--lines=${range.start.line}-${range.end.line}`,
    "--numeric",
  ];
  const ocpIndent = new processes.OcpIndent(session, args).process;
  ocpIndent.stdin.write(text);
  ocpIndent.stdin.end();
  const output = await new Promise<string>((resolve, reject) => {
    let buffer = "";
    ocpIndent.stdout.on("error", (error: Error) => reject(error));
    ocpIndent.stdout.on("data", (data: Buffer | string) => buffer += data.toString());
    ocpIndent.stdout.on("end", () => resolve(buffer));
  });
  ocpIndent.unref();
  const indents: number[] = [];
  const pattern = /\d+/g;
  let match: null | RegExpExecArray = null;
  while ((match = pattern.exec(output)) != null) {
    const digits = match.shift() as string;
    const indent = parseInt(digits, 10);
    indents.push(indent);
  }
  return indents;
}

export async function refmt(session: Session, doc: types.TextDocument, range?: types.Range): Promise<null | string> {
  if (range != null) {
    session.connection.console.warn("Selection formatting not support for Reason");
    return null;
  }
  const text = doc.getText();
  if (/^\s*$/.test(text)) return text;
  const refmt = new processes.ReFMT(session, doc).process;
  refmt.stdin.write(text);
  refmt.stdin.end();
  const otxt = await new Promise<string>((resolve, reject) => {
    let buffer = "";
    refmt.stdout.on("error", (error: Error) => reject(error));
    refmt.stdout.on("data", (data: Buffer | string) => buffer += data.toString());
    refmt.stdout.on("end", () => resolve(buffer));
  });
  refmt.unref();
  return /^\s*$/.test(otxt) ? null : otxt.trim();
}
