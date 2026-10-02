"""
CodeOpt Python Compiler CLI Entrypoint.
Accepts source code via stdin or command-line arguments and returns structured JSON.
"""
import sys
import os
import json
import argparse

# Ensure compiler package can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from compiler.compiler_engine import CompilerEngine

def main():
    parser = argparse.ArgumentParser(description="CodeOpt Compiler Optimization Engine")
    parser.add_argument("--code", type=str, help="Source code string to compile")
    parser.add_argument("--file", type=str, help="Path to source file to compile")
    parser.add_argument("--action", type=str, default="compile", choices=["compile", "lex", "parse", "optimize"], help="Compiler action")

    args = parser.parse_args()

    source_code = ""
    if args.file and os.path.exists(args.file):
        with open(args.file, "r", encoding="utf-8") as f:
            source_code = f.read()
    elif args.code:
        source_code = args.code
    else:
        # Read from stdin
        source_code = sys.stdin.read()

    engine = CompilerEngine()
    result = engine.compile(source_code)
    
    # Write JSON to stdout
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
