
def main():
  with open('input', 'r') as f:
    tape = [int(line) for line in f.readlines()]
  print get_steps(tape)

def get_steps(tape):
  steps = 0
  index = 0
  while 0 <= index < len(tape):
    jump = tape[index]
    if jump >= 3:
      tape[index] -= 1
    else:
      tape[index] += 1
    index += jump
    steps += 1
  return steps

if __name__ == '__main__':
  main()
