"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpc = require("vscode-jsonrpc");
exports.givePrefix = new rpc.RequestType("reason.client.givePrefix");
exports.giveText = new rpc.RequestType("reason.client.giveText");
exports.giveTextDocument = new rpc.RequestType("reason.client.giveTextDocument");
exports.giveWordAtPosition = new rpc.RequestType("reason.client.giveWordAtPosition");
//# sourceMappingURL=client.js.map