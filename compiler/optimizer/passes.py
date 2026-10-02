"""
Optimization Passes Implementation for Three-Address Code.
Includes:
- Constant Folding
- Constant Propagation
- Algebraic Simplification
- Copy Propagation
- Common Subexpression Elimination (CSE)
- Strength Reduction
- Dead Code Elimination (DCE)
- Unreachable Code Elimination
"""
from typing import List, Dict, Tuple, Any
from ..ir.tac import TACInstruction

def is_constant(val):
    if val is None:
        return False
    val_str = str(val).strip()
    if val_str in ("true", "false"):
        return True
    try:
        int(val_str)
        return True
    except ValueError:
        try:
            float(val_str)
            return True
        except ValueError:
            return False

def parse_const(val):
    val_str = str(val).strip()
    if val_str == "true":
        return True
    if val_str == "false":
        return False
    try:
        return int(val_str)
    except ValueError:
        return float(val_str)

def format_const(val):
    if isinstance(val, bool):
        return "true" if val else "false"
    if isinstance(val, float) and val.is_integer():
        return str(int(val))
    return str(val)


class OptimizationPass:
    def __init__(self, name: str):
        self.name = name

    def run(self, instructions: List[TACInstruction]) -> Tuple[List[TACInstruction], List[Dict[str, Any]], bool]:
        raise NotImplementedError


class ConstantFoldingPass(OptimizationPass):
    def __init__(self):
        super().__init__("Constant Folding")

    def run(self, instructions: List[TACInstruction]):
        new_instrs = []
        transforms = []
        changed = False

        for instr in instructions:
            # Unary folding: result = op arg1
            if instr.op in ('!', '-_unary') and is_constant(instr.arg1):
                c1 = parse_const(instr.arg1)
                orig_str = instr.to_str()
                if instr.op == '!':
                    folded_val = not bool(c1)
                else:
                    folded_val = -c1
                res_str = format_const(folded_val)
                new_instr = TACInstruction("=", arg1=res_str, result=instr.result, line=instr.line)
                new_instrs.append(new_instr)
                transforms.append({
                    "technique": "Constant Folding",
                    "original": orig_str,
                    "optimized": new_instr.to_str(),
                    "explanation": f"Evaluated unary compile-time constant '{instr.op}{instr.arg1}' to '{res_str}'.",
                    "line": instr.line
                })
                changed = True
                continue

            # Binary folding: result = arg1 op arg2
            if instr.arg1 is not None and instr.arg2 is not None and is_constant(instr.arg1) and is_constant(instr.arg2):
                c1 = parse_const(instr.arg1)
                c2 = parse_const(instr.arg2)
                orig_str = instr.to_str()
                folded = None

                try:
                    if instr.op == '+':
                        folded = c1 + c2
                    elif instr.op == '-':
                        folded = c1 - c2
                    elif instr.op == '*':
                        folded = c1 * c2
                    elif instr.op == '/':
                        if c2 != 0:
                            folded = c1 / c2 if isinstance(c1, float) or isinstance(c2, float) else c1 // c2
                    elif instr.op == '%':
                        if c2 != 0:
                            folded = int(c1) % int(c2)
                    elif instr.op == '==':
                        folded = (c1 == c2)
                    elif instr.op == '!=':
                        folded = (c1 != c2)
                    elif instr.op == '<':
                        folded = (c1 < c2)
                    elif instr.op == '>':
                        folded = (c1 > c2)
                    elif instr.op == '<=':
                        folded = (c1 <= c2)
                    elif instr.op == '>=':
                        folded = (c1 >= c2)
                    elif instr.op == '&&':
                        folded = bool(c1) and bool(c2)
                    elif instr.op == '||':
                        folded = bool(c1) or bool(c2)
                except Exception:
                    folded = None

                if folded is not None:
                    res_str = format_const(folded)
                    new_instr = TACInstruction("=", arg1=res_str, result=instr.result, line=instr.line)
                    new_instrs.append(new_instr)
                    transforms.append({
                        "technique": "Constant Folding",
                        "original": orig_str,
                        "optimized": new_instr.to_str(),
                        "explanation": f"Evaluated expression '{instr.arg1} {instr.op} {instr.arg2}' at compile-time to constant '{res_str}'.",
                        "line": instr.line
                    })
                    changed = True
                    continue

            new_instrs.append(instr.copy())

        return new_instrs, transforms, changed


class ConstantPropagationPass(OptimizationPass):
    def __init__(self):
        super().__init__("Constant Propagation")

    def run(self, instructions: List[TACInstruction]):
        new_instrs = []
        transforms = []
        changed = False
        const_map = {} # var -> constant_value string

        for instr in instructions:
            # Clear knowledge across branch boundaries / labels
            if instr.op in ("LABEL", "GOTO", "IF_FALSE_GOTO", "IF_TRUE_GOTO"):
                if instr.op == "LABEL":
                    const_map.clear()

            orig_str = instr.to_str()
            modified = False
            a1 = instr.arg1
            a2 = instr.arg2

            # Propagate into arg1
            if a1 and a1 in const_map and not is_constant(a1):
                a1 = const_map[a1]
                modified = True

            # Propagate into arg2
            if a2 and a2 in const_map and not is_constant(a2):
                a2 = const_map[a2]
                modified = True

            new_instr = TACInstruction(instr.op, a1, a2, instr.result, instr.line)

            if modified:
                transforms.append({
                    "technique": "Constant Propagation",
                    "original": orig_str,
                    "optimized": new_instr.to_str(),
                    "explanation": f"Propagated known constant value into instruction '{orig_str}'.",
                    "line": instr.line
                })
                changed = True

            # Track new constant assignment
            if new_instr.op == "=" and is_constant(new_instr.arg1):
                const_map[new_instr.result] = new_instr.arg1
            elif new_instr.result:
                # Variable was overwritten with a non-constant
                const_map.pop(new_instr.result, None)

            new_instrs.append(new_instr)

        return new_instrs, transforms, changed


class AlgebraicSimplificationPass(OptimizationPass):
    def __init__(self):
        super().__init__("Algebraic Simplification")

    def run(self, instructions: List[TACInstruction]):
        new_instrs = []
        transforms = []
        changed = False

        for instr in instructions:
            orig_str = instr.to_str()
            rule = None
            simplified = None

            # Additive identities: x + 0 -> x, 0 + x -> x
            if instr.op == '+':
                if instr.arg2 == "0":
                    simplified = TACInstruction("=", arg1=instr.arg1, result=instr.result, line=instr.line)
                    rule = "x + 0 = x"
                elif instr.arg1 == "0":
                    simplified = TACInstruction("=", arg1=instr.arg2, result=instr.result, line=instr.line)
                    rule = "0 + x = x"

            # Subtractive identities: x - 0 -> x, x - x -> 0
            elif instr.op == '-':
                if instr.arg2 == "0":
                    simplified = TACInstruction("=", arg1=instr.arg1, result=instr.result, line=instr.line)
                    rule = "x - 0 = x"
                elif instr.arg1 == instr.arg2:
                    simplified = TACInstruction("=", arg1="0", result=instr.result, line=instr.line)
                    rule = "x - x = 0"

            # Multiplicative identities: x * 1 -> x, 1 * x -> x, x * 0 -> 0, 0 * x -> 0
            elif instr.op == '*':
                if instr.arg2 == "1":
                    simplified = TACInstruction("=", arg1=instr.arg1, result=instr.result, line=instr.line)
                    rule = "x * 1 = x"
                elif instr.arg1 == "1":
                    simplified = TACInstruction("=", arg1=instr.arg2, result=instr.result, line=instr.line)
                    rule = "1 * x = x"
                elif instr.arg2 == "0" or instr.arg1 == "0":
                    simplified = TACInstruction("=", arg1="0", result=instr.result, line=instr.line)
                    rule = "x * 0 = 0"

            # Division identities: x / 1 -> x
            elif instr.op == '/':
                if instr.arg2 == "1":
                    simplified = TACInstruction("=", arg1=instr.arg1, result=instr.result, line=instr.line)
                    rule = "x / 1 = x"

            # Logical identities: x && true -> x, x || false -> x
            elif instr.op == '&&':
                if instr.arg2 == "true":
                    simplified = TACInstruction("=", arg1=instr.arg1, result=instr.result, line=instr.line)
                    rule = "x && true = x"
                elif instr.arg1 == "true":
                    simplified = TACInstruction("=", arg1=instr.arg2, result=instr.result, line=instr.line)
                    rule = "true && x = x"
                elif instr.arg1 == "false" or instr.arg2 == "false":
                    simplified = TACInstruction("=", arg1="false", result=instr.result, line=instr.line)
                    rule = "x && false = false"

            elif instr.op == '||':
                if instr.arg2 == "false":
                    simplified = TACInstruction("=", arg1=instr.arg1, result=instr.result, line=instr.line)
                    rule = "x || false = x"
                elif instr.arg1 == "false":
                    simplified = TACInstruction("=", arg1=instr.arg2, result=instr.result, line=instr.line)
                    rule = "false || x = x"
                elif instr.arg1 == "true" or instr.arg2 == "true":
                    simplified = TACInstruction("=", arg1="true", result=instr.result, line=instr.line)
                    rule = "x || true = true"

            if simplified:
                new_instrs.append(simplified)
                transforms.append({
                    "technique": "Algebraic Simplification",
                    "original": orig_str,
                    "optimized": simplified.to_str(),
                    "explanation": f"Applied algebraic identity rule: '{rule}'.",
                    "line": instr.line
                })
                changed = True
            else:
                new_instrs.append(instr.copy())

        return new_instrs, transforms, changed


class CopyPropagationPass(OptimizationPass):
    def __init__(self):
        super().__init__("Copy Propagation")

    def run(self, instructions: List[TACInstruction]):
        new_instrs = []
        transforms = []
        changed = False
        copies = {} # var -> original_var

        for instr in instructions:
            if instr.op in ("LABEL", "GOTO", "IF_FALSE_GOTO", "IF_TRUE_GOTO"):
                copies.clear()

            orig_str = instr.to_str()
            modified = False
            a1 = instr.arg1
            a2 = instr.arg2

            # Replace arg1 if it is a known copy
            while a1 in copies:
                a1 = copies[a1]
                modified = True

            # Replace arg2 if it is a known copy
            while a2 in copies:
                a2 = copies[a2]
                modified = True

            new_instr = TACInstruction(instr.op, a1, a2, instr.result, instr.line)

            if modified:
                transforms.append({
                    "technique": "Copy Propagation",
                    "original": orig_str,
                    "optimized": new_instr.to_str(),
                    "explanation": f"Replaced variable use with copied variable value in '{orig_str}'.",
                    "line": instr.line
                })
                changed = True

            # Track new copy: x = y
            if new_instr.op == "=" and new_instr.arg1 and not is_constant(new_instr.arg1):
                copies[new_instr.result] = new_instr.arg1
            elif new_instr.result:
                # Invalidate any copies that depended on modified result
                to_delete = [k for k, v in copies.items() if k == new_instr.result or v == new_instr.result]
                for k in to_delete:
                    copies.pop(k, None)

            new_instrs.append(new_instr)

        return new_instrs, transforms, changed


class CommonSubexpressionEliminationPass(OptimizationPass):
    def __init__(self):
        super().__init__("Common Subexpression Elimination")

    def run(self, instructions: List[TACInstruction]):
        new_instrs = []
        transforms = []
        changed = False
        expr_cache = {} # (op, arg1, arg2) -> temp/result

        for instr in instructions:
            if instr.op in ("LABEL", "GOTO", "IF_FALSE_GOTO", "IF_TRUE_GOTO"):
                expr_cache.clear()

            # Binary expression
            if instr.op not in ("=", "LABEL", "GOTO", "IF_FALSE_GOTO", "IF_TRUE_GOTO", "PRINT", "RETURN", "NOP", "!"):
                expr_key = (instr.op, str(instr.arg1), str(instr.arg2))
                comm_key = (instr.op, str(instr.arg2), str(instr.arg1)) if instr.op in ('+', '*') else None

                matched_res = expr_cache.get(expr_key)
                if not matched_res and comm_key:
                    matched_res = expr_cache.get(comm_key)

                if matched_res:
                    # Detected duplicate computation!
                    orig_str = instr.to_str()
                    eliminated_instr = TACInstruction("=", arg1=matched_res, result=instr.result, line=instr.line)
                    new_instrs.append(eliminated_instr)
                    transforms.append({
                        "technique": "Common Subexpression Elimination",
                        "original": orig_str,
                        "optimized": eliminated_instr.to_str(),
                        "explanation": f"Reused existing computation of '{instr.arg1} {instr.op} {instr.arg2}' previously stored in '{matched_res}'.",
                        "line": instr.line
                    })
                    changed = True
                    continue
                else:
                    expr_cache[expr_key] = instr.result

            # Invalidate cached expressions if any operand is overwritten
            if instr.result:
                to_remove = [k for k in expr_cache if k[1] == instr.result or k[2] == instr.result]
                for k in to_remove:
                    expr_cache.pop(k, None)

            new_instrs.append(instr.copy())

        return new_instrs, transforms, changed


class StrengthReductionPass(OptimizationPass):
    def __init__(self):
        super().__init__("Strength Reduction")

    def run(self, instructions: List[TACInstruction]):
        new_instrs = []
        transforms = []
        changed = False

        for instr in instructions:
            orig_str = instr.to_str()
            reduced = None

            # Safe strength reduction: x * 2 -> x + x, 2 * x -> x + x
            if instr.op == '*':
                if instr.arg2 == "2":
                    reduced = TACInstruction("+", arg1=instr.arg1, arg2=instr.arg1, result=instr.result, line=instr.line)
                elif instr.arg1 == "2":
                    reduced = TACInstruction("+", arg1=instr.arg2, arg2=instr.arg2, result=instr.result, line=instr.line)

            if reduced:
                new_instrs.append(reduced)
                transforms.append({
                    "technique": "Strength Reduction",
                    "original": orig_str,
                    "optimized": reduced.to_str(),
                    "explanation": f"Replaced multiplication by 2 with equivalent addition ('{orig_str}' -> '{reduced.to_str()}').",
                    "line": instr.line
                })
                changed = True
            else:
                new_instrs.append(instr.copy())

        return new_instrs, transforms, changed


class DeadCodeEliminationPass(OptimizationPass):
    def __init__(self):
        super().__init__("Dead Code Elimination")

    def run(self, instructions: List[TACInstruction]):
        # Analyze variable uses
        used_vars = set()
        for instr in instructions:
            if instr.op in ("PRINT", "RETURN"):
                if instr.arg1 and not is_constant(instr.arg1):
                    used_vars.add(instr.arg1)
            elif instr.op in ("IF_FALSE_GOTO", "IF_TRUE_GOTO"):
                if instr.arg1 and not is_constant(instr.arg1):
                    used_vars.add(instr.arg1)
            else:
                if instr.arg1 and not is_constant(instr.arg1):
                    used_vars.add(instr.arg1)
                if instr.arg2 and not is_constant(instr.arg2):
                    used_vars.add(instr.arg2)

        new_instrs = []
        transforms = []
        changed = False

        for instr in instructions:
            # Check if this instruction assigns to a variable that is NEVER used anywhere
            if instr.result and instr.result not in used_vars:
                # Do not delete side-effecting instructions or labels
                if instr.op not in ("LABEL", "GOTO", "IF_FALSE_GOTO", "IF_TRUE_GOTO", "PRINT", "RETURN"):
                    transforms.append({
                        "technique": "Dead Code Elimination",
                        "original": instr.to_str(),
                        "optimized": "[Removed]",
                        "explanation": f"Removed unused variable assignment '{instr.to_str()}'; '{instr.result}' is never referenced.",
                        "line": instr.line
                    })
                    changed = True
                    continue

            new_instrs.append(instr.copy())

        return new_instrs, transforms, changed


class UnreachableCodeEliminationPass(OptimizationPass):
    def __init__(self):
        super().__init__("Unreachable Code Elimination")

    def run(self, instructions: List[TACInstruction]):
        new_instrs = []
        transforms = []
        changed = False
        i = 0
        n = len(instructions)

        while i < n:
            instr = instructions[i]

            # 1. Constant branch evaluation: if_false false goto L (never jumps) / if_false true goto L (always jumps)
            if instr.op == "IF_FALSE_GOTO" and is_constant(instr.arg1):
                cond_val = parse_const(instr.arg1)
                orig_str = instr.to_str()
                if cond_val:
                    # Condition is true, so if_false NEVER branches!
                    transforms.append({
                        "technique": "Unreachable Code Elimination",
                        "original": orig_str,
                        "optimized": "[Removed branch]",
                        "explanation": f"Condition evaluated to constant true; false-branch '{orig_str}' will never trigger.",
                        "line": instr.line
                    })
                    changed = True
                    i += 1
                    continue
                else:
                    # Condition is false, so it ALWAYS jumps to target
                    new_instr = TACInstruction("GOTO", result=instr.result, line=instr.line)
                    new_instrs.append(new_instr)
                    transforms.append({
                        "technique": "Unreachable Code Elimination",
                        "original": orig_str,
                        "optimized": new_instr.to_str(),
                        "explanation": f"Condition evaluated to constant false; converted conditional jump to unconditional goto '{instr.result}'.",
                        "line": instr.line
                    })
                    changed = True
                    i += 1
                    continue

            # 2. Dead instructions immediately following an unconditional goto before any label
            if instr.op in ("GOTO", "RETURN"):
                new_instrs.append(instr.copy())
                i += 1
                while i < n and instructions[i].op != "LABEL":
                    unreachable_instr = instructions[i]
                    transforms.append({
                        "technique": "Unreachable Code Elimination",
                        "original": unreachable_instr.to_str(),
                        "optimized": "[Removed]",
                        "explanation": f"Removed unreachable instruction '{unreachable_instr.to_str()}' occurring after jump.",
                        "line": unreachable_instr.line
                    })
                    changed = True
                    i += 1
                continue

            new_instrs.append(instr.copy())
            i += 1

        return new_instrs, transforms, changed
