# ocaml-language-server

A language server for OCaml and related languages

## Synopsis

This is an implementation of the [language server
protocol](https://github.com/Microsoft/language-server-protocol) for OCaml and
related languages like [BuckleScript](http://bloomberg.github.io/bucklescript)
and [Reason](https://facebook.github.io/reason).

## Server Clients

For a full-featured client for this server see
[vscode-reasonml](https://github.com/freebroccolo/vscode-reasonml).

The language server protocol is still quite new but many other clients being developed:

- [atom-languageclient](https://github.com/OmniSharp/atom-languageclient)
- [emacs-lsp](https://github.com/sourcegraph/emacs-lsp)
- [sublime-lsp](https://github.com/sourcegraph/sublime-lsp)
- [nvim-langserver-shim](https://github.com/tjdevries/nvim-langserver-shim)
- [vim-lsp](https://github.com/prabirshrestha/vim-lsp)

NOTE: Most of these clients have not yet been tested with the server.

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

## Installing the Server

### Requirements

- OCaml `4.02.3` or greater
- [Reason](https://github.com/facebook/reason) `1.4.0` (optional)
- [merlin](https://github.com/the-lambda-church/merlin) `2.5.0` or greater

The server can be installed with npm:

```
npm install -g ocaml-language-server
```

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
