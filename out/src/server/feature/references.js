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
            return [];
        if (occurrences == null)
            return [];
        const highlights = occurrences.map((loc) => {
            const uri = event.textDocument.uri;
            const range = shared_1.merlin.Location.intoCode(loc);
            return shared_1.types.Location.create(uri, range);
        });
        return highlights;
    });
}
exports.default = default_1;
//# sourceMappingURL=references.js.map