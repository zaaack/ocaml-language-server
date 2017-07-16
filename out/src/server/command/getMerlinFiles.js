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
function default_1(session, event, priority = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = shared_1.merlin.Query.project.get();
        const response = yield session.merlin.query(request, event, priority);
        if (response.class !== "return")
            return [];
        return response.value.result;
    });
}
exports.default = default_1;
//# sourceMappingURL=getMerlinFiles.js.map