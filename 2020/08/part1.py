
def parse_line(line):
  action, arg = line.split()
  if action not in ['nop', 'acc', 'jmp']:
    raise Exception('Invalid instruction: %s' % action)
  return (action, int(arg))

def detect_cycle(program):
  accumulator = 0
  program_counter = 0
  executed = set()
  while program_counter < len(program):
    action, arg = program[program_counter]

    print('[pc = %3d] accum = %3d    %5s %3d' % (program_counter, accumulator, action, arg))
    if program_counter in executed:
      raise Exception('Cycle! accumulator = %d' % accumulator)
    executed.add(program_counter)

    if action == 'nop':
      program_counter += 1
    elif action == 'jmp':
      program_counter += arg
    elif action == 'acc':
      accumulator += arg
      program_counter += 1

def main():
  with open('input.txt', 'r') as f:
    program = [parse_line(line.strip()) for line in f.readlines()]
  detect_cycle(program)

if __name__ == '__main__':
  main()
