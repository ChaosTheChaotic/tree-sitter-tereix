/**
 * @file Tree-sitter grammar for Tereix
 * @author ChaosTheChaotic
 * @license GPL-3.0
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  ASSIGN: 1,
  LOGICAL_OR: 2,
  LOGICAL_AND: 3,
  BIT_OR: 4,
  BIT_XOR: 5,
  BIT_AND: 6,
  EQUAL: 7,
  REL: 8,
  SHIFT: 9,
  ADD: 10,
  MULT: 11,
  UNARY: 12,
  POSTFIX: 13,
  MEMBER: 14,
};

export default grammar({
  name: "tereix",

  extras: ($) => [/\s/, $.comment],

  conflicts: ($) => [
    [$.type, $._expression],
    [$._statement, $._expression],
  ],

  rules: {
    source_file: ($) => repeat($._top_level_item),

    comment: ($) => token(seq("//", /.*/)),

    _top_level_item: ($) =>
      choice($.use_statement, $.extern_block, $._declaration),

    _declaration: ($) =>
      choice(
        $.variable_declaration,
        $.function_definition,
        $.struct_definition,
        $.union_definition,
        $.enum_definition,
      ),

    type: ($) =>
      seq(
        repeat(
          choice(
            "static",
            "mut",
            "async",
            "inline",
            "threadlocal",
            "extern",
            "*",
            "&",
          ),
        ),
        choice($.primitive_type, $.identifier, "self"),
        repeat(seq("[", optional($._expression), "]")),
      ),

    primitive_type: ($) =>
      choice(
        "u8",
        "u16",
        "u32",
        "u64",
        "usize",
        "i8",
        "i16",
        "i32",
        "i64",
        "isize",
        "f8",
        "f16",
        "f32",
        "f64",
        "fsize",
        "bool",
        "str",
        "void",
        "char",
        "auto",
        "any",
      ),

    use_statement: ($) =>
      seq("use", $.string_literal, optional(seq("as", $.identifier)), ";"),

    extern_block: ($) => seq("extern", "{", repeat($._declaration), "}"),

    variable_declaration: ($) =>
      seq($.type, $.identifier, optional(seq("=", $._expression)), ";"),

    function_definition: ($) =>
      seq(
        $.type,
        $.identifier,
        "(",
        optional($._parameter_list),
        ")",
        choice($.block, ";"),
      ),

    _parameter_list: ($) =>
      seq($.parameter, repeat(seq(",", $.parameter)), optional(",")),

    parameter: ($) => choice(seq($.type, $.identifier), $.type),

    struct_definition: ($) =>
      seq(
        "struct",
        $.identifier,
        "{",
        repeat(
          choice(
            $.variable_declaration,
            $.function_definition,
            $.struct_definition,
            $.union_definition,
            $.enum_definition,
          ),
        ),
        "}",
      ),

    union_definition: ($) =>
      seq(
        "union",
        $.identifier,
        "{",
        repeat(
          choice(
            $.variable_declaration,
            $.function_definition,
            $.struct_definition,
            $.union_definition,
            $.enum_definition,
          ),
        ),
        "}",
      ),

    enum_definition: ($) =>
      seq("enum", $.identifier, "{", optional($._enum_member_list), "}"),

    _enum_member_list: ($) =>
      seq($.enum_member, repeat(seq(",", $.enum_member)), optional(",")),

    enum_member: ($) => seq($.identifier, optional(seq("=", $._expression))),

    _statement: ($) =>
      choice(
        $._declaration,
        $.block,
        $.if_statement,
        $.while_statement,
        $.for_statement,
        $.switch_statement,
        $.defer_statement,
        $.return_statement,
        $.break_statement,
        $.continue_statement,
        $.expression_statement,
      ),

    block: ($) =>
      seq(
        optional("async"),
        "{",
        repeat($._statement),
        optional($._expression),
        "}",
      ),

    if_statement: ($) =>
      seq(
        "if",
        "(",
        $._expression,
        ")",
        $.block,
        optional(seq("else", choice($.block, $.if_statement))),
      ),

    while_statement: ($) => seq("while", "(", $._expression, ")", $.block),

    for_statement: ($) =>
      seq(
        "for",
        "(",
        choice($.variable_declaration, seq(optional($._expression), ";")),
        optional($._expression),
        ";",
        optional($._expression),
        ")",
        $.block,
      ),

    switch_statement: ($) =>
      seq(
        "switch",
        "(",
        $._expression,
        ")",
        "{",
        repeat(choice($.case_statement, $.default_statement)),
        "}",
      ),

    case_statement: ($) => seq("case", "(", $._expression, ")", $.block),

    default_statement: ($) => seq("default", $.block),

    defer_statement: ($) => seq("defer", $._expression, ";"),

    return_statement: ($) => seq("ret", optional($._expression), ";"),

    break_statement: ($) => seq("break", ";"),
    continue_statement: ($) => seq("continue", ";"),

    expression_statement: ($) => seq($._expression, ";"),

    _expression: ($) =>
      choice(
        $.identifier,
        "self",
        $.number_literal,
        $.string_literal,
        $.char_literal,
        $.boolean_literal,
        $.null_literal,
        $.array_literal,
        $.unary_expression,
        $.binary_expression,
        $.function_call,
        $.member_access,
        $.index_expression,
        $.parenthesized_expression,
        $.cast_expression,
        $.block,
      ),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    cast_expression: ($) =>
      prec(PREC.UNARY, seq("(", $.type, ")", $._expression)),

    unary_expression: ($) =>
      choice(
        // Prefix
        prec.left(
          PREC.UNARY,
          seq(choice("!", "&", "*", "+", "-"), $._expression),
        ),
        // Postfix
        prec.left(PREC.POSTFIX, seq($._expression, choice("++", "--"))),
      ),

    binary_expression: ($) =>
      choice(
        prec.left(
          PREC.MULT,
          seq($._expression, choice("*", "/", "%"), $._expression),
        ),
        prec.left(
          PREC.ADD,
          seq($._expression, choice("+", "-"), $._expression),
        ),
        prec.left(
          PREC.SHIFT,
          seq($._expression, choice("<<", ">>"), $._expression),
        ),
        prec.left(
          PREC.REL,
          seq($._expression, choice("<", "<=", ">", ">="), $._expression),
        ),
        prec.left(
          PREC.EQUAL,
          seq($._expression, choice("==", "!="), $._expression),
        ),
        prec.left(PREC.BIT_AND, seq($._expression, "&", $._expression)),
        prec.left(PREC.BIT_XOR, seq($._expression, "^", $._expression)),
        prec.left(PREC.BIT_OR, seq($._expression, "|", $._expression)),
        prec.left(PREC.LOGICAL_AND, seq($._expression, "&&", $._expression)),
        prec.left(PREC.LOGICAL_OR, seq($._expression, "||", $._expression)),
        prec.right(
          PREC.ASSIGN,
          seq(
            $._expression,
            choice("=", "+=", "-=", "*=", "/=", "%=", "^=", "<<=", ">>="),
            $._expression,
          ),
        ),
      ),

    function_call: ($) =>
      prec(
        PREC.POSTFIX,
        seq(
          field("caller", $._expression),
          "(",
          optional($._argument_list),
          ")",
        ),
      ),

    _argument_list: ($) =>
      seq($._expression, repeat(seq(",", $._expression)), optional(",")),

    member_access: ($) =>
      prec(
        PREC.MEMBER,
        seq(field("base", $._expression), ".", field("member", $.identifier)),
      ),

    index_expression: ($) =>
      prec(
        PREC.POSTFIX,
        seq(
          field("base", $._expression),
          "[",
          field("index", $._expression),
          "]",
        ),
      ),

    array_literal: ($) =>
      seq(
        "[",
        optional(
          seq($._expression, repeat(seq(",", $._expression)), optional(",")),
        ),
        "]",
      ),

    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    number_literal: ($) => /\d+(\.\d+)?/,

    string_literal: ($) => /"([^"\\]|\\.)*"/,

    char_literal: ($) => /'([^'\\]|\\.)'/,

    boolean_literal: ($) => choice("true", "false"),

    null_literal: ($) => "null",
  },
});
