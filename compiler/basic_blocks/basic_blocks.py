"""
Basic Block Partitioning and Control Flow Graph (CFG) generation.
"""
from typing import List, Dict, Any
from ..ir.tac import TACInstruction

class BasicBlock:
    def __init__(self, block_id: str, instructions: List[TACInstruction]):
        self.id = block_id
        self.instructions = instructions
        self.predecessors = [] # List of block_id
        self.successors = []   # List of block_id
        self.label = block_id

    def to_dict(self):
        return {
            "id": self.id,
            "label": self.id,
            "instructions": [instr.to_str() for instr in self.instructions],
            "instructionObjects": [instr.to_dict(i + 1) for i, instr in enumerate(self.instructions)],
            "predecessors": self.predecessors,
            "successors": self.successors
        }

class CFGBuilder:
    def __init__(self, instructions: List[TACInstruction]):
        self.instructions = instructions
        self.blocks = []
        self.edges = [] # List of { from: B1, to: B2, label: 'true'/'false'/'fallthrough'/'goto' }

    def build(self):
        if not self.instructions:
            return [], {"nodes": [], "edges": []}

        # 1. Identify Leaders
        leaders = set()
        leaders.add(0) # First instruction is leader

        label_to_index = {}
        for i, instr in enumerate(self.instructions):
            if instr.op == "LABEL":
                label_to_index[instr.result] = i

        for i, instr in enumerate(self.instructions):
            if instr.op in ("GOTO", "IF_FALSE_GOTO", "IF_TRUE_GOTO"):
                target_label = instr.result
                if target_label in label_to_index:
                    leaders.add(label_to_index[target_label])
                if i + 1 < len(self.instructions):
                    leaders.add(i + 1)
            elif instr.op == "LABEL":
                leaders.add(i)

        sorted_leaders = sorted(list(leaders))
        
        # 2. Form Basic Blocks
        self.blocks = []
        block_map = {} # block_id -> BasicBlock
        instr_to_block = {} # index -> block_id
        label_to_block = {} # label_name -> block_id

        for idx, start in enumerate(sorted_leaders):
            end = sorted_leaders[idx + 1] if idx + 1 < len(sorted_leaders) else len(self.instructions)
            block_id = f"B{idx + 1}"
            block_instrs = self.instructions[start:end]
            block = BasicBlock(block_id, block_instrs)
            self.blocks.append(block)
            block_map[block_id] = block

            for i in range(start, end):
                instr_to_block[i] = block_id
                if self.instructions[i].op == "LABEL":
                    label_to_block[self.instructions[i].result] = block_id

        # 3. Construct CFG Edges
        self.edges = []
        for idx, block in enumerate(self.blocks):
            if not block.instructions:
                continue

            last_instr = block.instructions[-1]
            if last_instr.op == "GOTO":
                target_block = label_to_block.get(last_instr.result)
                if target_block:
                    self._add_edge(block.id, target_block, "goto")
            elif last_instr.op in ("IF_FALSE_GOTO", "IF_TRUE_GOTO"):
                target_block = label_to_block.get(last_instr.result)
                if target_block:
                    branch_label = "false" if last_instr.op == "IF_FALSE_GOTO" else "true"
                    self._add_edge(block.id, target_block, branch_label)
                
                # Fallthrough to next block
                if idx + 1 < len(self.blocks):
                    fallthrough_block = self.blocks[idx + 1].id
                    fallthrough_label = "true" if last_instr.op == "IF_FALSE_GOTO" else "false"
                    self._add_edge(block.id, fallthrough_block, fallthrough_label)
            elif last_instr.op == "RETURN":
                # Exit block, no successors
                pass
            else:
                # Normal fallthrough
                if idx + 1 < len(self.blocks):
                    self._add_edge(block.id, self.blocks[idx + 1].id, "fallthrough")

        # Prepare formatted graph for frontend
        cfg_graph = {
            "nodes": [
                {
                    "id": b.id,
                    "label": b.id,
                    "instructions": [instr.to_str() for instr in b.instructions],
                    "raw": b.to_dict()
                } for b in self.blocks
            ],
            "edges": self.edges
        }

        blocks_data = [b.to_dict() for b in self.blocks]
        return blocks_data, cfg_graph

    def _add_edge(self, from_id, to_id, edge_type):
        edge = {
            "id": f"e_{from_id}_{to_id}_{edge_type}",
            "from": from_id,
            "to": to_id,
            "label": edge_type
        }
        self.edges.append(edge)
        # Update block preds/succs
        for b in self.blocks:
            if b.id == from_id and to_id not in b.successors:
                b.successors.append(to_id)
            if b.id == to_id and from_id not in b.predecessors:
                b.predecessors.append(from_id)
