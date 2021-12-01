
def main():
  with open('input.txt', 'r') as f:
    values = map(int, f.read().split())
  length, tree = build_tree(values)
  if length != len(values):
    raise Exception('Failed to traverse all values')
  # Part 1
  #print total_metadata(tree)
  # Part 2
  print tree.value()

class Node:
  def __init__(self, children, metadata):
    self.children = children
    self.metadata = metadata

  def value(self):
    if not self.children:
      total = sum(self.metadata)
    else:
      counts = {}
      for value in self.metadata:
        counts[value] = counts.get(value, 0) + 1
      total = sum(self.children[index - 1].value() * counts[index]
          for index in counts
          if index <= len(self.children))
    #print 'Node with %d children, metadata %s, value: %d' % (len(self.children), self.metadata, total)
    return total

  def __repr__(self):
    return 'Node(%s, %s)' % (self.metadata, self.children)

def total_metadata(tree):
  nodes = []
  traverse_tree(tree, nodes)
  total = 0
  for node in nodes:
    total += sum(node.metadata)
  return total

def build_tree(values):
  offset = 0
  num_children = values[offset]
  num_metadata = values[offset + 1]
  offset += 2
  children = []
  for j in xrange(num_children):
    offset_diff, child_node = build_tree(values[offset:])
    offset += offset_diff
    children.append(child_node)
  metadata = values[offset:offset + num_metadata]
  return (offset + num_metadata, Node(children, metadata))

def traverse_tree(node, results):
  results.append(node)
  for child in node.children:
    traverse_tree(child, results)

if __name__ == '__main__':
  main()
