"""
Abstract Syntax Tree (AST) node classes.
Provides rich serialization for graphical tree rendering in the frontend.
"""

_node_id_counter = 0

def get_next_id():
    global _node_id_counter
    _node_id_counter += 1
    return f"ast_node_{_node_id_counter}"

def reset_node_counter():
    global _node_id_counter
    _node_id_counter = 0

class ASTNode:
    def __init__(self, line=1, column=1):
        self.node_id = get_next_id()
        self.line = line
        self.column = column

    def to_dict(self):
        raise NotImplementedError

    def count_nodes(self):
        return 1

class ProgramNode(ASTNode):
    def __init__(self, statements, line=1, column=1):
        super().__init__(line, column)
        self.statements = statements

    def count_nodes(self):
        return 1 + sum(stmt.count_nodes() for stmt in self.statements)

    def to_dict(self):
        return {
            "id": self.node_id,
            "type": "Program",
            "label": "Program",
            "line": self.line,
            "column": self.column,
            "children": [stmt.to_dict() for stmt in self.statements]
        }

class VarDeclNode(ASTNode):
    def __init__(self, var_type, identifier, init_expr=None, line=1, column=1):
        super().__init__(line, column)
        self.var_type = var_type
        self.identifier = identifier
        self.init_expr = init_expr

    def count_nodes(self):
        cnt = 2 # self + identifier
        if self.init_expr:
            cnt += self.init_expr.count_nodes()
        return cnt

    def to_dict(self):
        children = [
            {
                "id": f"{self.node_id}_id",
                "type": "Identifier",
                "label": f"Identifier: {self.identifier}",
                "name": self.identifier,
                "line": self.line,
                "column": self.column,
                "children": []
            }
        ]
        if self.init_expr:
            children.append(self.init_expr.to_dict())

        return {
            "id": self.node_id,
            "type": "VarDecl",
            "label": f"VarDecl: {self.var_type} {self.identifier}",
            "var_type": self.var_type,
            "name": self.identifier,
            "line": self.line,
            "column": self.column,
            "children": children
        }

class AssignNode(ASTNode):
    def __init__(self, target, op, expr, line=1, column=1):
        super().__init__(line, column)
        self.target = target
        self.op = op # '=', '+=', '-=', '*=', '/='
        self.expr = expr

    def count_nodes(self):
        return 2 + self.expr.count_nodes()

    def to_dict(self):
        return {
            "id": self.node_id,
            "type": "Assignment",
            "label": f"Assignment ({self.op})",
            "op": self.op,
            "target": self.target,
            "line": self.line,
            "column": self.column,
            "children": [
                {
                    "id": f"{self.node_id}_target",
                    "type": "Identifier",
                    "label": f"Identifier: {self.target}",
                    "name": self.target,
                    "line": self.line,
                    "column": self.column,
                    "children": []
                },
                self.expr.to_dict()
            ]
        }

class BinaryOpNode(ASTNode):
    def __init__(self, left, op, right, line=1, column=1):
        super().__init__(line, column)
        self.left = left
        self.op = op
        self.right = right

    def count_nodes(self):
        return 1 + self.left.count_nodes() + self.right.count_nodes()

    def to_dict(self):
        return {
            "id": self.node_id,
            "type": "BinaryExpression",
            "label": f"BinaryOp: {self.op}",
            "op": self.op,
            "line": self.line,
            "column": self.column,
            "children": [
                self.left.to_dict(),
                self.right.to_dict()
            ]
        }

class UnaryOpNode(ASTNode):
    def __init__(self, op, operand, line=1, column=1):
        super().__init__(line, column)
        self.op = op
        self.operand = operand

    def count_nodes(self):
        return 1 + self.operand.count_nodes()

    def to_dict(self):
        return {
            "id": self.node_id,
            "type": "UnaryExpression",
            "label": f"UnaryOp: {self.op}",
            "op": self.op,
            "line": self.line,
            "column": self.column,
            "children": [
                self.operand.to_dict()
            ]
        }

class LiteralNode(ASTNode):
    def __init__(self, value, lit_type, line=1, column=1):
        super().__init__(line, column)
        self.value = value
        self.lit_type = lit_type

    def to_dict(self):
        return {
            "id": self.node_id,
            "type": "Literal",
            "label": f"Literal: {self.value} ({self.lit_type})",
            "value": self.value,
            "lit_type": self.lit_type,
            "line": self.line,
            "column": self.column,
            "children": []
        }

class IdentifierNode(ASTNode):
    def __init__(self, name, line=1, column=1):
        super().__init__(line, column)
        self.name = name

    def to_dict(self):
        return {
            "id": self.node_id,
            "type": "Identifier",
            "label": f"Identifier: {self.name}",
            "name": self.name,
            "line": self.line,
            "column": self.column,
            "children": []
        }

class IfNode(ASTNode):
    def __init__(self, condition, then_branch, else_branch=None, line=1, column=1):
        super().__init__(line, column)
        self.condition = condition
        self.then_branch = then_branch
        self.else_branch = else_branch

    def count_nodes(self):
        cnt = 1 + self.condition.count_nodes() + self.then_branch.count_nodes()
        if self.else_branch:
            cnt += self.else_branch.count_nodes()
        return cnt

    def to_dict(self):
        children = [
            {
                "id": f"{self.node_id}_cond_wrapper",
                "type": "Condition",
                "label": "Condition",
                "line": self.condition.line,
                "column": self.condition.column,
                "children": [self.condition.to_dict()]
            },
            {
                "id": f"{self.node_id}_then_wrapper",
                "type": "ThenBranch",
                "label": "Then Branch",
                "line": self.then_branch.line,
                "column": self.then_branch.column,
                "children": [self.then_branch.to_dict()]
            }
        ]
        if self.else_branch:
            children.append({
                "id": f"{self.node_id}_else_wrapper",
                "type": "ElseBranch",
                "label": "Else Branch",
                "line": self.else_branch.line,
                "column": self.else_branch.column,
                "children": [self.else_branch.to_dict()]
            })

        return {
            "id": self.node_id,
            "type": "IfStatement",
            "label": "If Statement",
            "line": self.line,
            "column": self.column,
            "children": children
        }

class WhileNode(ASTNode):
    def __init__(self, condition, body, line=1, column=1):
        super().__init__(line, column)
        self.condition = condition
        self.body = body

    def count_nodes(self):
        return 1 + self.condition.count_nodes() + self.body.count_nodes()

    def to_dict(self):
        return {
            "id": self.node_id,
            "type": "WhileStatement",
            "label": "While Loop",
            "line": self.line,
            "column": self.column,
            "children": [
                {
                    "id": f"{self.node_id}_cond",
                    "type": "LoopCondition",
                    "label": "Loop Condition",
                    "children": [self.condition.to_dict()]
                },
                {
                    "id": f"{self.node_id}_body",
                    "type": "LoopBody",
                    "label": "Loop Body",
                    "children": [self.body.to_dict()]
                }
            ]
        }

class ForNode(ASTNode):
    def __init__(self, init, condition, update, body, line=1, column=1):
        super().__init__(line, column)
        self.init = init
        self.condition = condition
        self.update = update
        self.body = body

    def count_nodes(self):
        cnt = 1 + self.body.count_nodes()
        if self.init:
            cnt += self.init.count_nodes()
        if self.condition:
            cnt += self.condition.count_nodes()
        if self.update:
            cnt += self.update.count_nodes()
        return cnt

    def to_dict(self):
        children = []
        if self.init:
            children.append({
                "id": f"{self.node_id}_init",
                "type": "ForInit",
                "label": "Init",
                "children": [self.init.to_dict()]
            })
        if self.condition:
            children.append({
                "id": f"{self.node_id}_cond",
                "type": "ForCondition",
                "label": "Condition",
                "children": [self.condition.to_dict()]
            })
        if self.update:
            children.append({
                "id": f"{self.node_id}_update",
                "type": "ForUpdate",
                "label": "Update",
                "children": [self.update.to_dict()]
            })
        children.append({
            "id": f"{self.node_id}_body",
            "type": "ForBody",
            "label": "Body",
            "children": [self.body.to_dict()]
        })

        return {
            "id": self.node_id,
            "type": "ForStatement",
            "label": "For Loop",
            "line": self.line,
            "column": self.column,
            "children": children
        }

class BlockNode(ASTNode):
    def __init__(self, statements, line=1, column=1):
        super().__init__(line, column)
        self.statements = statements

    def count_nodes(self):
        return 1 + sum(s.count_nodes() for s in self.statements)

    def to_dict(self):
        return {
            "id": self.node_id,
            "type": "Block",
            "label": f"Block ({len(self.statements)} stmts)",
            "line": self.line,
            "column": self.column,
            "children": [s.to_dict() for s in self.statements]
        }

class PrintNode(ASTNode):
    def __init__(self, expr, line=1, column=1):
        super().__init__(line, column)
        self.expr = expr

    def count_nodes(self):
        return 1 + self.expr.count_nodes()

    def to_dict(self):
        return {
            "id": self.node_id,
            "type": "PrintStatement",
            "label": "Print",
            "line": self.line,
            "column": self.column,
            "children": [self.expr.to_dict()]
        }

class ReturnNode(ASTNode):
    def __init__(self, expr=None, line=1, column=1):
        super().__init__(line, column)
        self.expr = expr

    def count_nodes(self):
        return 1 + (self.expr.count_nodes() if self.expr else 0)

    def to_dict(self):
        children = [self.expr.to_dict()] if self.expr else []
        return {
            "id": self.node_id,
            "type": "ReturnStatement",
            "label": "Return",
            "line": self.line,
            "column": self.column,
            "children": children
        }
