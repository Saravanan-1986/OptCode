"""
Semantic Analyzer for C-like language subset.
Performs type checking, scope validation, and builds the symbol table.
"""
from ..symbol_table.symbol_table import SymbolTable, Symbol
from ..ast.ast_nodes import (
    ProgramNode, VarDeclNode, AssignNode, BinaryOpNode,
    UnaryOpNode, LiteralNode, IdentifierNode, IfNode,
    WhileNode, ForNode, BlockNode, PrintNode, ReturnNode
)

class SemanticError(Exception):
    def __init__(self, message, line, column, error_type="Semantic Error"):
        super().__init__(f"{error_type} at Line {line}, Column {column}: {message}")
        self.message = message
        self.line = line
        self.column = column
        self.error_type = error_type

    def to_dict(self):
        return {
            "type": self.error_type,
            "message": self.message,
            "line": self.line,
            "column": self.column
        }

class SemanticAnalyzer:
    def __init__(self):
        self.global_scope = SymbolTable(scope_name="global")
        self.current_scope = self.global_scope
        self.errors = []
        self.warnings = []
        self.scope_counter = 0

    def analyze(self, ast_root: ProgramNode):
        self.global_scope = SymbolTable(scope_name="global")
        self.current_scope = self.global_scope
        self.errors = []
        self.warnings = []
        self.scope_counter = 0

        self.visit(ast_root)
        
        # Check for unused variables and add academic warnings
        all_syms = self.global_scope.get_all_symbols()
        for sym in all_syms:
            if not sym.is_used and sym.name != "main":
                self.warnings.append({
                    "type": "Semantic Warning",
                    "message": f"Variable '{sym.name}' declared at line {sym.line} is never used.",
                    "line": sym.line,
                    "column": 1
                })

        symbol_table_list = [sym.to_dict(i + 1) for i, sym in enumerate(all_syms)]
        return {
            "errors": [e.to_dict() for e in self.errors],
            "warnings": self.warnings,
            "symbolTable": symbol_table_list,
            "scopeCount": self.scope_counter + 1
        }

    def visit(self, node):
        if node is None:
            return None
        method_name = f"visit_{type(node).__name__}"
        visitor = getattr(self, method_name, self.generic_visit)
        return visitor(node)

    def generic_visit(self, node):
        return None

    def visit_ProgramNode(self, node: ProgramNode):
        for stmt in node.statements:
            self.visit(stmt)

    def visit_VarDeclNode(self, node: VarDeclNode):
        # Check duplicate declaration in current scope
        existing = self.current_scope.lookup_current(node.identifier)
        if existing:
            self.errors.append(SemanticError(
                f"Variable '{node.identifier}' has already been declared in this scope.",
                node.line, node.column
            ))
            return

        init_val = None
        if node.init_expr:
            expr_type, expr_val = self.visit(node.init_expr)
            if expr_type and not self._types_compatible(node.var_type, expr_type):
                self.errors.append(SemanticError(
                    f"Cannot assign {expr_type} value to {node.var_type} variable '{node.identifier}'.",
                    node.line, node.column
                ))
            init_val = expr_val

        sym = Symbol(node.identifier, node.var_type, self.current_scope.scope_name, node.line, init_val)
        self.current_scope.define(sym)

    def visit_AssignNode(self, node: AssignNode):
        sym = self.current_scope.lookup(node.target)
        if not sym:
            self.errors.append(SemanticError(
                f"Variable '{node.target}' is not declared.",
                node.line, node.column
            ))
            return

        expr_type, _ = self.visit(node.expr)
        if expr_type and not self._types_compatible(sym.type, expr_type):
            self.errors.append(SemanticError(
                f"Cannot assign {expr_type} value to {sym.type} variable '{node.target}'.",
                node.line, node.column
            ))
        sym.is_initialized = True

    def visit_BinaryOpNode(self, node: BinaryOpNode):
        left_type, left_val = self.visit(node.left)
        right_type, right_val = self.visit(node.right)

        if not left_type or not right_type:
            return None, None

        # Arithmetic operators
        if node.op in ('+', '-', '*', '/', '%'):
            if left_type == "bool" or right_type == "bool":
                self.errors.append(SemanticError(
                    f"Invalid operation '{node.op}' between '{left_type}' and '{right_type}'.",
                    node.line, node.column
                ))
                return None, None
            if left_type == "float" or right_type == "float":
                return "float", None
            return "int", None

        # Relational operators
        if node.op in ('<', '>', '<=', '>='):
            if left_type == "bool" or right_type == "bool":
                self.errors.append(SemanticError(
                    f"Comparison operator '{node.op}' not supported for boolean type.",
                    node.line, node.column
                ))
                return "bool", None
            return "bool", None

        # Equality operators
        if node.op in ('==', '!='):
            if not self._types_compatible(left_type, right_type) and not self._types_compatible(right_type, left_type):
                self.errors.append(SemanticError(
                    f"Comparison between incompatible types '{left_type}' and '{right_type}'.",
                    node.line, node.column
                ))
            return "bool", None

        # Logical operators
        if node.op in ('&&', '||'):
            if left_type != "bool" or right_type != "bool":
                self.errors.append(SemanticError(
                    f"Logical operator '{node.op}' requires boolean operands, got '{left_type}' and '{right_type}'.",
                    node.line, node.column
                ))
            return "bool", None

        return None, None

    def visit_UnaryOpNode(self, node: UnaryOpNode):
        opnd_type, _ = self.visit(node.operand)
        if not opnd_type:
            return None, None

        if node.op == '!':
            if opnd_type != "bool":
                self.errors.append(SemanticError(
                    f"Logical NOT '!' operator requires boolean operand, got '{opnd_type}'.",
                    node.line, node.column
                ))
            return "bool", None

        if node.op == '-':
            if opnd_type == "bool":
                self.errors.append(SemanticError(
                    f"Unary negation '-' cannot be applied to boolean type.",
                    node.line, node.column
                ))
                return None, None
            return opnd_type, None

        return opnd_type, None

    def visit_LiteralNode(self, node: LiteralNode):
        return node.lit_type, node.value

    def visit_IdentifierNode(self, node: IdentifierNode):
        sym = self.current_scope.lookup(node.name)
        if not sym:
            self.errors.append(SemanticError(
                f"Variable '{node.name}' is not declared.",
                node.line, node.column
            ))
            return None, None
        sym.is_used = True
        return sym.type, sym.initial_value

    def visit_BlockNode(self, node: BlockNode):
        self.scope_counter += 1
        block_scope = SymbolTable(scope_name=f"block_{self.scope_counter}", parent=self.current_scope)
        self.current_scope = block_scope
        for stmt in node.statements:
            self.visit(stmt)
        self.current_scope = self.current_scope.parent

    def visit_IfNode(self, node: IfNode):
        cond_type, _ = self.visit(node.condition)
        if cond_type and cond_type != "bool":
            self.warnings.append({
                "type": "Semantic Notice",
                "message": f"If condition evaluated from '{cond_type}' instead of 'bool'.",
                "line": node.line,
                "column": node.column
            })
        self.visit(node.then_branch)
        if node.else_branch:
            self.visit(node.else_branch)

    def visit_WhileNode(self, node: WhileNode):
        cond_type, _ = self.visit(node.condition)
        if cond_type and cond_type != "bool":
            self.warnings.append({
                "type": "Semantic Notice",
                "message": f"While loop condition evaluated from '{cond_type}' instead of 'bool'.",
                "line": node.line,
                "column": node.column
            })
        self.visit(node.body)

    def visit_ForNode(self, node: ForNode):
        self.scope_counter += 1
        loop_scope = SymbolTable(scope_name=f"loop_{self.scope_counter}", parent=self.current_scope)
        self.current_scope = loop_scope
        if node.init:
            self.visit(node.init)
        if node.condition:
            self.visit(node.condition)
        if node.update:
            self.visit(node.update)
        self.visit(node.body)
        self.current_scope = self.current_scope.parent

    def visit_PrintNode(self, node: PrintNode):
        self.visit(node.expr)

    def visit_ReturnNode(self, node: ReturnNode):
        if node.expr:
            self.visit(node.expr)

    def _types_compatible(self, target_type, source_type):
        if target_type == source_type:
            return True
        if target_type == "float" and source_type == "int":
            return True # implicit promotion
        return False
