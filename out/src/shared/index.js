"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merlin = require("./merlin");
exports.merlin = merlin;
const parser = require("./parser");
exports.parser = parser;
const remote = require("./remote");
exports.remote = remote;
const types = require("./types");
exports.types = types;
var ISettings;
(function (ISettings) {
    ISettings.defaults = {
        reason: {
            codelens: {
                enabled: true,
                unicode: true,
            },
            debounce: {
                linter: 500,
            },
            path: {
                ocamlfind: "ocamlfind",
                ocamlmerlin: "ocamlmerlin",
                opam: "opam",
                rebuild: "rebuild",
                refmt: "refmt",
                refmterr: "refmterr",
                rtop: "rtop",
            },
            server: {
                languages: [
                    "ocaml",
                    "reason",
                ],
            },
        },
    };
})(ISettings = exports.ISettings || (exports.ISettings = {}));
//# sourceMappingURL=index.js.map