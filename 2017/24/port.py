
def main():
  with open('input', 'r') as f:
    connectors = [Connector(int(a), int(b))
        for a,b in map(lambda line: line.split('/'), f.readlines())]
  # Assert no duplicates
  for i in xrange(len(connectors)):
    for j in xrange(len(connectors)):
      if i == j:
        continue
      if (connectors[i].a == connectors[j].a and connectors[i].b == connectors[j].b) or \
          (connectors[i].a == connectors[j].b and connectors[i].b == connectors[j].a):
        raise Exception('Duplicate connector: %s, %s' % (i, j))

  bridge = best(connectors)
  print strength(bridge[0]), bridge

def path_key(path):
  return ','.join(map(lambda c: str(c), path))

def best(connectors):
  frontier = [([], 0)]
  best = None
  while frontier:
    current_path = frontier.pop()

    available = filter(lambda c: c not in current_path[0], connectors)

    next_paths = [(current_path[0] + [c], c.output(current_path[1])) for c in available
        if c.output(current_path[1]) is not None]

    for next_path in next_paths:
      frontier.append(next_path)
      if best is None or strength(next_path[0]) > strength(best[0]):
        best = next_path
        print strength(best[0]), best
  return best

def strength(connectors):
  return sum(c.a + c.b for c in connectors)

class Connector:
  def __init__(self, a, b):
    self.a = a
    self.b = b

  def output(self, ports):
    if ports == self.b:
      return self.a
    if ports == self.a:
      return self.b
    return None

  def __eq__(self, other):
    return self.a == other.a and self.b == other.b

  def __hash__(self):
    return self.a * 99999 + self.b

  def __repr__(self):
    return '%d/%d' % (self.a, self.b)

if __name__=='__main__':
  main()
