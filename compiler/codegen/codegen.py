"""
Code Generator that reconstructs formatted C-like source code
from optimized Three-Address Code (TAC).
"""
from typing import List
from ..ir.tac import TACInstruction

class CodeGenerator:
    def __init__(self, declared_types=None):
        self.declared_types = declared_types or {} # var_name -> 'int' | 'float' | 'bool'

    def generate(self, instructions: List[TACInstruction]) -> str:
        if not instructions:
            return "// No instructions generated."

        lines = ["// === CodeOpt Generated Optimized Program ==="]
        declared = set()
        indent = "    "
        current_indent = ""

        # Pre-scan instructions to identify declared types or default to inferred type
        for instr in instructions:
            if instr.result and instr.result not in declared and not instr.result.startswith("L"):
                # Infer type
                var_type = self.declared_types.get(instr.result)
                if not var_type:
                    if instr.arg1 in ("true", "false"):
                        var_type = "bool"
                    elif "." in str(instr.arg1):
                        var_type = "float"
                    else:
                        var_type = "int"
                declared.add(instr.result)

        emitted_vars = set()

        for instr in instructions:
            if instr.op == "NOP":
                continue

            if instr.op == "LABEL":
                lines.append(f"\n{instr.result}:")
                continue

            if instr.op == "GOTO":
                lines.append(f"{indent}goto {instr.result};")
                continue

            if instr.op == "IF_FALSE_GOTO":
                lines.append(f"{indent}if (!({instr.arg1})) goto {instr.result};")
                continue

            if instr.op == "IF_TRUE_GOTO":
                lines.append(f"{indent}if ({instr.arg1}) goto {instr.result};")
                continue

            if instr.op == "PRINT":
                lines.append(f"{indent}print({instr.arg1});")
                continue

            if instr.op == "RETURN":
                if instr.arg1:
                    lines.append(f"{indent}return {instr.arg1};")
                else:
                    lines.append(f"{indent}return;")
                continue

            # Assignments
            res = instr.result
            type_prefix = ""
            if res not in emitted_vars:
                var_t = self.declared_types.get(res, "int")
                type_prefix = f"{var_t} "
                emitted_vars.add(res)

            if instr.op == "=":
                lines.append(f"{indent}{type_prefix}{res} = {instr.arg1};")
            elif instr.op in ('!', '-_unary'):
                op_sym = '!' if instr.op == '!' else '-'
                lines.append(f"{indent}{type_prefix}{res} = {op_sym}{instr.arg1};")
            else:
                lines.append(f"{indent}{type_prefix}{res} = {instr.arg1} {instr.op} {instr.arg2};")

        return "\n".join(lines)
