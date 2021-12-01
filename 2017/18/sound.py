
def main():
  with open('input', 'r') as f:
    instructions = [line.split() for line in f.readlines()]
  print recover(instructions)

def parse_or_get(register, spec):
  if spec in 'abcdefghijklmnopqrstuvwxyz':
    return register.get(spec, 0)
  else:
    return int(spec)

def recover(instructions):
  instruction_pointer = 0
  register = {}
  last_played = None
  while True:
    instruction = instructions[instruction_pointer]
    if instruction[0] == 'snd':
      last_played = register.get(instruction[1], 0)
    elif instruction[0] == 'set':
      register[instruction[1]] = parse_or_get(register, instruction[2])
    elif instruction[0] == 'add':
      register[instruction[1]] = register.get(instruction[1], 0) + parse_or_get(register, instruction[2])
    elif instruction[0] == 'mul':
      register[instruction[1]] = register.get(instruction[1], 0) * parse_or_get(register, instruction[2])
    elif instruction[0] == 'mod':
      register[instruction[1]] = register.get(instruction[1], 0) % parse_or_get(register, instruction[2])
    elif instruction[0] == 'rcv':
      if register.get(instruction[1], 0) != 0:
        return last_played
    elif instruction[0] == 'jgz':
      if register.get(instruction[1], 0) > 0:
        instruction_pointer += parse_or_get(register, instruction[2])
        continue # skip incrementing pointer
    else:
      raise Exception('Unrecognized command')
    instruction_pointer += 1


if __name__=='__main__':
  main()
