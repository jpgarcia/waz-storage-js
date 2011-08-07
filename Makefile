PREFIX ?= /usr/local
BIN = ./node_modules/expresso/bin/expresso
JSCOV = ./node_modules/expresso/deps/jscoverage/node-jscoverage

test: $(BIN)
	@./$(BIN) -I lib --growl $(TEST_FLAGS) test/**/*.test.js

test-cov: $(BIN)
	@./$(BIN) -I lib --cov $(TEST_FLAGS) test/**/*.test.js
		
.PHONY: test test-cov