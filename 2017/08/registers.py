import re

INSTRUCTION = \
    '(?P<outputRegister>\w+) (?P<changeOp>inc|dec) (?P<amount>-?\d+) ' + \
    'if (?P<inputRegister>\w+) (?P<compareOp>[<>!=]+) (?P<constant>-?\d+)'

CHANGE_OPS = {'inc': lambda x, y: x + y, 'dec': lambda x, y: x - y}
COMPARE_OPS = {
    '>': lambda x, y: x > y,
    '<': lambda x, y: x < y,
    '>=': lambda x, y: x >= y,
    '<=': lambda x, y: x <= y,
    '==': lambda x, y: x == y,
    '!=': lambda x, y: x != y
}

def main():
  parser = re.compile(INSTRUCTION)
  with open('input', 'r') as f:
    instructions = [parser.match(line) for line in f.readlines()]
  registers = {}
  max_value = None
  for instruction in instructions:
    input_register = registers.get(instruction.group('inputRegister'), 0)
    constant = int(instruction.group('constant'))
    if COMPARE_OPS[instruction.group('compareOp')](input_register, constant):
      output_register_id = instruction.group('outputRegister')
      registers[output_register_id] = CHANGE_OPS[instruction.group('changeOp')](
          registers.get(output_register_id, 0),
          int(instruction.group('amount')))
      if max_value is None or max_value < registers[output_register_id]:
        max_value = registers[output_register_id]
  print max(registers.values())
  print max_value

if __name__=='__main__':
  main()
