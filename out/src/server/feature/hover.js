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
        const position = { position: event.position, uri: event.textDocument.uri };
        const word = yield command.getWordAtPosition(session, position);
        const markedStrings = [];
        const itemType = yield command.getType(session, event);
        if (token.isCancellationRequested)
            return { contents: [] };
        const itemDocs = yield command.getDocumentation(session, event);
        if (token.isCancellationRequested)
            return { contents: [] };
        if (itemType != null) {
            let language = "plaintext";
            if (/\.mli?/.test(event.textDocument.uri))
                language = "ocaml.hover.type";
            if (/\.rei?/.test(event.textDocument.uri))
                language = /^[A-Z]/.test(word) ? "reason.hover.signature" : "reason.hover.type";
            markedStrings.push({ language, value: itemType.type });
            if (itemDocs != null && !shared_1.parser.ocamldoc.ignore.test(itemDocs))
                markedStrings.push(shared_1.parser.ocamldoc.intoMarkdown(itemDocs));
        }
        return { contents: markedStrings };
    });
}
exports.default = default_1;
//# sourceMappingURL=hover.js.map