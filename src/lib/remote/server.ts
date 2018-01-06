import { RequestType } from "vscode-jsonrpc";
import { TextDocumentIdentifier } from "vscode-languageserver-protocol";
import * as merlin from "../merlin";
import * as ordinal from "../merlin/ordinal";
import { ITextDocumentRange, IUnformattedTextDocument } from "../types";

export const giveCaseAnalysis = new RequestType<ITextDocumentRange, null | merlin.Case.Destruct, void, void>(
  "reason.server.giveCaseAnalysis",
);

export const giveMerlinFiles = new RequestType<TextDocumentIdentifier, string[], void, void>(
  "reason.server.giveMerlinFiles",
);

export const giveAvailableLibraries = new RequestType<TextDocumentIdentifier, string[], void, void>(
  "reason.server.giveAvailableLibraries",
);

export const giveProjectEnv = new RequestType<TextDocumentIdentifier, string[], void, void>(
  "reason.server.giveProjectEnv",
);

export const giveFormatted = new RequestType<IUnformattedTextDocument, null | string, void, void>(
  "reason.server.giveFormatted",
);

void ordinal; // tslint:disable-line no-unused-expression
