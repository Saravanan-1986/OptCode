"""
Scoped Symbol Table implementation for the C-like language subset.
"""

class Symbol:
    def __init__(self, name, symbol_type, scope_name, line, initial_value=None):
        self.name = name
        self.type = symbol_type # 'int', 'float', 'bool'
        self.scope = scope_name
        self.line = line
        self.initial_value = initial_value
        self.is_initialized = initial_value is not None
        self.is_used = False

    def to_dict(self, index=1):
        init_val_str = str(self.initial_value) if self.initial_value is not None else "-"
        return {
            "index": index,
            "name": self.name,
            "type": self.type,
            "scope": self.scope,
            "initialValue": init_val_str,
            "line": self.line,
            "isInitialized": self.is_initialized,
            "isUsed": self.is_used
        }

class SymbolTable:
    def __init__(self, scope_name="global", parent=None):
        self.scope_name = scope_name
        self.parent = parent
        self.symbols = {} # name -> Symbol
        self.children = []
        if parent:
            parent.children.append(self)

    def define(self, symbol: Symbol):
        self.symbols[symbol.name] = symbol

    def lookup_current(self, name: str):
        return self.symbols.get(name)

    def lookup(self, name: str):
        if name in self.symbols:
            return self.symbols[name]
        if self.parent:
            return self.parent.lookup(name)
        return None

    def get_all_symbols(self, accumulator=None):
        if accumulator is None:
            accumulator = []
        for sym in self.symbols.values():
            accumulator.append(sym)
        for child in self.children:
            child.get_all_symbols(accumulator)
        return accumulator
