
def main():
  with open('input', 'r') as f:
    lengths = [int(part) for part in f.read().split(',')]
  N = 256
  knot = range(N)
  current_position = 0
  skip_size = 0
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
  print knot[0] * knot[1]

if __name__=='__main__':
  main()
