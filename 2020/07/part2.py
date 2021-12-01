
import re

LINE = re.compile(r"(.*) bags contain (.*)\.")
CHILD = re.compile(r"(\d+|no) ([a-z ]*) bags?")

def parse_line(line):
  result = LINE.fullmatch(line)
  if not result:
    raise Exception('Line does not parse: %s' % line)
  node = result.groups()[0]
  raw_children = result.groups()[1].split(', ')
  children = []
  for raw_child in raw_children:
    child_result = CHILD.fullmatch(raw_child)
    if not child_result:
      raise Exception('Child does not parse: %s' % raw_child)
    child_groups = child_result.groups()
    if child_groups == ('no', 'other'):
      pass
    else:
      if len(child_groups[1].split()) > 2:
        raise Exception('Child parsed incorrectly: %s' % child_groups)
      children.append((int(child_groups[0]), child_groups[1]))
  return (node, children)

def detect_cycles(rules_map):
  for root_node in rules_map.keys():
    # dfs starting at [root_node], keep track of route to node
    def visit(node, path):
      for count, child in rules_map[node]:
        if child in path:
          raise Exception('Cycle detected: %s' % path)
        visit(child, path + [child])
    visit(root_node, [root_node])

def can_contain(rules_map, a, b):
  # dfs starting at [a], return True if can_contain(a, b)
  def visit(node, path):
    for count, child in rules_map[node]:
      if child == b:
        return path + [child]
      found_path = visit(child, path + [child])
      if found_path:
        return found_path
    return None
  return visit(a, [a])

def count_bags_contained(rules_map, node):
  bags_contained = 0
  for count, child in rules_map[node]:
    bags_contained += count * (1 + count_bags_contained(rules_map, child))
  return bags_contained

def main():
  with open('input.txt', 'r') as f:
    rules = [parse_line(line.strip()) for line in f.readlines()]
  rules_map = {node : children for (node, children) in rules}
  # Ensure that we have a proper tree
  detect_cycles(rules_map)

  for node in rules_map.keys():
    print('%20s\t\t%s' % (node, rules_map[node]))

  print(count_bags_contained(rules_map, 'shiny gold'))

if __name__ == '__main__':
  main()
