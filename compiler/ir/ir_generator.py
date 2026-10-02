"""
Three-Address Code (TAC) Generator from AST.
"""
from .tac import TACInstruction
from ..ast.ast_nodes import (
    ProgramNode, VarDeclNode, AssignNode, BinaryOpNode,
    UnaryOpNode, LiteralNode, IdentifierNode, IfNode,
    WhileNode, ForNode, BlockNode, PrintNode, ReturnNode
)

class IRGenerator:
    def __init__(self):
        self.temp_count = 0
        self.label_count = 0
        self.instructions = []

    def new_temp(self):
        self.temp_count += 1
        return f"t{self.temp_count}"

    def new_label(self):
        self.label_count += 1
        return f"L{self.label_count}"

    def emit(self, op, arg1=None, arg2=None, result=None, line=None):
        instr = TACInstruction(op, arg1, arg2, result, line)
        self.instructions.append(instr)
        return instr

    def generate(self, ast_root: ProgramNode):
        self.temp_count = 0
        self.label_count = 0
        self.instructions = []

        self.visit(ast_root)
        return self.instructions

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
        if node.init_expr:
            val_place = self.visit(node.init_expr)
            self.emit("=", arg1=val_place, result=node.identifier, line=node.line)

    def visit_AssignNode(self, node: AssignNode):
        val_place = self.visit(node.expr)
        self.emit("=", arg1=val_place, result=node.target, line=node.line)

    def visit_BinaryOpNode(self, node: BinaryOpNode):
        left_place = self.visit(node.left)
        right_place = self.visit(node.right)
        temp = self.new_temp()
        self.emit(node.op, arg1=left_place, arg2=right_place, result=temp, line=node.line)
        return temp

    def visit_UnaryOpNode(self, node: UnaryOpNode):
        opnd_place = self.visit(node.operand)
        temp = self.new_temp()
        op_tag = "-_unary" if node.op == '-' else '!'
        self.emit(op_tag, arg1=opnd_place, result=temp, line=node.line)
        return temp

    def visit_LiteralNode(self, node: LiteralNode):
        # Return string or formatted constant
        if node.lit_type == "bool":
            return "true" if node.value else "false"
        return str(node.value)

    def visit_IdentifierNode(self, node: IdentifierNode):
        return node.name

    def visit_BlockNode(self, node: BlockNode):
        for stmt in node.statements:
            self.visit(stmt)

    def visit_IfNode(self, node: IfNode):
        cond_place = self.visit(node.condition)
        label_else = self.new_label()
        label_end = self.new_label()

        if node.else_branch:
            self.emit("IF_FALSE_GOTO", arg1=cond_place, result=label_else, line=node.line)
            self.visit(node.then_branch)
            self.emit("GOTO", result=label_end, line=node.line)
            self.emit("LABEL", result=label_else, line=node.line)
            self.visit(node.else_branch)
            self.emit("LABEL", result=label_end, line=node.line)
        else:
            self.emit("IF_FALSE_GOTO", arg1=cond_place, result=label_end, line=node.line)
            self.visit(node.then_branch)
            self.emit("LABEL", result=label_end, line=node.line)

    def visit_WhileNode(self, node: WhileNode):
        label_start = self.new_label()
        label_end = self.new_label()

        self.emit("LABEL", result=label_start, line=node.line)
        cond_place = self.visit(node.condition)
        self.emit("IF_FALSE_GOTO", arg1=cond_place, result=label_end, line=node.line)
        self.visit(node.body)
        self.emit("GOTO", result=label_start, line=node.line)
        self.emit("LABEL", result=label_end, line=node.line)

    def visit_ForNode(self, node: ForNode):
        label_cond = self.new_label()
        label_body = self.new_label()
        label_update = self.new_label()
        label_end = self.new_label()

        if node.init:
            self.visit(node.init)

        self.emit("LABEL", result=label_cond, line=node.line)
        if node.condition:
            cond_place = self.visit(node.condition)
            self.emit("IF_FALSE_GOTO", arg1=cond_place, result=label_end, line=node.line)

        self.visit(node.body)

        self.emit("LABEL", result=label_update, line=node.line)
        if node.update:
            self.visit(node.update)

        self.emit("GOTO", result=label_cond, line=node.line)
        self.emit("LABEL", result=label_end, line=node.line)

    def visit_PrintNode(self, node: PrintNode):
        expr_place = self.visit(node.expr)
        self.emit("PRINT", arg1=expr_place, line=node.line)

    def visit_ReturnNode(self, node: ReturnNode):
        expr_place = self.visit(node.expr) if node.expr else None
        self.emit("RETURN", arg1=expr_place, line=node.line)
