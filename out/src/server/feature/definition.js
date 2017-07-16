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
function default_1(session) {
    return (event, token) => __awaiter(this, void 0, void 0, function* () {
        const find = (kind) => __awaiter(this, void 0, void 0, function* () {
            const request = shared_1.merlin.Query.locate(null, kind).at(shared_1.merlin.Position.fromCode(event.position));
            const response = yield session.merlin.query(request, event.textDocument);
            if (response.class !== "return" || response.value.pos == null)
                return null;
            const value = response.value;
            const uri = value.file ? `file://${value.file}` : event.textDocument.uri;
            const position = shared_1.merlin.Position.intoCode(value.pos);
            const range = shared_1.types.Range.create(position, position);
            const location = shared_1.types.Location.create(uri, range);
            return location;
        });
        const locML = yield find("ml");
        if (token.isCancellationRequested)
            return [];
        const locations = [];
        if (locML != null)
            locations.push(locML);
        return locations;
    });
}
exports.default = default_1;
//# sourceMappingURL=definition.js.map