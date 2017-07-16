"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Sync {
    constructor(sync) {
        void null;
        this.sync = sync;
        return this;
    }
}
exports.Sync = Sync;
(function (Sync) {
    var protocol;
    (function (protocol) {
        var version;
        (function (version_1) {
            version_1.get = () => new Sync(["protocol", "version"]);
            version_1.set = (version) => new Sync(["protocol", "version", version]);
        })(version = protocol.version || (protocol.version = {}));
    })(protocol = Sync.protocol || (Sync.protocol = {}));
    Sync.tell = (startPos, endPos, source) => new Sync(["tell", startPos, endPos, source]);
})(Sync = exports.Sync || (exports.Sync = {}));
//# sourceMappingURL=sync.js.map