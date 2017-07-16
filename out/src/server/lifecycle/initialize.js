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
const capabilities_1 = require("../capabilities");
function default_1(session) {
    return (event) => __awaiter(this, void 0, void 0, function* () {
        session.initConf = event;
        session.settings.reason = event.initializationOptions ? event.initializationOptions : shared_1.ISettings.defaults.reason;
        yield session.initialize();
        const request = shared_1.merlin.Sync.protocol.version.set(3);
        const response = yield session.merlin.sync(request);
        if (response.class !== "return" || response.value.selected !== 3) {
            session.connection.dispose();
            throw new Error("onInitialize: failed to establish protocol v3");
        }
        return { capabilities: capabilities_1.default };
    });
}
exports.default = default_1;
//# sourceMappingURL=initialize.js.map