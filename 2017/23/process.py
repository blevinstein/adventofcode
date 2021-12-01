
def main():
  with open('input', 'r') as f:
    instructions = [line.split() for line in f.readlines()]
  print run(instructions)

def parse_or_get(register, spec):
  if spec in 'abcdefgh':
    return register.get(spec, 0)
  else:
    return int(spec)

def run(instructions):
  instruction_pointer = 0
  register = {}
  last_played = None
  muls = 0
  while instruction_pointer < len(instructions):
    instruction = instructions[instruction_pointer]
    if instruction[0] == 'set':
      register[instruction[1]] = parse_or_get(register, instruction[2])
    elif instruction[0] == 'sub':
      register[instruction[1]] = register.get(instruction[1], 0) - parse_or_get(register, instruction[2])
    elif instruction[0] == 'mul':
      muls += 1
      register[instruction[1]] = register.get(instruction[1], 0) * parse_or_get(register, instruction[2])
    elif instruction[0] == 'jnz':
      if parse_or_get(register, instruction[1]) != 0:
        instruction_pointer += parse_or_get(register, instruction[2])
        continue # skip incrementing pointer
    else:
      raise Exception('Unrecognized command')
    instruction_pointer += 1
  return muls


if __name__=='__main__':
  main()
