"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OcpIdent {
    constructor(session, args = []) {
        const command = "ocp-indent";
        this.process = session.environment.spawn(command, args);
        return this;
    }
}
exports.default = OcpIdent;
//# sourceMappingURL=ocpIndent.js.map