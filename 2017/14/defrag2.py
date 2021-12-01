
STANDARD_LENGTHS = [17, 31, 73, 47, 23]
ROUNDS = 64
def knot_hash(input):
  lengths = [ord(character) for character in input] + STANDARD_LENGTHS
  N = 256
  knot = range(N)
  current_position = 0
  skip_size = 0
  for round in xrange(ROUNDS):
    for length in lengths:
      # reverse a section of the list
      knot[:length] = reversed(knot[:length])
      # advance current position and rotate the knot
      position_change = length + skip_size
      knot = knot[position_change % N:] + knot[:position_change % N]
      current_position += position_change
      skip_size += 1
  # rotate the knot back to its starting position
  knot = knot[-current_position % N:] + knot[:-current_position % N]
  # calculate dense hash
  dense_hash = []
  for section in xrange(16):
    dense_hash.append(reduce(lambda x, y: x ^ y, knot[section*16:(section+1)*16]))
  return ''.join('%0.2X' % value for value in dense_hash).lower()

DIRS = [(1, 0), (-1, 0), (0, 1), (0, -1)]

def add(a, b):
  return (a[0] + b[0], a[1] + b[1])

def floodfill(map, start):
  visited = set()
  frontier = set([start])
  while frontier:
    position = frontier.pop()
    visited.add(position)
    for dir in DIRS:
      new_position = add(position, dir)
      if map.get(new_position, False) and new_position not in visited:
        frontier.add(new_position)
  return visited

def main():
  input = 'ljoxqyyw'

  map = {}
  for row in xrange(128):
    row_hash = long(knot_hash('%s-%d' % (input, row)), 16)
    for col in xrange(128):
      occupied = (1 << (127 - col)) & row_hash > 0
      map[(row, col)] = occupied
      print ['.', '#'][occupied],
    print

  # count the islands
  islands = 0
  visited = set()
  for row in xrange(128):
    for col in xrange(128):
      if map[(row, col)] and not (row, col) in visited:
        visited |= floodfill(map, (row, col))
        islands += 1
  print islands

if __name__=='__main__':
  main()
