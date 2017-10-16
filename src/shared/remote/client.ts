import { RequestType } from "vscode-jsonrpc";
import { Location, TextDocumentIdentifier, TextDocumentPositionParams } from "vscode-languageclient";
import types from "../types";

export const givePrefix =
  new RequestType<TextDocumentPositionParams, null | string, void, void>("reason.client.givePrefix");

export const giveText =
  new RequestType<Location, string, void, void>("reason.client.giveText");

export const giveTextDocument =
  new RequestType<TextDocumentIdentifier, types.ITextDocumentData, void, void>("reason.client.giveTextDocument");

export const giveWordAtPosition =
  new RequestType<types.ILocatedPosition, string, void, void>("reason.client.giveWordAtPosition");
