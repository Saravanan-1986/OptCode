"""
Token definitions for the C-like language subset.
"""
from enum import Enum, auto

class TokenType(Enum):
    # Keywords
    KEYWORD_INT = "KEYWORD_INT"
    KEYWORD_FLOAT = "KEYWORD_FLOAT"
    KEYWORD_BOOL = "KEYWORD_BOOL"
    KEYWORD_IF = "KEYWORD_IF"
    KEYWORD_ELSE = "KEYWORD_ELSE"
    KEYWORD_WHILE = "KEYWORD_WHILE"
    KEYWORD_FOR = "KEYWORD_FOR"
    KEYWORD_PRINT = "KEYWORD_PRINT"
    KEYWORD_RETURN = "KEYWORD_RETURN"

    # Literals
    LITERAL_INT = "INTEGER"
    LITERAL_FLOAT = "FLOAT"
    LITERAL_BOOL = "BOOLEAN"
    IDENTIFIER = "IDENTIFIER"

    # Arithmetic Operators
    PLUS = "PLUS"               # +
    MINUS = "MINUS"             # -
    MULTIPLY = "MULTIPLY"       # *
    DIVIDE = "DIVIDE"           # /
    MODULO = "MODULO"           # %

    # Assignment Operators
    ASSIGN = "ASSIGN"           # =
    PLUS_ASSIGN = "PLUS_ASSIGN" # +=
    MINUS_ASSIGN = "MINUS_ASSIGN" # -=
    MUL_ASSIGN = "MUL_ASSIGN"   # *=
    DIV_ASSIGN = "DIV_ASSIGN"   # /=

    # Comparison Operators
    EQ = "EQ"                   # ==
    NEQ = "NEQ"                 # !=
    LT = "LT"                   # <
    GT = "GT"                   # >
    LTE = "LTE"                 # <=
    GTE = "GTE"                 # >=

    # Logical Operators
    AND = "AND"                 # &&
    OR = "OR"                   # ||
    NOT = "NOT"                 # !

    # Delimiters
    LPAREN = "LPAREN"           # (
    RPAREN = "RPAREN"           # )
    LBRACE = "LBRACE"           # {
    RBRACE = "RBRACE"           # }
    SEMICOLON = "SEMICOLON"     # ;
    COMMA = "COMMA"             # ,

    # End of File / Unknown
    EOF = "EOF"
    ERROR = "ERROR"

KEYWORDS = {
    "int": TokenType.KEYWORD_INT,
    "float": TokenType.KEYWORD_FLOAT,
    "bool": TokenType.KEYWORD_BOOL,
    "if": TokenType.KEYWORD_IF,
    "else": TokenType.KEYWORD_ELSE,
    "while": TokenType.KEYWORD_WHILE,
    "for": TokenType.KEYWORD_FOR,
    "print": TokenType.KEYWORD_PRINT,
    "return": TokenType.KEYWORD_RETURN,
    "true": TokenType.LITERAL_BOOL,
    "false": TokenType.LITERAL_BOOL,
}

class Token:
    def __init__(self, token_type, lexeme, line, column, value=None):
        self.type = token_type
        self.lexeme = lexeme
        self.line = line
        self.column = column
        self.value = value if value is not None else lexeme

    def to_dict(self, index=1):
        return {
            "index": index,
            "lexeme": self.lexeme,
            "type": self.type.value if hasattr(self.type, 'value') else str(self.type),
            "line": self.line,
            "column": self.column,
            "value": self.value
        }

    def __repr__(self):
        return f"Token({self.type.value}, '{self.lexeme}', L{self.line}:C{self.column})"
