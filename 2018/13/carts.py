
UP = (0, -1)
DOWN = (0, 1)
LEFT = (-1, 0)
RIGHT = (1, 0)
DIRS = [UP, DOWN, LEFT, RIGHT]

PURE_VERT = ['|', '^', 'v']
PURE_HORIZ = ['-', '<', '>']
VERT = PURE_VERT + ['+']
HORIZ = PURE_HORIZ + ['+']

CARTS = {UP: '^', DOWN: 'v', LEFT: '<', RIGHT: '>'}

class Cart:
  def __init__(self, pos, dir):
    self.pos = pos
    self.dir = dir
    self.choice = 0

def main():
  with open('input.txt', 'r') as f:
    lines = f.readlines()
  # read the map and cart positions
  tracks = {}
  carts = []
  for y in xrange(len(lines)):
    for x in xrange(len(lines[y])):
      # update map
      if lines[y][x] == ' ':
        pass
      elif lines[y][x] in PURE_VERT:
        tracks[(x, y)] = [UP, DOWN]
      elif lines[y][x] in PURE_HORIZ:
        tracks[(x, y)] = [LEFT, RIGHT]
      elif lines[y][x] == '/':
        if y+1 < len(lines) and x+1 < len(lines[y]) \
            and lines[y+1][x] in VERT and lines[y][x+1] in HORIZ:
          tracks[(x, y)] = [DOWN, RIGHT]
        elif y-1 >= 0 and x-1 >= 0 and lines[y-1][x] in VERT and lines[y][x-1] in HORIZ:
          tracks[(x, y)] = [UP, LEFT]
        else:
          raise Exception('bad curve at (%d, %d)' % (x, y))
      elif lines[y][x] == '\\':
        if y+1 < len(lines) and x-1 >= 0 and lines[y+1][x] in VERT and lines[y][x-1] in HORIZ:
          tracks[(x, y)] = [DOWN, LEFT]
        elif y-1 >= 0 and x+1 < len(lines[y]) and lines[y-1][x] in VERT and lines[y][x+1] in HORIZ:
          tracks[(x, y)] = [UP, RIGHT]
        else:
          raise Exception('bad curve at (%d, %d)' % (x, y))
      elif lines[y][x] == '+':
        tracks[(x, y)] = DIRS
      # update carts
      if lines[y][x] == 'v':
        carts.append(Cart((x, y), DOWN))
      elif lines[y][x] == '^':
        carts.append(Cart((x, y), UP))
      elif lines[y][x] == '<':
        carts.append(Cart((x, y), LEFT))
      elif lines[y][x] == '>':
        carts.append(Cart((x, y), RIGHT))
  # Part 1
  #print first_collision(tracks, carts)
  # Part 2
  print last_standing(tracks, carts)

def last_standing(tracks, carts):
  # create a dict to store carts by position
  cart_map = {cart.pos: cart for cart in carts}
  while len(carts) > 1:
    # DEBUG: show(tracks, cart_map)
    # sort carts by position
    carts.sort(key = lambda cart: (cart.pos[1], cart.pos[0]))
    # move carts
    to_remove = set([])
    for cart in carts:
      if cart in to_remove:
        continue
      new_pos = add(cart.pos, cart.dir)
      new_dirs = [dir for dir in tracks[new_pos] if dot(dir, cart.dir) >= 0] # no U-turns
      new_dir = None
      if len(new_dirs) == 3:
        if cart.choice == 0:
          # left turn
          new_dir = (cart.dir[1], -cart.dir[0])
        elif cart.choice == 1:
          # straight
          new_dir = cart.dir
        elif cart.choice == 2:
          # right turn
          new_dir = (-cart.dir[1], cart.dir[0])
        cart.choice = (cart.choice + 1) % 3
      elif len(new_dirs) == 1:
        new_dir = new_dirs[0]
      else:
        raise Exception('Can\'t continue')
      if new_pos in cart_map:
        # remove both carts in case of collision
        to_remove.add(cart)
        to_remove.add(cart_map[new_pos])
        del cart_map[cart.pos]
        del cart_map[new_pos]
      else:
        # Update carts and cart map
        del cart_map[cart.pos]
        cart_map[new_pos] = cart
        cart.dir = new_dir
        cart.pos = new_pos
    for r in to_remove:
      carts.remove(r)
  return carts[0].pos

def first_collision(tracks, carts):
  # create a dict to store carts by position
  cart_map = {cart.pos: cart for cart in carts}
  while True:
    # DEBUG: show(tracks, cart_map)
    # sort carts by position
    carts.sort(key = lambda cart: (cart.pos[1], cart.pos[0]))
    # move carts
    for cart in carts:
      new_pos = add(cart.pos, cart.dir)
      new_dirs = [dir for dir in tracks[new_pos] if dot(dir, cart.dir) >= 0] # no U-turns
      new_dir = None
      if len(new_dirs) == 3:
        if cart.choice == 0:
          # left turn
          new_dir = (cart.dir[1], -cart.dir[0])
        elif cart.choice == 1:
          # straight
          new_dir = cart.dir
        elif cart.choice == 2:
          # right turn
          new_dir = (-cart.dir[1], cart.dir[0])
        cart.choice = (cart.choice + 1) % 3
      elif len(new_dirs) == 1:
        new_dir = new_dirs[0]
      else:
        raise Exception('Can\'t continue')
      if new_pos in cart_map:
        # found first collision
        return new_pos
      # Update carts and cart map
      del cart_map[cart.pos]
      cart_map[new_pos] = cart
      cart.dir = new_dir
      cart.pos = new_pos

def show(tracks, cart_map):
  min_x = min(t[0] for t in tracks)
  max_x = max(t[0] for t in tracks)
  min_y = min(t[1] for t in tracks)
  max_y = max(t[1] for t in tracks)
  for y in xrange(min_y, max_y + 1):
    for x in xrange(min_x, max_x + 1):
      if (x, y) in cart_map:
        print CARTS[cart_map[(x, y)].dir],
      elif (x, y) in tracks:
        if tracks[(x, y)] in [[UP, LEFT], [DOWN, RIGHT]]:
          print '/',
        elif tracks[(x, y)] in [[UP, RIGHT], [DOWN, LEFT]]:
          print '\\',
        elif tracks[(x, y)] == DIRS:
          print '+',
        elif tracks[(x, y)] == [UP, DOWN]:
          print '|',
        elif tracks[(x, y)] == [LEFT, RIGHT]:
          print '-',
        else:
          raise Exception('Unknown track')
      else:
        print ' ',
    print
  print

def add(a, b):
  return (a[0] + b[0], a[1] + b[1])

def dot(a, b):
  return a[0] * b[0] + a[1] * b[1]

if __name__ == '__main__':
  main()
