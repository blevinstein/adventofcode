
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

def main():
  #input = 'flqrgnkx'
  input = 'ljoxqyyw'

  squares = 0
  for row in xrange(128):
    row_hash = long(knot_hash('%s-%d' % (input, row)), 16)
    for col in xrange(128):
      occupied = (1 << (127 - col)) & row_hash > 0
      print ['.', '#'][occupied],
      if occupied:
        squares += 1
    print
  print squares

if __name__=='__main__':
  main()
