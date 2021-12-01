
def main():
  with open('input', 'r') as f:
    instructions = [line.split() for line in f.readlines()]
  duet(instructions)

def duet(instructions):
  a = Program(instructions, 0)
  b = Program(instructions, 1)
  a.partner = b
  b.partner = a
  all_blocked = False
  while not all_blocked:
    all_blocked = True
    for prog in [a, b]:
      # run programs until they are blocked
      while prog.step():
        all_blocked = False
  print b.values_sent

REGISTERS = 'abcdefghijklmnopqrstuvwxyz'

class Program:
  def __init__(self, instructions, program_id):
    self.instructions = instructions
    self.instruction_pointer = 0
    self.register = {'p': program_id}
    self.partner = None
    self.message_queue = []
    self.values_sent = 0
    self.program_id = program_id

  def get(self, spec):
    if spec not in REGISTERS:
      raise Exception('invalid register: %s' % spec);
    return self.register.get(spec, 0)

  def parse_or_get(self, spec):
    if spec in REGISTERS:
      return self.get(spec)
    else:
      return int(spec)

  # return false if it is blocked
  def step(self):
    instruction = self.instructions[self.instruction_pointer]
    if instruction[0] == 'snd':
      self.partner.message_queue.append(self.get(instruction[1]))
      self.values_sent += 1
    elif instruction[0] == 'set':
      self.register[instruction[1]] = self.parse_or_get(instruction[2])
    elif instruction[0] == 'add':
      self.register[instruction[1]] = self.get(instruction[1]) + self.parse_or_get(instruction[2])
    elif instruction[0] == 'mul':
      self.register[instruction[1]] = self.get(instruction[1]) * self.parse_or_get(instruction[2])
    elif instruction[0] == 'mod':
      self.register[instruction[1]] = self.get(instruction[1]) % self.parse_or_get(instruction[2])
    elif instruction[0] == 'rcv':
      if self.message_queue:
        self.register[instruction[1]] = self.message_queue.pop(0)
      else:
        return False
    elif instruction[0] == 'jgz':
      if self.parse_or_get(instruction[1]) > 0:
        self.instruction_pointer += self.parse_or_get(instruction[2])
        return True # skip incrementing pointer
    else:
      raise Exception('Unrecognized command')
    self.instruction_pointer += 1
    return True

if __name__=='__main__':
  main()
