"""
Three-Address Code (TAC) instruction representations.
"""

class TACInstruction:
    def __init__(self, op, arg1=None, arg2=None, result=None, line=None):
        self.op = op             # '+', '-', '*', '/', '%', '=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', 'LABEL', 'GOTO', 'IF_FALSE_GOTO', 'IF_TRUE_GOTO', 'PRINT', 'RETURN', 'NOP'
        self.arg1 = arg1
        self.arg2 = arg2
        self.result = result
        self.line = line

    def to_str(self):
        if self.op == "LABEL":
            return f"{self.result}:"
        elif self.op == "GOTO":
            return f"goto {self.result}"
        elif self.op == "IF_FALSE_GOTO":
            return f"if_false {self.arg1} goto {self.result}"
        elif self.op == "IF_TRUE_GOTO":
            return f"if {self.arg1} goto {self.result}"
        elif self.op == "PRINT":
            return f"print {self.arg1}"
        elif self.op == "RETURN":
            return f"return {self.arg1}" if self.arg1 is not None else "return"
        elif self.op == "=":
            return f"{self.result} = {self.arg1}"
        elif self.op in ('!', '-_unary'):
            unary_sym = '!' if self.op == '!' else '-'
            return f"{self.result} = {unary_sym}{self.arg1}"
        elif self.op == "NOP":
            return "nop"
        else:
            # Binary operation: result = arg1 op arg2
            return f"{self.result} = {self.arg1} {self.op} {self.arg2}"

    def to_dict(self, index=1):
        return {
            "index": index,
            "instruction": self.to_str(),
            "op": self.op,
            "arg1": str(self.arg1) if self.arg1 is not None else "",
            "arg2": str(self.arg2) if self.arg2 is not None else "",
            "result": str(self.result) if self.result is not None else "",
            "line": self.line
        }

    def copy(self):
        return TACInstruction(self.op, self.arg1, self.arg2, self.result, self.line)

    def __repr__(self):
        return self.to_str()
