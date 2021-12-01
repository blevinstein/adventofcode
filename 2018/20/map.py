import operator

DIRS = {'N': (0, -1), 'S': (0, 1), 'E': (1, 0), 'W': (-1, 0)}

def main():
  with open('input.txt', 'r') as f:
    regex = f.read().strip()[1:-1]
  #regex = '^WSSEESWWWNW(S|NENNEEEENN(ESSSSW(NWSW|SSEN)|WSWWN(E|WWS(E|SS))))$'[1:-1]
  paths = all_paths(regex)
  graph = make_graph(paths)
  show(graph)
  #print max(shortest_path_len(graph, g, (0, 0)) for g in graph)
  #print longest_path_len(graph, (0, 0))
  print paths_at_least(graph, (0, 0), 1000)

def show(graph):
  min_x = min(g[0] for g in graph)
  max_x = max(g[0] for g in graph)
  min_y = min(g[1] for g in graph)
  max_y = max(g[1] for g in graph)
  # top row
  print '#',
  for x in xrange(min_x, max_x+1):
    print '# #',
  print
  for y in xrange(min_y, max_y+1):
    # cell and horizontal doors
    print '#',
    for x in xrange(min_x, max_x+1):
      if (x, y) in graph:
        print '.',
      else:
        print '?',
      if (x+1, y) in graph.get((x, y), set()):
        print '|',
      else:
        print '#',
    print
    # vertical doords
    print '#',
    for x in xrange(min_x, max_x+1):
      if (x, y+1) in graph.get((x, y), set()):
        print '-',
      else:
        print '#',
      print '#',
    print

# BFS to find long paths
def paths_at_least(graph, start, min_len):
  count = 0
  length = 0
  frontier = [start]
  visited = set([start])
  while frontier:
    length += 1
    new_frontier = []
    for f in frontier:
      for neighbor in graph[f]:
        if neighbor not in visited:
          if length >= min_len:
            count += 1
          new_frontier.append(neighbor)
          visited.add(neighbor)
    frontier = new_frontier
  return count

# BFS to find longest path
def longest_path_len(graph, start):
  length = 0
  frontier = [start]
  visited = set([start])
  while frontier:
    new_frontier = []
    for f in frontier:
      for neighbor in graph[f]:
        if neighbor not in visited:
          new_frontier.append(neighbor)
          visited.add(neighbor)
    frontier = new_frontier
    length += 1
  return length - 1

# BFS to find shortest path
def shortest_path_len(graph, start, end):
  length = 0
  frontier = [start]
  visited = set([start])
  while end not in frontier:
    new_frontier = []
    for f in frontier:
      for neighbor in graph[f]:
        if neighbor not in visited:
          new_frontier.append(neighbor)
          visited.add(neighbor)
    frontier = new_frontier
    length += 1
  return length



def add(a, b):
  return (a[0] + b[0], a[1] + b[1])

def make_graph(paths):
  visited = set()
  graph = {}
  for path in paths:
    pos = (0, 0)
    for step in path:
      next_pos = add(pos, DIRS[step])
      graph[pos] = graph.get(pos, set()) | set([next_pos])
      graph[next_pos] = graph.get(next_pos, set()) | set([pos])
      pos = next_pos
  return graph

def all_paths(regex):
  result = ['']
  i = 0
  while i < len(regex):
    if regex[i] in 'NSEW':
      result = [r + regex[i] for r in result]
      i += 1
    elif regex[i] == '(':
      right_paren = matching(regex, i)
      options = smart_split(regex, i+1, right_paren, '|')
      sub_result = reduce(operator.add, [all_paths(option) for option in options])
      result = [r1 + r2 for r1 in result for r2 in sub_result]
      i = right_paren + 1
    elif regex[i] in '|)':
      raise Exception('bad state')
    else:
      raise Exception('unexpected state')
  return result

# given a string s and the start/end index of parens, splits on depth-one separators
def smart_split(s, start, end, sep):
  splitters = []
  depth = 1
  for i in xrange(start+1, end):
    if s[i] == '(':
      depth += 1
    elif s[i] == ')':
      depth -= 1
    elif s[i] == sep and depth == 1:
      splitters.append(i)
    elif depth < 1:
      raise Exception('bad smart split')
  result = []
  pos = start
  while pos < end:
    if splitters:
      splitter = splitters.pop(0)
      result.append(s[pos:splitter])
      pos = splitter + 1
    else:
      result.append(s[pos:end])
      pos = end
  return result

# given a string s and the index of a left paren, returns the index of the matching right paren
def matching(s, i):
  if s[i] != '(':
    raise Exception('bad call to matching')
  depth = 1
  for j in xrange(i+1, len(s)):
    if s[j] == '(':
      depth += 1
    elif s[j] == ')':
      depth -= 1
    if depth == 0:
      return j
  raise Exception('matching paren not found: %s*(*%s' % (s[:i], s[i+1:]))

if __name__ == '__main__':
  main()
