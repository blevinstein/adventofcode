import math
import operator
import re

LINE_REGEX = re.compile('position=<\\s*(-?\\d+),\\s*(-?\\d+)> velocity=<\\s*(-?\\d+),\\s*(-?\\d+)>')

class Timeline:
  next_id = 0

  def __init__(self, x, y, dx, dy):
    self.id = Timeline.next_id
    Timeline.next_id += 1
    self.x = x
    self.y = y
    self.dx = dx
    self.dy = dy

  def get(self, t):
    return (self.x + self.dx * t, self.y + self.dy * t)

  def __eq__(self, other):
    return self.x == other.x and self.y == other.y and self.dx == other.dy

  def __hash__(self):
    return hash((self.x, self.y, self.dx, self.dy))

  def __repr__(self):
    return '(%d, %d) + (%d, %d) t' % (self.x, self.y, self.dx, self.dy)

  def diff(self, other):
    return Timeline(self.x - other.x, self.y - other.y, self.dx - other.dx, self.dy - other.dy)

  def closest_approach(self, other):
    MAX_DIST = 5
    # relative motion
    r = self.diff(other)
    if r.dx == 0 and r.dy == 0:
      return set([])
    # D2(t) = (x + dx * t)**2 + (y + dy * t)**2
    #       = (dx**2 + dy**2)*t**2 + (2*x*dx + 2*y*dy)*t + (x**2 + y**2)
    # dD2(t)/dt = (dx**2 + dy**2)*2*t + (2*x*dx + 2*y*dy)
    #           = 0 at closest approach, always a minimum for nonzero (dx, dy)
    # t = - (2*x*dx + 2*y*dy) / (2 * (dx**2 + dy**2))
    exact_t = - (2 * r.x * r.dx + 2 * r.y * r.dy) / (2 * (r.dx**2 + r.dy**2))
    miss = self.diff(other).get(exact_t)
    dist2 = miss[0]**2 + miss[1]**2
    if dist2 < MAX_DIST**2:
      return set([int(math.ceil(exact_t)), int(math.floor(exact_t))])
    else:
      return set([])

def main():
  with open('input.txt', 'r') as f:
    lines = f.readlines()
  timelines = [Timeline(*map(int, LINE_REGEX.match(line).groups())) for line in lines]
  count_components = lambda t: len(connected_components([tl.get(t) for tl in timelines]))
  min_components = None
  min_components_t = None
  print 'Finding candidate times...'
  candidate_times = find_candidate_times(timelines)
  for t in candidate_times:
    print 't=%d' % t
    current_components = count_components(t)
    if not min_components or current_components < min_components:
      min_components = current_components
      min_components_t = t
  show_points([tl.get(min_components_t) for tl in timelines])
  print min_components_t

def find_candidate_times(timelines):
  times = set([])
  for a in timelines:
    for b in timelines:
      if a != b and a.id < b.id:
        times |= a.closest_approach(b)
      if len(times) > 50:
        return times
  return times

# This didn't work, would take too long to try all times starting at zero.
def brute_min_components(timelines):
  count_components = lambda t: len(connected_components([tl.get(t) for tl in timelines]))
  t = 0
  min_components = count_components(0)
  print min_components
  while True:
    t += 1
    if t % 100 == 0:
      print 't=%d' % t
    current_components = count_components(t)
    if current_components < min_components:
      min_components = current_components

def show_points(points):
  min_x = min(p[0] for p in points)
  max_x = max(p[0] for p in points)
  min_y = min(p[1] for p in points)
  max_y = max(p[1] for p in points)
  for y in xrange(min_y, max_y + 1):
    for x in xrange(min_x, max_x + 1):
      if (x, y) in points:
        print '#',
      else:
        print ' ',
    print

def neighbors(point):
  return [(point[0] + 1, point[1]),
          (point[0] - 1, point[1]),
          (point[0], point[1] + 1),
          (point[0], point[1] - 1)]

def connected_components(points):
  components = []
  for point in points:
    touches_components = []
    for component in components:
      if any(n in component for n in neighbors(point)):
        touches_components.append(component)
    if not touches_components:
      components.append(set([point]))
    else:
      new_component = set([point])
      for touches_component in touches_components:
        components.remove(touches_component)
        new_component |= touches_component
      components.append(new_component)
  return components

if __name__ == '__main__':
  main()
