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
const server = require("vscode-languageserver");
function default_1(session) {
    return (event, token) => __awaiter(this, void 0, void 0, function* () {
        void event;
        void session;
        void token;
        return new server.ResponseError(-1, "onDocumentOnTypeFormatting: not implemented", undefined);
    });
}
exports.default = default_1;
//# sourceMappingURL=documentOnTypeFormatting.js.map