
def main():
  # Part 1
  #print max(marble_game(10, 1618))
  #print max(marble_game(13, 7999))
  #print max(marble_game(30, 5807))
  #print max(marble_game(441, 71032))
  # Part 2
  #print max(marble_game_2(9, 25))
  #print max(marble_game_2(30, 5807))
  print max(marble_game(441, 7103200))

class Node:
  def __init__(self, value, prev, next):
    self.value = value
    self.prev = prev
    self.next = next

  def rotate(self, offset):
    if offset == 0:
      return self
    elif offset > 0:
      return self.next.rotate(offset - 1)
    else:
      return self.prev.rotate(offset + 1)

  def insert(self, new_value):
    new_node = Node(new_value, self, self.next)
    self.next.prev = new_node
    self.next = new_node
    return new_node

  def remove(self):
    self.next.prev = self.prev
    self.prev.next = self.next
    return self.value

  def dump(self):
    print self.value,
    last = self
    node = self.next
    while node.value != self.value:
      print node.value,
      last = node
      node = node.next
      if node.prev != last:
        raise Exception('bad DLL')
    print

def marble_game_2(num_players, num_marbles):
  scores = [0] * num_players
  current_marble = Node(0, None, None)
  current_marble.next = current_marble
  current_marble.prev = current_marble
  for marble in xrange(1, num_marbles):
    #current_marble.dump()
    #if marble % 10000 == 0:
    #  print marble
    current_player = marble % num_players
    if marble % 23 == 0:
      scores[current_player] += marble
      scores[current_player] += current_marble.rotate(-7).remove()
      current_marble = current_marble.rotate(-6)
    else:
      current_marble = current_marble.rotate(1).insert(marble)
  return scores

def marble_game(num_players, num_marbles):
  scores = [0] * num_players
  current_marble = 0
  marbles = [0]
  for marble in xrange(1, num_marbles):
    if marble % 10000 == 0:
      print marble
    current_player = marble % num_players
    if marble % 23 == 0:
      scores[current_player] += marble
      current_marble = (current_marble - 7 + len(marbles)) % len(marbles)
      scores[current_player] += marbles.pop(current_marble)
    else:
      insert_index = (current_marble + 2) % len(marbles)
      marbles.insert(insert_index, marble)
      current_marble = insert_index
  return scores

if __name__ == '__main__':
  main()
