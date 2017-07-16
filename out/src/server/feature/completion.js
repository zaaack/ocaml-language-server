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
        let prefix = null;
        try {
            prefix = yield command.getPrefix(session, event);
            if (token.isCancellationRequested)
                return [];
        }
        catch (err) {
        }
        if (prefix == null)
            return [];
        const position = shared_1.merlin.Position.fromCode(event.position);
        const request = shared_1.merlin.Query.complete.prefix(prefix).at(position).with.doc();
        const response = yield session.merlin.query(request, event.textDocument, Infinity);
        if (token.isCancellationRequested)
            return [];
        if (response.class !== "return")
            return [];
        const entries = response.value.entries || [];
        return entries.map(shared_1.merlin.Completion.intoCode);
    });
}
exports.default = default_1;
//# sourceMappingURL=completion.js.map