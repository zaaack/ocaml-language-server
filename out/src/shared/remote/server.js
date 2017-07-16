"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpc = require("vscode-jsonrpc");
exports.giveCaseAnalysis = new rpc.RequestType("reason.server.giveCaseAnalysis");
exports.giveMerlinFiles = new rpc.RequestType("reason.server.giveMerlinFiles");
exports.giveFormatted = new rpc.RequestType("reason.server.giveFormatted");
//# sourceMappingURL=server.js.map