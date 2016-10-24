BUILD_DIR=${PWD}/_build
EVAL=eval
GIT=git
GREP=grep
MKDIR=mkdir -p
OCAMLBUILD=rebuild
OCAMLBUILD_JOBS=-j 0
OCAMLBUILD_FLAGS=${OCAMLBUILD_JOBS} -use-ocamlfind -no-links
OPAM=opam
POPD=cd ..
PUSHD=cd
REMOVE=rm -rf
SYMLINK=ln -sf

.PHONY: all bin/server clean install lib-byte lib-native links preinstall tests tools top

all: lib-native links tools

bin:
	@${MKDIR} bin

bin/server: bin
	@${OCAMLBUILD} ${OCAMLBUILD_FLAGS} -I src/lib/LanguageServer src/tools/server/Main.native
	@${SYMLINK} ${BUILD_DIR}/src/tools/server/Main.native bin/server

clean:
	@${OCAMLBUILD} -clean
	@${REMOVE} bin

distclean: clean
	@${OPAM} pin remove language-server

install: preinstall
	@$(MAKE) all
	@echo
	@echo "* installing binaries at ./bin"
	@echo
	@echo "* run './bin/server help' for details"

lib-byte:
	@${OCAMLBUILD} ${OCAMLBUILD_FLAGS} src/lib/languageServer.cma

lib-native:
	@${OCAMLBUILD} ${OCAMLBUILD_FLAGS} src/lib/languageServer.cmxa

links: bin/server

preinstall:

test: all

tools: bin/server

top: lib-byte
	@utop
