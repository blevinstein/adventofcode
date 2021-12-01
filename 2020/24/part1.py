
OFFSET = {
    'ne': (0.5, 1),
    'nw': (-0.5, 1),
    'se': (0.5, -1),
    'sw': (-0.5, -1),
    'e': (1, 0),
    'w': (-1, 0),
}

def parse_instructions(line):
  instructions = []
  while len(line) > 0:
    if line[0] in ['e', 'w']:
      instructions.append(line[0])
      line = line[1:]
    else:
      instructions.append(line[:2])
      line = line[2:]
  if not all(i in ['e', 'w', 'ne', 'se', 'nw', 'sw'] for i in instructions):
    raise Exception('Parsing failed!')
  return instructions

def main():
  #with open("test.txt") as f:
  with open("input.txt") as f:
    input = [parse_instructions(line.strip()) for line in f.readlines()]

  black = {}
  for instructions in input:
    coordinate = (sum(OFFSET[instruction][0] for instruction in instructions),
                  sum(OFFSET[instruction][1] for instruction in instructions))
    black[coordinate] = not black.get(coordinate, False)

  print(black)
  print(sum(1 for coord in black.keys() if black[coord]))

if __name__ == '__main__':
  main()
