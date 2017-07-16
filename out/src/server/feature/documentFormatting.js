"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("../../shared");
const command = require("../command");
function default_1(session) {
    return (event, token) => __awaiter(this, void 0, void 0, function* () {
        const result = yield command.getTextDocument(session, event.textDocument);
        if (null == result)
            return [];
        const document = shared_1.types.TextDocument.create(event.textDocument.uri, result.languageId, result.version, result.getText());
        if (token.isCancellationRequested)
            return [];
        let otxt = null;
        if (document.languageId === "ocaml")
            otxt = yield command.getFormatted.ocpIndent(session, document);
        if (document.languageId === "reason")
            otxt = yield command.getFormatted.refmt(session, document);
        if (token.isCancellationRequested)
            return [];
        if (otxt == null)
            return [];
        const edits = [];
        edits.push(shared_1.types.TextEdit.replace(shared_1.types.Range.create(document.positionAt(0), document.positionAt(result.getText().length)), otxt));
        return edits;
    });
}
exports.default = default_1;
//# sourceMappingURL=documentFormatting.js.map