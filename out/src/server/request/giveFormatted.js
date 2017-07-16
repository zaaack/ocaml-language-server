"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("../../shared");
const command = require("../command");
function default_1(session) {
    return (event) => {
        const textDoc = shared_1.types.TextDocument.create(event.uri, event.languageId, event.version, event.content);
        return command.getFormatted.refmt(session, textDoc);
    };
}
exports.default = default_1;
//# sourceMappingURL=giveFormatted.js.map