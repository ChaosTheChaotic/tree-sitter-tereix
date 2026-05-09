/**
 * @file Tree-sitter grammar for Tereix
 * @author ChaosTheChaotic
 * @license GPL-3.0
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "tereix",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
