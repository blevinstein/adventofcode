

# node for building linked list
class Node:
  def __init__(self, value, next = None):
    self.value = value
    self.next = next

def main():
  current_node = build_buffer(380, 50000000)
  while current_node.value != 0:
    current_node = current_node.next
  print current_node.next.value

def build_buffer(input, size):
  current_node = Node(0)
  current_node.next = current_node
  for i in xrange(1, size):
    for j in xrange(input):
      current_node = current_node.next
    # insert a node
    current_node.next = Node(i, current_node.next)
    # advance current node
    current_node = current_node.next
  return current_node

if __name__=='__main__':
  main()
