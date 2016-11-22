# ocaml-language-server

A language server for OCaml and related languages

## Synopsis

This is an implementation of the [language server
protocol](https://github.com/Microsoft/language-server-protocol) for OCaml and
related languages like [BuckleScript](http://bloomberg.github.io/bucklescript)
and [Reason](https://facebook.github.io/reason).

## Server Capabilities

- [x] OCaml support
- [x] Reason support
- [x] incremental document synchronization
- [x] code action provider
- [x] code lens provider
- [x] completion provider
- [x] definition provider
- [x] document formatting provider (Reason)
- [x] document highlight provider
- [x] document range formatting provider (Reason)
- [x] document symbol provider
- [x] hover provider
- [x] references provider
- [x] workspace symbol provider

## Launching the Server

The server can be launched in the following ways:

```
ocaml-language-server --node-ipc
ocaml-language-server --socket={number}
ocaml-language-server --stdio
```

For node-based clients like
[vscode-reasonml](https://github.com/freebroccolo/vscode-reasonml) `--node-ipc`
is the most efficient approach. Clients written other languages should use
`--stdio` or `--socket`.

## Building the server

Execute the following steps:

```
yarn install
yarn run compile
```
