# ocaml-language-server

A language server for OCaml and related languages

## Synopsis

This is an implementation of the [language server
protocol](https://github.com/Microsoft/language-server-protocol) for OCaml and
related languages like [BuckleScript](http://bucklescript.github.io/bucklescript)
and [Reason](https://facebook.github.io/reason).

## Usage

### Atom

See [atom-ide-reason](https://github.com/zaaack/atom-ide-reason).

### Emacs

See [lsp-mode](https://github.com/emacs-lsp/lsp-mode). Follow the installation
instructions there then add the following snippet(s) to your
`~/.emacs.d/init.el`. You will need the `tuareg` package installed and probably
other packages like `flycheck` and `company-mode` for most of the language
server features to work.

```elisp
(lsp-define-stdio-client 'tuareg-mode "ocaml" 'stdio
	#'(lambda () default-directory)
	"OCaml Language Server"
	'("ocaml-language-server" "--stdio"))
(add-hook 'tuareg-mode-hook #'lsp-mode)
```

```elisp
(lsp-define-stdio-client 'reason-mode "reason" 'stdio
	#'(lambda () default-directory)
	"OCaml Language Server"
	'("ocaml-language-server" "--stdio"))
(add-hook 'reason-mode-hook #'lsp-mode)
```

### Oni

See the instructions [here](https://github.com/bryphe/oni/wiki/Language-Support#reason-and-ocaml).

### VS Code

See [vscode-reasonml](https://github.com/freebroccolo/vscode-reasonml). The
OCaml Language Server comes bundled with this VS Code extension and no
additional configuration steps are necessary.

### Sublime Text

Install [Sublime Text LSP](https://github.com/tomv564/LSP). For Reason support,
see the instructions at
[sublime-reason](https://github.com/reasonml-editor/sublime-reason).

### Other Editors

For other editors, see the following list of language client packages. Note that
the OCaml language server has not been tested extensively with other editors
yet. If you try to use one of these packages and encounter a problem, please
open an issue about it.

- [Neovim](https://github.com/autozimu/LanguageClient-neovim)
- [Vim](https://github.com/prabirshrestha/vim-lsp)

## Server Capabilities

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

## Installing the Server

### Requirements

- OCaml `4.02.3` or greater
- [Reason](https://github.com/facebook/reason) `1.4.0` (optional)
- [merlin](https://github.com/the-lambda-church/merlin) `2.5.0` or greater

The server can be installed with npm:

```
npm install -g ocaml-language-server
```

## Launching the Server Manually

The server can be launched in the following ways:

```
ocaml-language-server --node-ipc
ocaml-language-server --socket={number}
ocaml-language-server --stdio
```

For node-based clients like
[vscode-reasonml](https://github.com/freebroccolo/vscode-reasonml) `--node-ipc`
is the most efficient approach. Clients written in other languages should use
`--stdio` or `--socket`.

## Building the Server

Execute the following steps:

```
yarn install
yarn run compile
```
