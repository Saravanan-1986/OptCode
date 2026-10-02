"""
Multi-Pass Optimization Engine for Three-Address Code.
Records the exact IR state before and after every single pass,
captures every transformation with human-readable explanations,
and computes academic compiler optimization statistics.
"""
from typing import List, Dict, Any
import time
from ..ir.tac import TACInstruction
from .passes import (
    ConstantFoldingPass,
    ConstantPropagationPass,
    AlgebraicSimplificationPass,
    CopyPropagationPass,
    CommonSubexpressionEliminationPass,
    StrengthReductionPass,
    DeadCodeEliminationPass,
    UnreachableCodeEliminationPass
)

class OptimizationEngine:
    def __init__(self):
        self.default_passes = [
            ConstantFoldingPass(),
            ConstantPropagationPass(),
            AlgebraicSimplificationPass(),
            CopyPropagationPass(),
            CommonSubexpressionEliminationPass(),
            StrengthReductionPass(),
            DeadCodeEliminationPass(),
            UnreachableCodeEliminationPass()
        ]

    def optimize(self, initial_instructions: List[TACInstruction], iterations: int = 2):
        start_time = time.perf_counter()
        current_instructions = [instr.copy() for instr in initial_instructions]
        all_pass_records = []
        all_transformations = []

        pass_num = 1
        for iteration in range(iterations):
            iteration_had_changes = False

            for opt_pass in self.default_passes:
                ir_before_snapshot = [instr.copy() for instr in current_instructions]
                ir_after_snapshot, transforms, changed = opt_pass.run(current_instructions)

                # Record pass data
                pass_record = {
                    "passNumber": pass_num,
                    "iteration": iteration + 1,
                    "passName": opt_pass.name,
                    "changed": changed,
                    "transformationsCount": len(transforms),
                    "transformations": transforms,
                    "irBefore": [instr.to_str() for instr in ir_before_snapshot],
                    "irBeforeObjects": [instr.to_dict(i + 1) for i, instr in enumerate(ir_before_snapshot)],
                    "irAfter": [instr.to_str() for instr in ir_after_snapshot],
                    "irAfterObjects": [instr.to_dict(i + 1) for i, instr in enumerate(ir_after_snapshot)],
                }
                all_pass_records.append(pass_record)
                all_transformations.extend(transforms)

                current_instructions = ir_after_snapshot
                if changed:
                    iteration_had_changes = True
                pass_num += 1

            if not iteration_had_changes:
                # Reached fixed point
                break

        end_time = time.perf_counter()
        opt_duration_ms = round((end_time - start_time) * 1000, 3)

        # Compute statistics
        ir_before_count = len(initial_instructions)
        ir_after_count = len(current_instructions)
        instructions_removed = max(0, ir_before_count - ir_after_count)
        reduction_pct = round((instructions_removed / ir_before_count * 100), 2) if ir_before_count > 0 else 0.0

        technique_counts = {
            "constantFolding": sum(1 for t in all_transformations if t["technique"] == "Constant Folding"),
            "constantPropagation": sum(1 for t in all_transformations if t["technique"] == "Constant Propagation"),
            "algebraicSimplification": sum(1 for t in all_transformations if t["technique"] == "Algebraic Simplification"),
            "copyPropagation": sum(1 for t in all_transformations if t["technique"] == "Copy Propagation"),
            "commonSubexpressionElimination": sum(1 for t in all_transformations if t["technique"] == "Common Subexpression Elimination"),
            "strengthReduction": sum(1 for t in all_transformations if t["technique"] == "Strength Reduction"),
            "deadCodeElimination": sum(1 for t in all_transformations if t["technique"] == "Dead Code Elimination"),
            "unreachableCodeElimination": sum(1 for t in all_transformations if t["technique"] == "Unreachable Code Elimination"),
        }

        stats = {
            "irBeforeCount": ir_before_count,
            "irAfterCount": ir_after_count,
            "instructionsRemoved": instructions_removed,
            "instructionReductionPercentage": reduction_pct,
            "totalTransformations": len(all_transformations),
            "passesApplied": len(all_pass_records),
            "optimizationTimeMs": opt_duration_ms,
            "techniqueBreakdown": technique_counts
        }

        return {
            "irBefore": [instr.to_str() for instr in initial_instructions],
            "irBeforeObjects": [instr.to_dict(i + 1) for i, instr in enumerate(initial_instructions)],
            "irAfter": [instr.to_str() for instr in current_instructions],
            "irAfterObjects": [instr.to_dict(i + 1) for i, instr in enumerate(current_instructions)],
            "passRecords": all_pass_records,
            "transformations": all_transformations,
            "statistics": stats,
            "optimizedInstructions": current_instructions
        }
