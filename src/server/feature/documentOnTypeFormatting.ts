import * as server from "vscode-languageserver";
import { types } from "../../shared";
import Session from "../session";

export default function(session: Session): server.RequestHandler<server.DocumentOnTypeFormattingParams, types.TextEdit[], void> {
  return async (event, token) => {
    void event; // tslint:disable-line
    void session; // tslint:disable-line
    void token; // tslint:disable-line
    return new server.ResponseError(-1, "onDocumentOnTypeFormatting: not implemented", undefined);
  };
}
