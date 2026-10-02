"""
Recursive-Descent Parser for the C-like language subset.
Validates grammar, produces an AST, concrete Parse Tree, and granular syntax errors.
"""
from ..lexer.tokens import TokenType, Token
from ..ast.ast_nodes import (
    reset_node_counter, ProgramNode, VarDeclNode, AssignNode,
    BinaryOpNode, UnaryOpNode, LiteralNode, IdentifierNode,
    IfNode, WhileNode, ForNode, BlockNode, PrintNode, ReturnNode
)

class SyntaxError(Exception):
    def __init__(self, message, line, column, expected=None, actual=None):
        super().__init__(f"Syntax Error at Line {line}, Column {column}: {message}")
        self.message = message
        self.line = line
        self.column = column
        self.expected = expected
        self.actual = actual

    def to_dict(self):
        return {
            "type": "Syntax Error",
            "message": self.message,
            "line": self.line,
            "column": self.column,
            "expected": self.expected,
            "actual": self.actual
        }

class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.current = 0
        self.errors = []
        self.parse_tree = None
        reset_node_counter()

    def peek(self, offset=0):
        idx = self.current + offset
        if idx < len(self.tokens):
            return self.tokens[idx]
        return self.tokens[-1] # EOF

    def is_at_end(self):
        return self.peek().type == TokenType.EOF

    def advance(self):
        if not self.is_at_end():
            self.current += 1
        return self.tokens[self.current - 1]

    def check(self, token_type):
        if self.is_at_end():
            return False
        return self.peek().type == token_type

    def match(self, *token_types):
        for t_type in token_types:
            if self.check(t_type):
                self.advance()
                return True
        return False

    def consume(self, token_type, error_message):
        if self.check(token_type):
            return self.advance()
        actual_tok = self.peek()
        expected_str = token_type.value if hasattr(token_type, 'value') else str(token_type)
        actual_str = actual_tok.lexeme if actual_tok.lexeme else actual_tok.type.value
        err = SyntaxError(
            error_message,
            actual_tok.line,
            actual_tok.column,
            expected=expected_str,
            actual=actual_str
        )
        self.errors.append(err)
        raise err

    def parse(self):
        self.current = 0
        self.errors = []
        statements = []
        parse_tree_nodes = []

        try:
            while not self.is_at_end():
                stmt = self.statement()
                if stmt:
                    statements.append(stmt)
                    parse_tree_nodes.append(stmt.to_dict())
        except SyntaxError:
            # We captured the error, attempt to synchronize
            self.synchronize()

        program = ProgramNode(statements)
        self.parse_tree = self._build_concrete_parse_tree(program)
        return program, self.errors, self.parse_tree

    def _build_concrete_parse_tree(self, node):
        if not node:
            return None
        from ..ast.ast_nodes import (
            ProgramNode, VarDeclNode, AssignNode, BinaryOpNode,
            UnaryOpNode, LiteralNode, IdentifierNode, IfNode,
            WhileNode, ForNode, BlockNode, PrintNode, ReturnNode
        )

        if isinstance(node, ProgramNode):
            return {
                "id": node.node_id,
                "type": "Program",
                "label": "Program (Grammar Root)",
                "children": [self._build_concrete_parse_tree(s) for s in node.statements]
            }

        elif isinstance(node, VarDeclNode):
            children = [
                { "type": "TypeSpecifier", "label": f"type: {node.var_type}", "children": [] },
                { "type": "Identifier", "label": f"id: {node.identifier}", "children": [] }
            ]
            if node.init_expr:
                children.append({ "type": "AssignOp", "label": "=", "children": [] })
                children.append(self._build_concrete_parse_tree(node.init_expr))
            children.append({ "type": "Delimiter", "label": ";", "children": [] })
            return {
                "id": node.node_id,
                "type": "VarDecl",
                "label": f"Declaration: {node.var_type} {node.identifier}",
                "line": node.line,
                "children": children
            }

        elif isinstance(node, AssignNode):
            return {
                "id": node.node_id,
                "type": "Assignment",
                "label": f"Assignment: {node.target}",
                "line": node.line,
                "children": [
                    { "type": "Identifier", "label": f"target: {node.target}", "children": [] },
                    { "type": "AssignOp", "label": node.op, "children": [] },
                    self._build_concrete_parse_tree(node.expr),
                    { "type": "Delimiter", "label": ";", "children": [] }
                ]
            }

        elif isinstance(node, BinaryOpNode):
            return {
                "id": node.node_id,
                "type": "BinaryExpression",
                "label": f"BinaryExpr: ({node.op})",
                "line": node.line,
                "children": [
                    self._build_concrete_parse_tree(node.left),
                    { "type": "Operator", "label": node.op, "children": [] },
                    self._build_concrete_parse_tree(node.right)
                ]
            }

        elif isinstance(node, UnaryOpNode):
            return {
                "id": node.node_id,
                "type": "UnaryExpression",
                "label": f"UnaryExpr: {node.op}",
                "line": node.line,
                "children": [
                    { "type": "Operator", "label": node.op, "children": [] },
                    self._build_concrete_parse_tree(node.operand)
                ]
            }

        elif isinstance(node, LiteralNode):
            return {
                "id": node.node_id,
                "type": "Literal",
                "label": f"Literal: {node.value}",
                "line": node.line,
                "children": []
            }

        elif isinstance(node, IdentifierNode):
            return {
                "id": node.node_id,
                "type": "Identifier",
                "label": f"id: {node.name}",
                "line": node.line,
                "children": []
            }

        elif isinstance(node, IfNode):
            children = [
                { "type": "Keyword", "label": "if", "children": [] },
                { "type": "Condition", "label": "Condition", "children": [self._build_concrete_parse_tree(node.condition)] },
                { "type": "ThenBranch", "label": "ThenBlock", "children": [self._build_concrete_parse_tree(node.then_branch)] }
            ]
            if node.else_branch:
                children.append({ "type": "Keyword", "label": "else", "children": [] })
                children.append({ "type": "ElseBranch", "label": "ElseBlock", "children": [self._build_concrete_parse_tree(node.else_branch)] })
            return {
                "id": node.node_id,
                "type": "IfStatement",
                "label": "If-Statement",
                "line": node.line,
                "children": children
            }

        elif isinstance(node, WhileNode):
            return {
                "id": node.node_id,
                "type": "WhileStatement",
                "label": "While-Loop",
                "line": node.line,
                "children": [
                    { "type": "Keyword", "label": "while", "children": [] },
                    { "type": "Condition", "label": "Condition", "children": [self._build_concrete_parse_tree(node.condition)] },
                    { "type": "LoopBody", "label": "Body", "children": [self._build_concrete_parse_tree(node.body)] }
                ]
            }

        elif isinstance(node, ForNode):
            children = [{ "type": "Keyword", "label": "for", "children": [] }]
            if node.init:
                children.append({ "type": "ForInit", "label": "Init", "children": [self._build_concrete_parse_tree(node.init)] })
            if node.condition:
                children.append({ "type": "ForCondition", "label": "Condition", "children": [self._build_concrete_parse_tree(node.condition)] })
            if node.update:
                children.append({ "type": "ForUpdate", "label": "Update", "children": [self._build_concrete_parse_tree(node.update)] })
            children.append({ "type": "ForBody", "label": "Body", "children": [self._build_concrete_parse_tree(node.body)] })
            return {
                "id": node.node_id,
                "type": "ForStatement",
                "label": "For-Loop",
                "line": node.line,
                "children": children
            }

        elif isinstance(node, BlockNode):
            return {
                "id": node.node_id,
                "type": "Block",
                "label": f"Block ({len(node.statements)} stmts)",
                "line": node.line,
                "children": [self._build_concrete_parse_tree(s) for s in node.statements]
            }

        elif isinstance(node, PrintNode):
            return {
                "id": node.node_id,
                "type": "PrintStatement",
                "label": "PrintStatement",
                "line": node.line,
                "children": [
                    { "type": "Keyword", "label": "print", "children": [] },
                    self._build_concrete_parse_tree(node.expr)
                ]
            }

        return node.to_dict() if hasattr(node, 'to_dict') else { "type": "Node", "label": str(node), "children": [] }

    def synchronize(self):
        self.advance()
        while not self.is_at_end():
            if self.tokens[self.current - 1].type == TokenType.SEMICOLON:
                return
            if self.peek().type in (
                TokenType.KEYWORD_INT,
                TokenType.KEYWORD_FLOAT,
                TokenType.KEYWORD_BOOL,
                TokenType.KEYWORD_IF,
                TokenType.KEYWORD_WHILE,
                TokenType.KEYWORD_FOR,
                TokenType.KEYWORD_PRINT,
                TokenType.KEYWORD_RETURN,
                TokenType.LBRACE
            ):
                return
            self.advance()

    def statement(self):
        tok = self.peek()

        # Variable Declaration
        if tok.type in (TokenType.KEYWORD_INT, TokenType.KEYWORD_FLOAT, TokenType.KEYWORD_BOOL):
            return self.var_declaration()

        # Block
        if tok.type == TokenType.LBRACE:
            return self.block_statement()

        # If Statement
        if tok.type == TokenType.KEYWORD_IF:
            return self.if_statement()

        # While Statement
        if tok.type == TokenType.KEYWORD_WHILE:
            return self.while_statement()

        # For Statement
        if tok.type == TokenType.KEYWORD_FOR:
            return self.for_statement()

        # Print Statement
        if tok.type == TokenType.KEYWORD_PRINT:
            return self.print_statement()

        # Return Statement
        if tok.type == TokenType.KEYWORD_RETURN:
            return self.return_statement()

        # Assignment or Expression Statement
        if tok.type == TokenType.IDENTIFIER:
            # Check if next token is assignment operator
            next_tok = self.peek(1)
            if next_tok.type in (
                TokenType.ASSIGN, TokenType.PLUS_ASSIGN,
                TokenType.MINUS_ASSIGN, TokenType.MUL_ASSIGN, TokenType.DIV_ASSIGN
            ):
                return self.assignment_statement()

        return self.expression_statement()

    def var_declaration(self):
        type_tok = self.advance()
        type_str = "int" if type_tok.type == TokenType.KEYWORD_INT else (
            "float" if type_tok.type == TokenType.KEYWORD_FLOAT else "bool"
        )
        name_tok = self.consume(TokenType.IDENTIFIER, f"Expected variable name after '{type_str}'")

        init_expr = None
        if self.match(TokenType.ASSIGN):
            init_expr = self.expression()

        self.consume(TokenType.SEMICOLON, f"Expected ';' after declaration of variable '{name_tok.lexeme}'")
        return VarDeclNode(type_str, name_tok.lexeme, init_expr, type_tok.line, type_tok.column)

    def assignment_statement(self):
        target_tok = self.consume(TokenType.IDENTIFIER, "Expected identifier in assignment")
        op_tok = self.advance()
        expr = self.expression()
        self.consume(TokenType.SEMICOLON, f"Expected ';' after assignment to '{target_tok.lexeme}'")

        if op_tok.type == TokenType.ASSIGN:
            return AssignNode(target_tok.lexeme, "=", expr, target_tok.line, target_tok.column)
        else:
            # Desugar compound assignment e.g. x += 5 => x = x + 5
            bin_op_map = {
                TokenType.PLUS_ASSIGN: "+",
                TokenType.MINUS_ASSIGN: "-",
                TokenType.MUL_ASSIGN: "*",
                TokenType.DIV_ASSIGN: "/"
            }
            bin_op = bin_op_map.get(op_tok.type, "+")
            left_id = IdentifierNode(target_tok.lexeme, target_tok.line, target_tok.column)
            desugared_expr = BinaryOpNode(left_id, bin_op, expr, target_tok.line, target_tok.column)
            return AssignNode(target_tok.lexeme, "=", desugared_expr, target_tok.line, target_tok.column)

    def block_statement(self):
        brace_tok = self.consume(TokenType.LBRACE, "Expected '{' to start block")
        statements = []
        while not self.check(TokenType.RBRACE) and not self.is_at_end():
            stmt = self.statement()
            if stmt:
                statements.append(stmt)
        self.consume(TokenType.RBRACE, "Expected '}' to close block")
        return BlockNode(statements, brace_tok.line, brace_tok.column)

    def if_statement(self):
        if_tok = self.consume(TokenType.KEYWORD_IF, "Expected 'if'")
        self.consume(TokenType.LPAREN, "Expected '(' after 'if'")
        condition = self.expression()
        self.consume(TokenType.RPAREN, "Expected ')' after if condition")

        then_branch = self.statement()
        else_branch = None
        if self.match(TokenType.KEYWORD_ELSE):
            else_branch = self.statement()

        return IfNode(condition, then_branch, else_branch, if_tok.line, if_tok.column)

    def while_statement(self):
        while_tok = self.consume(TokenType.KEYWORD_WHILE, "Expected 'while'")
        self.consume(TokenType.LPAREN, "Expected '(' after 'while'")
        condition = self.expression()
        self.consume(TokenType.RPAREN, "Expected ')' after while condition")

        body = self.statement()
        return WhileNode(condition, body, while_tok.line, while_tok.column)

    def for_statement(self):
        for_tok = self.consume(TokenType.KEYWORD_FOR, "Expected 'for'")
        self.consume(TokenType.LPAREN, "Expected '(' after 'for'")

        # Init
        init = None
        if not self.match(TokenType.SEMICOLON):
            if self.peek().type in (TokenType.KEYWORD_INT, TokenType.KEYWORD_FLOAT, TokenType.KEYWORD_BOOL):
                init = self.var_declaration()
            else:
                target_tok = self.consume(TokenType.IDENTIFIER, "Expected loop variable in for init")
                self.consume(TokenType.ASSIGN, "Expected '=' in for init")
                expr = self.expression()
                self.consume(TokenType.SEMICOLON, "Expected ';' after for init")
                init = AssignNode(target_tok.lexeme, "=", expr, target_tok.line, target_tok.column)

        # Condition
        condition = None
        if not self.check(TokenType.SEMICOLON):
            condition = self.expression()
        self.consume(TokenType.SEMICOLON, "Expected ';' after for condition")

        # Update
        update = None
        if not self.check(TokenType.RPAREN):
            target_tok = self.consume(TokenType.IDENTIFIER, "Expected identifier in for update")
            op_tok = self.advance()
            expr = self.expression()
            if op_tok.type == TokenType.ASSIGN:
                update = AssignNode(target_tok.lexeme, "=", expr, target_tok.line, target_tok.column)
            else:
                bin_op_map = {
                    TokenType.PLUS_ASSIGN: "+",
                    TokenType.MINUS_ASSIGN: "-",
                    TokenType.MUL_ASSIGN: "*",
                    TokenType.DIV_ASSIGN: "/"
                }
                bin_op = bin_op_map.get(op_tok.type, "+")
                left_id = IdentifierNode(target_tok.lexeme, target_tok.line, target_tok.column)
                desugared_expr = BinaryOpNode(left_id, bin_op, expr, target_tok.line, target_tok.column)
                update = AssignNode(target_tok.lexeme, "=", desugared_expr, target_tok.line, target_tok.column)

        self.consume(TokenType.RPAREN, "Expected ')' after for clauses")
        body = self.statement()
        return ForNode(init, condition, update, body, for_tok.line, for_tok.column)

    def print_statement(self):
        print_tok = self.consume(TokenType.KEYWORD_PRINT, "Expected 'print'")
        self.consume(TokenType.LPAREN, "Expected '(' after 'print'")
        expr = self.expression()
        self.consume(TokenType.RPAREN, "Expected ')' after print argument")
        self.consume(TokenType.SEMICOLON, "Expected ';' after print statement")
        return PrintNode(expr, print_tok.line, print_tok.column)

    def return_statement(self):
        ret_tok = self.consume(TokenType.KEYWORD_RETURN, "Expected 'return'")
        expr = None
        if not self.check(TokenType.SEMICOLON):
            expr = self.expression()
        self.consume(TokenType.SEMICOLON, "Expected ';' after return")
        return ReturnNode(expr, ret_tok.line, ret_tok.column)

    def expression_statement(self):
        expr = self.expression()
        self.consume(TokenType.SEMICOLON, "Expected ';' after expression")
        return expr

    # Expression parsing hierarchy
    def expression(self):
        return self.logical_or()

    def logical_or(self):
        expr = self.logical_and()
        while self.match(TokenType.OR):
            op = "||"
            right = self.logical_and()
            expr = BinaryOpNode(expr, op, right, expr.line, expr.column)
        return expr

    def logical_and(self):
        expr = self.equality()
        while self.match(TokenType.AND):
            op = "&&"
            right = self.equality()
            expr = BinaryOpNode(expr, op, right, expr.line, expr.column)
        return expr

    def equality(self):
        expr = self.relational()
        while self.check(TokenType.EQ) or self.check(TokenType.NEQ):
            op_tok = self.advance()
            right = self.relational()
            expr = BinaryOpNode(expr, op_tok.lexeme, right, expr.line, expr.column)
        return expr

    def relational(self):
        expr = self.additive()
        while self.check(TokenType.LT) or self.check(TokenType.GT) or \
              self.check(TokenType.LTE) or self.check(TokenType.GTE):
            op_tok = self.advance()
            right = self.additive()
            expr = BinaryOpNode(expr, op_tok.lexeme, right, expr.line, expr.column)
        return expr

    def additive(self):
        expr = self.multiplicative()
        while self.check(TokenType.PLUS) or self.check(TokenType.MINUS):
            op_tok = self.advance()
            right = self.multiplicative()
            expr = BinaryOpNode(expr, op_tok.lexeme, right, expr.line, expr.column)
        return expr

    def multiplicative(self):
        expr = self.unary()
        while self.check(TokenType.MULTIPLY) or self.check(TokenType.DIVIDE) or self.check(TokenType.MODULO):
            op_tok = self.advance()
            right = self.unary()
            expr = BinaryOpNode(expr, op_tok.lexeme, right, expr.line, expr.column)
        return expr

    def unary(self):
        if self.check(TokenType.NOT) or self.check(TokenType.MINUS):
            op_tok = self.advance()
            operand = self.unary()
            return UnaryOpNode(op_tok.lexeme, operand, op_tok.line, op_tok.column)
        return self.primary()

    def primary(self):
        tok = self.peek()

        if self.match(TokenType.LITERAL_INT):
            prev = self.tokens[self.current - 1]
            return LiteralNode(prev.value, "int", prev.line, prev.column)

        if self.match(TokenType.LITERAL_FLOAT):
            prev = self.tokens[self.current - 1]
            return LiteralNode(prev.value, "float", prev.line, prev.column)

        if self.match(TokenType.LITERAL_BOOL):
            prev = self.tokens[self.current - 1]
            return LiteralNode(prev.value, "bool", prev.line, prev.column)

        if self.match(TokenType.IDENTIFIER):
            prev = self.tokens[self.current - 1]
            return IdentifierNode(prev.lexeme, prev.line, prev.column)

        if self.match(TokenType.LPAREN):
            paren_line = self.tokens[self.current - 1].line
            paren_col = self.tokens[self.current - 1].column
            expr = self.expression()
            self.consume(TokenType.RPAREN, "Expected ')' after expression")
            return expr

        actual_str = tok.lexeme if tok.lexeme else tok.type.value
        err = SyntaxError(
            f"Unexpected token '{actual_str}' in expression",
            tok.line,
            tok.column,
            expected="Expression (Identifier, Number, or '(')",
            actual=actual_str
        )
        self.errors.append(err)
        raise err
