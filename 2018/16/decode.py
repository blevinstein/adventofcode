import copy
import re

SAMPLE = re.compile('''Before: \\[(\\d+), (\\d+), (\\d+), (\\d+)\\]
(\\d+) (\\d+) (\\d+) (\\d+)
After:  \\[(\\d+), (\\d+), (\\d+), (\\d+)\\]''')

INSTRUCTION = re.compile('(\\d+) (\\d+) (\\d+) (\\d+)')

OPCODE_NAMES = ['addr', 'addi', 'mulr', 'muli', 'banr', 'bani', 'borr', 'bori', 'setr', 'seti',
    'gtir', 'gtri', 'gtrr', 'eqir', 'eqri', 'eqrr']

OPCODE_MAP = {
  0: 'muli',
  1: 'borr',
  2: 'gtri',
  3: 'eqri',
  4: 'gtrr',
  5: 'eqir',
  6: 'addi',
  7: 'setr',
  8: 'mulr',
  9: 'addr',
  10: 'bori',
  11: 'bani',
  12: 'seti',
  13: 'eqrr',
  14: 'banr',
  15: 'gtir',
}

def main():
  with open('input.txt', 'r') as f:
    data = f.read()
  sample_data, instruction_data = data.split('\n\n\n\n')
  samples = map(parse_sample, sample_data.strip().split('\n\n'))
  instructions = map(parse_instruction, instruction_data.strip().split('\n'))

  # Part 1
  #print sum(1
  #    for sample in samples if len(possible_opcodes(sample[0], sample[1][1:], sample[2])) >= 3)

  # Part 2
  opcode_map = {}
  for i in xrange(16):
    opcode_map[i] = set(OPCODE_NAMES)
  for sample in samples:
    opcode_map[sample[1][0]] &= possible_opcodes(sample[0], sample[1][1:], sample[2])
  #for k in opcode_map:
  #  print '%d: %s' % (k, opcode_map[k] - set(OPCODE_MAP.values()))
  state = [0, 0, 0, 0]
  for instruction in instructions:
    state = execute(OPCODE_MAP[instruction[0]], instruction[1:], state)
  print state

def possible_opcodes(before, args, after):
  result = set([])
  for opcode_name in OPCODE_NAMES:
    if execute(opcode_name, args, before) == after:
      result.add(opcode_name)
  return result

def execute(opcode_name, args, state):
  new_state = copy.copy(state)
  if opcode_name == 'addr':
    new_state[args[2]] = state[args[0]] + state[args[1]]
  elif opcode_name == 'addi':
    new_state[args[2]] = state[args[0]] + args[1]
  elif opcode_name == 'mulr':
    new_state[args[2]] = state[args[0]] * state[args[1]]
  elif opcode_name == 'muli':
    new_state[args[2]] = state[args[0]] * args[1]
  elif opcode_name == 'banr':
    new_state[args[2]] = state[args[0]] & state[args[1]]
  elif opcode_name == 'bani':
    new_state[args[2]] = state[args[0]] & args[1]
  elif opcode_name == 'borr':
    new_state[args[2]] = state[args[0]] | state[args[1]]
  elif opcode_name == 'bori':
    new_state[args[2]] = state[args[0]] | args[1]
  elif opcode_name == 'setr':
    new_state[args[2]] = state[args[0]]
  elif opcode_name == 'seti':
    new_state[args[2]] = args[0]
  elif opcode_name == 'gtir':
    new_state[args[2]] = [0, 1][args[0] > state[args[1]]]
  elif opcode_name == 'gtri':
    new_state[args[2]] = [0, 1][state[args[0]] > args[1]]
  elif opcode_name == 'gtrr':
    new_state[args[2]] = [0, 1][state[args[0]] > state[args[1]]]
  elif opcode_name == 'eqir':
    new_state[args[2]] = [0, 1][args[0] == state[args[1]]]
  elif opcode_name == 'eqri':
    new_state[args[2]] = [0, 1][state[args[0]] == args[1]]
  elif opcode_name == 'eqrr':
    new_state[args[2]] = [0, 1][state[args[0]] == state[args[1]]]
  else:
    raise Exception('bad opcode name')
  return new_state

def parse_instruction(raw):
  match = INSTRUCTION.match(raw)
  if not match:
    raise Exception('bad instruction: ' + raw)
  return map(int, match.groups())

def parse_sample(raw):
  match = SAMPLE.match(raw)
  if not match:
    raise Exception('bad sample: ' + raw)
  values = map(int, match.groups())
  if values[4] >= 16:
    raise 'bad opcode'
  return (values[:4], values[4:8], values[8:])

if __name__ == '__main__':
  main()
