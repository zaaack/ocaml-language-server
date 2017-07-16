"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ReFMT {
    constructor(session, id, argsOpt) {
        const uri = id ? id.uri : ".re";
        const command = session.settings.reason.path.refmt;
        const args = argsOpt || [
            "--parse", "re",
            "--print", "re",
            "--interface", `${/\.rei$/.test(uri)}`,
        ];
        this.process = session.environment.spawn(command, args);
        return this;
    }
}
exports.default = ReFMT;
//# sourceMappingURL=refmt.js.map