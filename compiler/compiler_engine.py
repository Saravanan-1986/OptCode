"""
Master Compiler Engine for CodeOpt.
Connects Lexer, Parser, AST, Semantic Analyzer, Symbol Table,
IR Generator, Basic Block partitioner, CFG builder, Multi-pass Optimizer,
and Code Generator into a cohesive pipeline.
"""
import time
import json
from typing import Dict, Any

from .lexer.lexer import Lexer
from .parser.parser import Parser
from .semantic.semantic_analyzer import SemanticAnalyzer
from .ir.ir_generator import IRGenerator
from .basic_blocks.basic_blocks import CFGBuilder
from .optimizer.optimizer import OptimizationEngine
from .codegen.codegen import CodeGenerator

class CompilerEngine:
    def __init__(self):
        self.optimizer = OptimizationEngine()

    def compile(self, source_code: str) -> Dict[str, Any]:
        total_start = time.perf_counter()
        result = {
            "success": True,
            "tokens": [],
            "parseTree": {},
            "ast": {},
            "astNodeCount": 0,
            "semanticAnalysis": {
                "errors": [],
                "warnings": [],
                "symbolTable": []
            },
            "symbolTable": [],
            "irBefore": [],
            "irBeforeRaw": "",
            "basicBlocks": [],
            "cfg": { "nodes": [], "edges": [] },
            "optimizationPasses": [],
            "transformations": [],
            "irAfter": [],
            "irAfterRaw": "",
            "optimizedCode": "",
            "statistics": {},
            "errors": []
        }

        # ----------------------------------------------------
        # Stage 1: Lexical Analysis
        # ----------------------------------------------------
        lexer = Lexer(source_code)
        tokens, lex_errors = lexer.tokenize()
        result["tokens"] = lexer.get_token_table()

        if lex_errors:
            result["success"] = False
            result["errors"] = [e.to_dict() for e in lex_errors]
            return result

        # ----------------------------------------------------
        # Stage 2: Syntax Analysis & AST Construction
        # ----------------------------------------------------
        parser = Parser(tokens)
        ast_root, syntax_errors, parse_tree = parser.parse()
        result["parseTree"] = parse_tree

        if syntax_errors:
            result["success"] = False
            result["errors"] = [e.to_dict() for e in syntax_errors]
            return result

        result["ast"] = ast_root.to_dict() if ast_root else {}
        result["astNodeCount"] = ast_root.count_nodes() if ast_root else 0

        # ----------------------------------------------------
        # Stage 3: Semantic Analysis & Symbol Table
        # ----------------------------------------------------
        analyzer = SemanticAnalyzer()
        semantic_res = analyzer.analyze(ast_root)
        result["semanticAnalysis"] = semantic_res
        result["symbolTable"] = semantic_res.get("symbolTable", [])

        if semantic_res.get("errors"):
            result["success"] = False
            result["errors"] = semantic_res["errors"]
            return result

        # ----------------------------------------------------
        # Stage 4: Intermediate Representation (TAC)
        # ----------------------------------------------------
        ir_gen = IRGenerator()
        initial_ir = ir_gen.generate(ast_root)
        result["irBefore"] = [instr.to_dict(i + 1) for i, instr in enumerate(initial_ir)]
        result["irBeforeRaw"] = "\n".join(instr.to_str() for instr in initial_ir)

        # ----------------------------------------------------
        # Stage 5: Basic Blocks & Control Flow Graph
        # ----------------------------------------------------
        cfg_builder = CFGBuilder(initial_ir)
        basic_blocks, cfg_graph = cfg_builder.build()
        result["basicBlocks"] = basic_blocks
        result["cfg"] = cfg_graph

        # ----------------------------------------------------
        # Stage 6: Optimization Passes
        # ----------------------------------------------------
        opt_res = self.optimizer.optimize(initial_ir, iterations=2)
        result["optimizationPasses"] = opt_res["passRecords"]
        result["transformations"] = opt_res["transformations"]
        result["irAfter"] = opt_res["irAfterObjects"]
        result["irAfterRaw"] = "\n".join(opt_res["irAfter"])

        # ----------------------------------------------------
        # Stage 7: Code Generation
        # ----------------------------------------------------
        # Map variable types from symbol table for accurate typing
        type_map = {sym["name"]: sym["type"] for sym in result["symbolTable"]}
        codegen = CodeGenerator(declared_types=type_map)
        result["optimizedCode"] = codegen.generate(opt_res["optimizedInstructions"])

        total_end = time.perf_counter()
        total_time_ms = round((total_end - total_start) * 1000, 3)

        # Compile comprehensive statistics
        stats = opt_res["statistics"]
        stats.update({
            "tokenCount": len(result["tokens"]),
            "astNodeCount": result["astNodeCount"],
            "compilationTimeMs": total_time_ms
        })
        result["statistics"] = stats

        return result
