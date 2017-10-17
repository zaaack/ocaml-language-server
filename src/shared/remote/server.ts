import { RequestType } from "vscode-jsonrpc";
import * as merlin from "../merlin";
import { IColumnLine } from "../merlin/ordinal";
import * as types from "../types";
import { TextDocumentIdentifier } from "vscode-languageserver-types";

export const giveCaseAnalysis =
  new RequestType<types.ITextDocumentRange, null | merlin.Case.Destruct, void, void>("reason.server.giveCaseAnalysis");

export const giveMerlinFiles =
  new RequestType<types.TextDocumentIdentifier, string[], void, void>("reason.server.giveMerlinFiles");

export const giveFormatted =
  new RequestType<types.IUnformattedTextDocument, null | string, void, void>("reason.server.giveFormatted");

let __: IColumnLine | TextDocumentIdentifier | null = null; void __; // stupid hack so IColumnLine, TextDocumentIdentifier aren't "unused"
