
DANCERS = 16

def main():
  with open('input', 'r') as f:
    input = f.read()
  print after_dance(input)

def after_dance(input):
  moves = input.strip().split(',')
  dancers = [chr(ord('a') + i) for i in xrange(DANCERS)]
  for move in moves:
    if move[0] == 's':
      size = int(move[1:])
      #print 'spin %d' % size
      if size > DANCERS:
        raise 'Spin size must be <= %d' % DANCERS
      dancers = dancers[-size:] + dancers[:-size]
    elif move[0] == 'x':
      pos_a, pos_b = (int(part) for part in move[1:].split('/'))
      #print 'exchange %d <-> %d' % (pos_a, pos_b)
      t = dancers[pos_a]
      dancers[pos_a] = dancers[pos_b]
      dancers[pos_b] = t
    elif move[0] == 'p':
      dancer_a, dancer_b = move[1:].split('/')
      pos_a = dancers.index(dancer_a)
      pos_b = dancers.index(dancer_b)
      #print 'exchange %s(%d) <-> %s(%d)' % (dancer_a, pos_a, dancer_b, pos_b)
      t = dancers[pos_a]
      dancers[pos_a] = dancers[pos_b]
      dancers[pos_b] = t
  return ''.join(dancers)

if __name__=='__main__':
  main()
