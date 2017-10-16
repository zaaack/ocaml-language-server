import { RequestType } from "vscode-jsonrpc";
import merlin, { IColumnLine } from "../merlin";
import types, { TextDocumentIdentifier } from "../types";

export const giveCaseAnalysis =
  new RequestType<types.ITextDocumentRange, null | merlin.Case.Destruct, void, void>("reason.server.giveCaseAnalysis");

export const giveMerlinFiles =
  new RequestType<TextDocumentIdentifier, string[], void, void>("reason.server.giveMerlinFiles");

export const giveFormatted =
  new RequestType<types.IUnformattedTextDocument, null | string, void, void>("reason.server.giveFormatted");
