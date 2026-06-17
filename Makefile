.PHONY: build test clean

# verifier must build (to wasm) before piilo: piilo's contractimport! reads
# verifier's compiled .wasm at compile time.
build:
	stellar contract build --package verifier
	stellar contract build --package piilo

test: build
	cargo test --workspace

clean:
	cargo clean
