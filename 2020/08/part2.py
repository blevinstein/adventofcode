
def parse_line(line):
  action, arg = line.split()
  if action not in ['nop', 'acc', 'jmp']:
    raise Exception('Invalid instruction: %s' % action)
  return [action, int(arg)]

# return result, or None if cycle exists
def try_run(program):
  accumulator = 0
  program_counter = 0
  executed = set()
  while program_counter < len(program):
    action, arg = program[program_counter]

    #print('[pc = %3d] accum = %3d    %5s %3d' % (program_counter, accumulator, action, arg))
    if program_counter in executed:
      return None
    executed.add(program_counter)

    if action == 'nop':
      program_counter += 1
    elif action == 'jmp':
      program_counter += arg
    elif action == 'acc':
      accumulator += arg
      program_counter += 1
  return accumulator

def main():
  with open('input.txt', 'r') as f:
    program = [parse_line(line.strip()) for line in f.readlines()]

  def flip_instruction(i):
    if program[i][0] == 'jmp':
      program[i][0] = 'nop'
    elif program[i][0] == 'nop':
      program[i][0] = 'jmp'
    else:
      raise Exception('Cannot flip instruction')

  # Try all possible programs with one instruction flipped
  for i in range(len(program)):
    if program[i][0] in ['jmp', 'nop']:
      print('Flipping %d...' % i)
      flip_instruction(i)
      result = try_run(program)
      if result:
        print(result)
        return
      # Flip the instruction back when you are done
      flip_instruction(i)

if __name__ == '__main__':
  main()
