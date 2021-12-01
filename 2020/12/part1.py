
UNIT_TO_HEADING = {
    (0, 1): 'N',
    (1, 0): 'E',
    (0, -1): 'S',
    (-1, 0): 'W'
}

HEADING_TO_UNIT = {
    'N': (0, 1),
    'E': (1, 0),
    'S': (0, -1),
    'W': (-1, 0)
}

LEFT = {
    'N': 'W',
    'W': 'S',
    'S': 'E',
    'E': 'N'
}

RIGHT = {
    'W': 'N',
    'S': 'W',
    'E': 'S',
    'N': 'E',
}

def parse_line(line):
  return (line[0], int(line[1:]))

def rotate(unit, direction, degrees):
  steps = int(degrees / 90)
  heading = UNIT_TO_HEADING.get(unit)
  rotation = LEFT if direction == 'L' else RIGHT
  for i in range(steps):
    heading = rotation.get(heading)
  new_unit = HEADING_TO_UNIT.get(heading)
  return new_unit

def get_offset(instructions):
  unit = (1, 0)
  position = [0, 0]
  for action, amount in instructions:
    if action == 'N':
      position[1] += amount
    elif action == 'E':
      position[0] += amount
    elif action == 'S':
      position [1] -= amount
    elif action == 'W':
      position[0] -= amount
    elif action == 'L':
      unit = rotate(unit, 'L', amount)
    elif action == 'R':
      unit = rotate(unit, 'R', amount)
    elif action == 'F':
      position[0] += amount * unit[0]
      position[1] += amount * unit[1]
    else:
      raise Exception('Invalid action: %s' % action)
  return position

def main():
  with open('input.txt', 'r') as f:
    input = [parse_line(line.strip()) for line in f.readlines()]
  position = get_offset(input)
  print(position)
  print(sum(abs(v) for v in position))

if __name__ == '__main__':
  main()
