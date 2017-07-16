"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var LocatedPosition;
(function (LocatedPosition) {
    function create(uri, position) {
        return { position, uri };
    }
    LocatedPosition.create = create;
})(LocatedPosition = exports.LocatedPosition || (exports.LocatedPosition = {}));
__export(require("vscode-languageserver-types"));
//# sourceMappingURL=types.js.map