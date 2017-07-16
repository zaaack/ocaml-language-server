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
exports.default = (session, event, priority = 0) => __awaiter(this, void 0, void 0, function* () {
    const position = shared_1.merlin.Position.fromCode(event.position);
    const request = shared_1.merlin.Query.document(null).at(position);
    const response = yield session.merlin.query(request, event.textDocument, priority);
    if (response.class !== "return")
        return null;
    return response.value;
});
//# sourceMappingURL=getDocumentation.js.map