"""
Comprehensive unit and integration tests for the CodeOpt compiler engine.
"""
import unittest
import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from compiler.compiler_engine import CompilerEngine
from compiler.lexer.lexer import Lexer
from compiler.parser.parser import Parser
from compiler.semantic.semantic_analyzer import SemanticAnalyzer

class TestCodeOptCompiler(unittest.TestCase):
    def setUp(self):
        self.engine = CompilerEngine()

    def test_lexer_tokens(self):
        code = "int x = 10 + 20;"
        lexer = Lexer(code)
        tokens, errors = lexer.tokenize()
        self.assertEqual(len(errors), 0)
        types = [t.type.value for t in tokens[:-1]]
        self.assertEqual(types, ["KEYWORD_INT", "IDENTIFIER", "ASSIGN", "INTEGER", "PLUS", "INTEGER", "SEMICOLON"])

    def test_lexer_invalid_char(self):
        code = "int @ = 5;"
        lexer = Lexer(code)
        _, errors = lexer.tokenize()
        self.assertGreater(len(errors), 0)
        self.assertIn("Unexpected character '@'", errors[0].message)

    def test_parser_syntax_error(self):
        code = "if (x > 10 { print(x); }"
        lexer = Lexer(code)
        tokens, _ = lexer.tokenize()
        parser = Parser(tokens)
        _, errors, _ = parser.parse()
        self.assertGreater(len(errors), 0)
        self.assertIn("Expected ')'", errors[0].message)

    def test_semantic_undefined_var(self):
        code = "int x = y + 10;"
        lexer = Lexer(code)
        tokens, _ = lexer.tokenize()
        parser = Parser(tokens)
        ast, _, _ = parser.parse()
        analyzer = SemanticAnalyzer()
        res = analyzer.analyze(ast)
        self.assertGreater(len(res["errors"]), 0)
        self.assertIn("Variable 'y' is not declared", res["errors"][0]["message"])

    def test_semantic_duplicate_var(self):
        code = "int x = 10; int x = 20;"
        lexer = Lexer(code)
        tokens, _ = lexer.tokenize()
        parser = Parser(tokens)
        ast, _, _ = parser.parse()
        analyzer = SemanticAnalyzer()
        res = analyzer.analyze(ast)
        self.assertGreater(len(res["errors"]), 0)
        self.assertIn("has already been declared", res["errors"][0]["message"])

    def test_semantic_type_mismatch(self):
        code = "int x = true;"
        lexer = Lexer(code)
        tokens, _ = lexer.tokenize()
        parser = Parser(tokens)
        ast, _, _ = parser.parse()
        analyzer = SemanticAnalyzer()
        res = analyzer.analyze(ast)
        self.assertGreater(len(res["errors"]), 0)
        self.assertIn("Cannot assign bool value to int", res["errors"][0]["message"])

    def test_full_pipeline_and_optimization(self):
        code = """
        int x = 10 * 20;
        int y = x + 0;
        int z = y * 1;
        int unused = 500;
        if (false) {
            int a = 100;
        }
        print(z);
        """
        result = self.engine.compile(code)
        self.assertTrue(result["success"])
        self.assertGreater(len(result["tokens"]), 0)
        self.assertIsNotNone(result["ast"])
        self.assertGreater(len(result["symbolTable"]), 0)
        self.assertGreater(len(result["irBefore"]), 0)
        self.assertGreater(len(result["basicBlocks"]), 0)
        self.assertGreater(len(result["optimizationPasses"]), 0)
        self.assertGreater(len(result["transformations"]), 0)

        # Check optimization stats
        stats = result["statistics"]
        self.assertGreater(stats["instructionsRemoved"], 0)
        self.assertGreater(stats["instructionReductionPercentage"], 0)
        self.assertGreater(stats["techniqueBreakdown"]["constantFolding"], 0)
        self.assertGreater(stats["techniqueBreakdown"]["algebraicSimplification"], 0)
        self.assertGreater(stats["techniqueBreakdown"]["deadCodeElimination"], 0)

        # Print summary for confirmation
        print(f"\n[Test Passed] Total Transformations: {stats['totalTransformations']}")
        print(f"Original IR count: {stats['irBeforeCount']}, Optimized IR count: {stats['irAfterCount']}")
        print(f"Reduction: {stats['instructionReductionPercentage']}%")

if __name__ == "__main__":
    unittest.main()
