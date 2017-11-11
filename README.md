# ocaml-language-server

The engine that powers [OCaml](http://ocaml.org) and [Reason](https://reasonml.github.io)'s editors support!

## How Does This Work?

This is an implementation of the
[language server protocol](https://github.com/Microsoft/language-server-protocol).
It's a simple idea: every mainstream editor implements a **language client**,
which receives your editor actions (autocompletion, jump-to-definition, show
type, etc.) and calls a **language server**, which returns the asked
information.

The insight is to standardize the way every editor queries the language server.
This way, instead of reimplementing e.g. one Reason plugin for every single
editor out there, we implement everything once inside our language server, and
all editors that support language client receives the feature.
[Diagram here](https://langserver.org).

## Features

Every editor using this language-server should in theory have all the following features:

- [x] OCaml support
- [x] Reason support
- [x] compiler diagnostics
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
- [x] BuckleScript [build system](https://bucklescript.github.io/bucklescript/Manual.html#_bucklescript_build_system_code_bsb_code) integration (currently only activated for vscode)

## Installation

### The Language Server (This Project)

```sh
npm install -g ocaml-language-server
```

The server relies on some external dependencies you have to install yourself. If you're a pure OCaml user:

- OCaml `4.02.3` or greater
- [merlin](https://github.com/the-lambda-church/merlin) `2.5.0` or greater

If you're a Reason/BuckleScript user:

Install Reason + OCaml + Merlin through Reason's
[recommended installation](https://reasonml.github.io/guide/editor-tools/global-installation#recommended-through-npmyarn)
or the alternative
[OPAM installation](https://reasonml.github.io/guide/editor-tools/global-installation#alternative-through-opam).

### The Language Client

Pick your favorite editor and install the plugin! They should all work with
ocaml-language-server. Some of them are called "myeditor-reason", but they
support both Reason and OCaml.

- Atom: [atom-ide-reason](https://github.com/zaaack/atom-ide-reason)

- Emacs: [lsp-ocaml](https://github.com/emacs-lsp/lsp-ocaml).
  For extra Reason support: the emacs integration isn't using
  language-server/client yet. Please use
  [reason](https://github.com/reasonml-editor/reason-mode) instead.

- Oni: [see here](https://github.com/bryphe/oni/wiki/Language-Support#reason-and-ocaml).

- VSCode: [vscode-reasonml](https://github.com/freebroccolo/vscode-reasonml).
  The ocaml-language-server comes bundled with this VS Code extension; no
  additional configuration is necessary.

- Sublime Text: [Sublime Text LSP](https://github.com/tomv564/LSP).
  For extra Reason support, see
  [sublime-reason](https://github.com/reasonml-editor/sublime-reason).

- NeoVim/Vim 8 with Python 8: [LanguageClient-neovim](https://github.com/autozimu/LanguageClient-neovim).
  For extra Reason support, see
  [vim-reason-plus](https://github.com/reasonml-editor/vim-reason-plus).

- Other Editors: see the following list of language client packages. Note that
  ocaml-language-server hasn't been tested extensively with other editors
  yet. If you try to use one of these packages and encounter a problem, please
  open an issue about it.

  - [Intellij IDEA](https://github.com/gtache/intellij-lsp)
  - [Vim 7/Vim Without Python 3](https://github.com/prabirshrestha/vim-lsp)

## Launching the Server

Your editor's language-client should have a configuration to start the server.

The server can be launched in the following ways:

```sh
ocaml-language-server --node-ipc
ocaml-language-server --socket={number}
ocaml-language-server --stdio
```

For node-based clients like
[vscode-reasonml](https://github.com/freebroccolo/vscode-reasonml) `--node-ipc`
is the most efficient approach. Clients written in other languages should use
`--stdio` or `--socket`.

## Contributing

Clone the repo and do:

```sh
yarn install                 # install dependencies
node ./bin/server --stdio    # start the server
```
