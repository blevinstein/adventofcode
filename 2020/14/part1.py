
import re

MASK = re.compile(r"mask = ([X10]{36})")
MEM = re.compile(r"mem\[(\d+)\] = (\d+)")

# takes a raw mask as an argument, e.g. X11X00... (36 bits) and returns a
# masking function
def compile_mask(mask):
  if len(mask) != 36:
    raise Exception('Unexpected mask length')
  or_mask = 0
  and_mask = 0xfffffffff
  for i, bit in enumerate(mask):
    power = 35 - i
    if bit == '1':
      or_mask |= (1 << power)
    elif bit == '0':
      and_mask &= ~(1 << power)
    elif bit != 'X':
      raise Exception('Unexpected bit in mask: %s' % bit)
  #print('compiled! or_mask = %s and_mask = %s' % (bin(or_mask), bin(and_mask)))
  return lambda value: (value | or_mask) & and_mask

def parse_line(line):
  mask_match = MASK.fullmatch(line)
  if mask_match:
    return ('mask', mask_match.groups()[0])
  mem_match = MEM.fullmatch(line)
  if mem_match:
    return ('mem', int(mem_match.groups()[0]), int(mem_match.groups()[1]))
  raise Exception('Unrecognized instruction: %s' % line)

def run_program(program):
  memory = {}
  # initial mask does not transform the value
  mask = lambda value: value
  for step in program:
    if step[0] == 'mask':
      mask = compile_mask(step[1])
    elif step[0] == 'mem':
      memory[step[1]] = mask(step[2])
  return memory

def main():
  with open('input.txt', 'r') as f:
    program = [parse_line(line.strip()) for line in f.readlines()]
  memory = run_program(program)
  print(sum(memory.values()))

if __name__ == '__main__':
  main()
