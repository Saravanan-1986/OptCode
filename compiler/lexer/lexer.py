"""
Lexical Analyzer (Lexer) for the C-like language subset.
"""
from .tokens import Token, TokenType, KEYWORDS

class LexicalError(Exception):
    def __init__(self, message, line, column):
        super().__init__(f"Lexical Error: {message} at Line {line}, Column {column}")
        self.message = message
        self.line = line
        self.column = column

    def to_dict(self):
        return {
            "type": "Lexical Error",
            "message": self.message,
            "line": self.line,
            "column": self.column
        }

class Lexer:
    def __init__(self, source_code: str):
        self.source = source_code
        self.length = len(source_code)
        self.pos = 0
        self.line = 1
        self.column = 1
        self.tokens = []
        self.errors = []

    def peek(self, offset=0):
        target = self.pos + offset
        if target < self.length:
            return self.source[target]
        return '\0'

    def advance(self):
        if self.pos < self.length:
            ch = self.source[self.pos]
            self.pos += 1
            if ch == '\n':
                self.line += 1
                self.column = 1
            else:
                self.column += 1
            return ch
        return '\0'

    def match(self, expected):
        if self.peek() == expected:
            self.advance()
            return True
        return False

    def skip_whitespace_and_comments(self):
        while self.pos < self.length:
            ch = self.peek()
            if ch in ' \t\r\n':
                self.advance()
            elif ch == '/' and self.peek(1) == '/':
                # Single-line comment
                while self.pos < self.length and self.peek() != '\n':
                    self.advance()
            elif ch == '/' and self.peek(1) == '*':
                # Multi-line comment
                start_line = self.line
                start_col = self.column
                self.advance() # /
                self.advance() # *
                closed = False
                while self.pos < self.length:
                    if self.peek() == '*' and self.peek(1) == '/':
                        self.advance() # *
                        self.advance() # /
                        closed = True
                        break
                    self.advance()
                if not closed:
                    self.errors.append(LexicalError("Unterminated multi-line comment", start_line, start_col))
                    break
            else:
                break

    def tokenize(self):
        self.tokens = []
        self.errors = []

        while self.pos < self.length:
            self.skip_whitespace_and_comments()
            if self.pos >= self.length:
                break

            start_line = self.line
            start_col = self.column
            ch = self.peek()

            # Identifiers or Keywords
            if ch.isalpha() or ch == '_':
                ident = ""
                while self.pos < self.length and (self.peek().isalnum() or self.peek() == '_'):
                    ident += self.advance()
                
                if ident in KEYWORDS:
                    t_type = KEYWORDS[ident]
                    val = True if ident == "true" else (False if ident == "false" else ident)
                    self.tokens.append(Token(t_type, ident, start_line, start_col, val))
                else:
                    self.tokens.append(Token(TokenType.IDENTIFIER, ident, start_line, start_col, ident))
                continue

            # Numbers (Integer or Float)
            if ch.isdigit():
                num_str = ""
                is_float = False
                while self.pos < self.length and self.peek().isdigit():
                    num_str += self.advance()
                
                if self.peek() == '.' and self.peek(1).isdigit():
                    is_float = True
                    num_str += self.advance() # '.'
                    while self.pos < self.length and self.peek().isdigit():
                        num_str += self.advance()
                
                if is_float:
                    self.tokens.append(Token(TokenType.LITERAL_FLOAT, num_str, start_line, start_col, float(num_str)))
                else:
                    self.tokens.append(Token(TokenType.LITERAL_INT, num_str, start_line, start_col, int(num_str)))
                continue

            # Single or multi-character symbols
            self.advance() # Consume the current char

            if ch == '+':
                if self.match('='):
                    self.tokens.append(Token(TokenType.PLUS_ASSIGN, "+=", start_line, start_col))
                else:
                    self.tokens.append(Token(TokenType.PLUS, "+", start_line, start_col))
            elif ch == '-':
                if self.match('='):
                    self.tokens.append(Token(TokenType.MINUS_ASSIGN, "-=", start_line, start_col))
                else:
                    self.tokens.append(Token(TokenType.MINUS, "-", start_line, start_col))
            elif ch == '*':
                if self.match('='):
                    self.tokens.append(Token(TokenType.MUL_ASSIGN, "*=", start_line, start_col))
                else:
                    self.tokens.append(Token(TokenType.MULTIPLY, "*", start_line, start_col))
            elif ch == '/':
                if self.match('='):
                    self.tokens.append(Token(TokenType.DIV_ASSIGN, "/=", start_line, start_col))
                else:
                    self.tokens.append(Token(TokenType.DIVIDE, "/", start_line, start_col))
            elif ch == '%':
                self.tokens.append(Token(TokenType.MODULO, "%", start_line, start_col))
            elif ch == '=':
                if self.match('='):
                    self.tokens.append(Token(TokenType.EQ, "==", start_line, start_col))
                else:
                    self.tokens.append(Token(TokenType.ASSIGN, "=", start_line, start_col))
            elif ch == '!':
                if self.match('='):
                    self.tokens.append(Token(TokenType.NEQ, "!=", start_line, start_col))
                else:
                    self.tokens.append(Token(TokenType.NOT, "!", start_line, start_col))
            elif ch == '<':
                if self.match('='):
                    self.tokens.append(Token(TokenType.LTE, "<=", start_line, start_col))
                else:
                    self.tokens.append(Token(TokenType.LT, "<", start_line, start_col))
            elif ch == '>':
                if self.match('='):
                    self.tokens.append(Token(TokenType.GTE, ">=", start_line, start_col))
                else:
                    self.tokens.append(Token(TokenType.GT, ">", start_line, start_col))
            elif ch == '&':
                if self.match('&'):
                    self.tokens.append(Token(TokenType.AND, "&&", start_line, start_col))
                else:
                    self.errors.append(LexicalError(f"Unexpected character '&', did you mean '&&'?", start_line, start_col))
            elif ch == '|':
                if self.match('|'):
                    self.tokens.append(Token(TokenType.OR, "||", start_line, start_col))
                else:
                    self.errors.append(LexicalError(f"Unexpected character '|', did you mean '||'?", start_line, start_col))
            elif ch == '(':
                self.tokens.append(Token(TokenType.LPAREN, "(", start_line, start_col))
            elif ch == ')':
                self.tokens.append(Token(TokenType.RPAREN, ")", start_line, start_col))
            elif ch == '{':
                self.tokens.append(Token(TokenType.LBRACE, "{", start_line, start_col))
            elif ch == '}':
                self.tokens.append(Token(TokenType.RBRACE, "}", start_line, start_col))
            elif ch == ';':
                self.tokens.append(Token(TokenType.SEMICOLON, ";", start_line, start_col))
            elif ch == ',':
                self.tokens.append(Token(TokenType.COMMA, ",", start_line, start_col))
            else:
                self.errors.append(LexicalError(f"Unexpected character '{ch}'", start_line, start_col))

        self.tokens.append(Token(TokenType.EOF, "", self.line, self.column))
        return self.tokens, self.errors

    def get_token_table(self):
        result = []
        for i, tok in enumerate(self.tokens[:-1], 1): # Exclude EOF from normal table
            result.append(tok.to_dict(i))
        return result
