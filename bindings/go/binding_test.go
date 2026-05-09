package tree_sitter_tereix_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_tereix "github.com/chaosthechaotic/tree-sitter-tereix.git/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_tereix.Language())
	if language == nil {
		t.Errorf("Error loading Tereix grammar")
	}
}
