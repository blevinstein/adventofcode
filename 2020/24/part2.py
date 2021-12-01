
import math

OFFSET = {
    'ne': (0.5, 1),
    'nw': (-0.5, 1),
    'se': (0.5, -1),
    'sw': (-0.5, -1),
    'e': (1, 0),
    'w': (-1, 0),
}

def count_neighbors(black, coord):
  count = 0
  for offset in OFFSET.values():
    if black.get((coord[0] + offset[0], coord[1] + offset[1]), False):
      count += 1
  return count

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

  for day in range(100):
    new_black = {}
    min_x = math.floor(min(coord[0] for coord in black if black[coord]))
    max_x = math.ceil(max(coord[0] for coord in black if black[coord]))
    min_y = min(coord[1] for coord in black if black[coord])
    max_y = max(coord[1] for coord in black if black[coord])
    for y in range(min_y-1, max_y+2):
      if y % 2 == 0:
        x_range = range(min_x-1, max_x+2)
      else:
        x_range = [r - 0.5 for r in range(min_x-1,max_x+2)]
      for x in x_range:
        black_neighbors = count_neighbors(black, (x, y))
        if black.get((x, y), False) and black_neighbors in [1, 2]:
          new_black[(x, y)] = True
        elif not black.get((x, y), False) and black_neighbors == 2:
          new_black[(x, y)] = True
    black = new_black
    print('Day %d: %d' % (day+1, sum(1 for coord in black.keys() if black[coord])))

if __name__ == '__main__':
  main()
