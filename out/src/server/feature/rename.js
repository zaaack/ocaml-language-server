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
        const occurrences = yield command.getOccurrences(session, event);
        if (token.isCancellationRequested)
            return { changes: {} };
        if (occurrences == null)
            return { changes: {} };
        const renamings = occurrences.map((loc) => shared_1.types.TextEdit.replace(shared_1.merlin.Location.intoCode(loc), event.newName));
        const documentChanges = [shared_1.types.TextDocumentEdit.create(shared_1.types.VersionedTextDocumentIdentifier.create(event.textDocument.uri, 0), renamings)];
        const edit = { documentChanges };
        return edit;
    });
}
exports.default = default_1;
//# sourceMappingURL=rename.js.map