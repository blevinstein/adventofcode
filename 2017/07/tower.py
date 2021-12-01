import re

LINE = re.compile('(?P<parent>\w+) \((?P<weight>\d+)\)( -> (?P<children>[\w, ]*))?')

class Node:
  def __init__(self, name, weight):
    self.name = name
    self.weight = weight
    self.children = []

  def add_child(self, child):
    self.children.append(child)

  def total_weight(self):
    return self.weight + sum(self.child_weights())

  def child_weights(self):
    return [child.total_weight() for child in self.children]

  def is_balanced(self):
    weights = [child.total_weight() for child in self.children]
    for i in xrange(1, len(weights)):
      if weights[i] != weights[0]:
        return False
    return True

  def get_unbalanced(self):
    for child in self.children:
      if not child.is_balanced():
        return child
    return None

  def __repr__(self):
    return '%s (%d) -> %s' % \
        (self.name, self.weight, ', '.join(child.name for child in self.children))

def main():
  with open('input', 'r') as f:
    data = [LINE.match(line) for line in f.readlines()]
  # first pass, create nodes
  node_map = {}
  for node_data in data:
    name = node_data.group('parent')
    weight = int(node_data.group('weight'))
    node_map[name] = Node(name, weight)
  # second pass, add children
  child_nodes = set()
  for node_data in data:
    parent = node_data.group('parent')
    children_group = node_data.group('children')
    if not children_group:
      continue
    children = children_group.split(', ')
    for child in children:
      node_map[parent].add_child(node_map[child])
      child_nodes.add(child)
  # find root node
  root_node = [node for node in node_map.keys() if node not in child_nodes][0]
  current_node = node_map[root_node]
  while True:
    print current_node
    print current_node.child_weights()
    next_node = current_node.get_unbalanced()
    if not next_node:
      break
    current_node = next_node

if __name__=='__main__':
  main()
