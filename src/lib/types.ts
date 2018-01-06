import * as LSP from "vscode-languageserver-protocol";

export interface ILocatedPosition {
  position: LSP.Position;
  uri: string;
}
export namespace LocatedPosition {
  export function create(uri: string, position: LSP.Position): ILocatedPosition {
    return { position, uri };
  }
}

export type LocatedRange = LSP.Location;

export interface ITextDocumentRange {
  range: LSP.Range;
  textDocument: LSP.TextDocumentIdentifier;
}

export interface ITextDocumentData {
  content: string;
  languageId: string;
  version: number;
}

export interface IUnformattedTextDocument {
  uri: string;
  languageId: string;
  version: number;
  content: string;
}
