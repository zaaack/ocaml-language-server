"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("../../shared");
function default_1(session) {
    void session;
    return (event) => {
        const documentation = event.data.documentation
            .replace(/\{\{:.*?\}(.*?)\}/g, "$1")
            .replace(/\{!(.*?)\}/g, "$1");
        const markedDoc = shared_1.parser.ocamldoc.intoMarkdown(documentation)
            .replace(/`(.*?)`/g, "$1")
            .replace(/\s+/g, " ")
            .replace(/\n/g, "");
        event.documentation = markedDoc;
        return event;
    };
}
exports.default = default_1;
//# sourceMappingURL=completionResolve.js.map