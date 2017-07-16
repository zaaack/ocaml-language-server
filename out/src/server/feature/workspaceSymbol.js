"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(session) {
    return (event) => {
        return session.indexer.findSymbols({ name: { $regex: event.query } });
    };
}
exports.default = default_1;
//# sourceMappingURL=workspaceSymbol.js.map