import copy
import re
import time

INSTRUCTION = re.compile('(\\w+) (\\d+) (\\d+) (\\d+)')

DIRECTIVE = re.compile('#ip (\\d+)')

OPCODE_NAMES = ['addr', 'addi', 'mulr', 'muli', 'banr', 'bani', 'borr', 'bori', 'setr', 'seti',
    'gtir', 'gtri', 'gtrr', 'eqir', 'eqri', 'eqrr']

def main():
  with open('input.txt', 'r') as f:
    lines = f.readlines()
  ip_register = parse_directive(lines[0])
  instructions = map(parse_instruction, lines[1:])

  # Part 1
  state = [0] * 6
  # Part 2
  #state = [1] + [0] * 5

  ip = 0
  steps = 0
  while ip >= 0 and ip < len(instructions):
    # sample
    if steps % 1e6 == 0:
      print state
    #print 'ip=%d %s %s ' % (ip, state, instructions[ip]),
    state, ip = execute(instructions[ip], ip_register, state, ip)
    #print '%s' % (state)
    ip += 1
    steps += 1
    #time.sleep(1)
  print steps
  print state

def execute(instruction, ip_register, state, ip):
  opcode_name, args = instruction[0], instruction[1:]
  # set IP register
  state[ip_register] = ip
  # execute the opcode
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
  return new_state, new_state[ip_register]

def parse_instruction(raw):
  match = INSTRUCTION.match(raw)
  if not match:
    raise Exception('bad instruction: ' + raw)
  return [match.groups()[0]] + map(int, match.groups()[1:])

def parse_directive(raw):
  match = DIRECTIVE.match(raw)
  if not match:
    raise Exception('bad instruction: ' + raw)
  return int(match.group(1))

if __name__ == '__main__':
  main()
