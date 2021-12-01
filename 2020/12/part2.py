
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

def left(p):
  x, y = p
  return [-y, x]

def right(p):
  x, y = p
  return [y, -x]

def parse_line(line):
  return (line[0], int(line[1:]))

def rotate(waypoint, direction, degrees):
  steps = int(degrees / 90)
  rotation = left if direction == 'L' else right
  for i in range(steps):
    waypoint = rotation(waypoint)
  return waypoint

def get_offset(instructions):
  position = [0, 0]
  waypoint = [10, 1]
  for action, amount in instructions:
    if action == 'N':
      waypoint[1] += amount
    elif action == 'E':
      waypoint[0] += amount
    elif action == 'S':
      waypoint [1] -= amount
    elif action == 'W':
      waypoint[0] -= amount
    elif action == 'L':
      waypoint = rotate(waypoint, 'L', amount)
    elif action == 'R':
      waypoint = rotate(waypoint, 'R', amount)
    elif action == 'F':
      position[0] += waypoint[0] * amount
      position[1] += waypoint[1] * amount
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
