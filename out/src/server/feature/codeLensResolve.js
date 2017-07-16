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
const command = require("../command");
function default_1(session) {
    return (event, token) => __awaiter(this, void 0, void 0, function* () {
        const data = event.data;
        const itemType = yield command.getType(session, data.event, 1);
        if (token.isCancellationRequested)
            return event;
        if (itemType == null)
            return event;
        event.command = { command: "", title: itemType.type };
        if ("re" === data.fileKind)
            event.command.title = event.command.title.replace(/ : /g, ": ");
        if (!session.settings.reason.codelens.unicode)
            return event;
        if ("ml" === data.fileKind)
            event.command.title = event.command.title.replace(/->/g, "→");
        if ("ml" === data.fileKind)
            event.command.title = event.command.title.replace(/\*/g, "×");
        if ("re" === data.fileKind)
            event.command.title = event.command.title.replace(/=>/g, "⇒");
        return event;
    });
}
exports.default = default_1;
//# sourceMappingURL=codeLensResolve.js.map