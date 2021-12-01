
def add_edge(graph, a, b):
  add_mono_edge(graph, a, b)
  add_mono_edge(graph, b, a)

def add_mono_edge(graph, a, b):
  node_set = graph.get(a, set())
  node_set.add(b)
  graph[a] = node_set

def floodfill(graph, start):
  visited = set()
  frontier = set([start])
  while frontier:
    current = frontier.pop()
    visited.add(current)
    for neighbor in graph[current]:
      if neighbor not in visited:
        frontier.add(neighbor)
  return visited

def main():
  graph = {}
  with open('input', 'r') as f:
    for line in f.readlines():
      parts = line.split(' <-> ')
      current = int(parts[0])
      connected_nodes = [int(node) for node in parts[1].split(', ')]
      for connected_node in connected_nodes:
        add_edge(graph, current, connected_node)
  # part 1
  print len(floodfill(graph, 0))
  # part 2
  unvisited_nodes = set(graph.keys())
  groups = 0
  while unvisited_nodes:
    unvisited_node = list(unvisited_nodes)[0]
    unvisited_nodes -= floodfill(graph, unvisited_node)
    groups += 1
  print groups

if __name__=='__main__':
  main()
