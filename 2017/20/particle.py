import math
import re

def main():
  with open('input', 'r') as f:
    particles = [Particle.parse(id, line) for (id, line) in enumerate(f.readlines())]
  collisions = []
  for a in particles:
    for b in particles:
      if a.id >= b.id:
        continue
      collision_times = a.collision_times(b)
      if collision_times:
        for t in collision_times:
          collisions.append((t, a.id, b.id))
  # sort collisions chronologically
  collisions.sort()
  particle_death = {} # maps from particle id to time of death
  for t, a, b in collisions:
    # if either particle was destroyed in the past, continue
    if particle_death.get(a, t) < t or particle_death.get(b, t) < t:
      continue
    particle_death[a] = t
    particle_death[b] = t
  print len([particle for particle in particles if particle.id not in particle_death])

TOL = 0.1
def rounded_quadratic(a, b, c):
  solutions = solve_quadratic(a, b, c)
  if type(solutions) == AllSet:
    return solutions
  new_solutions = set([])
  for solution in solutions:
    if solution % 1 < TOL or solution % 1 > 1 - TOL:
      maybe_solution = int(round(solution))
      if a * maybe_solution**2 + b * maybe_solution + c == 0:
        new_solutions.add(maybe_solution)
  return new_solutions

def solve_quadratic(a, b, c):
  if a == 0:
    if b == 0:
      if c == 0:
        return AllSet()
      else:
        return set()
    else:
      return set([-c * 1.0 / b])
  det = b**2 - 4*a*c
  if det == 0:
    return set([-b / (2.0 * a)])
  elif det > 0:
    return set([(-b + math.sqrt(det)) / (2.0 * a), (-b - math.sqrt(det)) / (2.0 * a)])
  else:
    return set()

class AllSet(set):
  def __and__(self, other):
    return other
  def __rand__(self, other):
    return other
  def __repr__(self):
    return 'set(ALL)'

LINE = re.compile('p=<(?P<position>[\d\-, ]+)>, v=<(?P<velocity>[\d\-, ]+)>, a=<(?P<acceleration>[\d\-, ]+)>')

class Particle(object):
  def __init__(self, id, position, velocity, acceleration):
    self.id = id
    self.position = position
    self.velocity = velocity
    self.acceleration = acceleration

  @staticmethod
  def parse(id, line):
    data = LINE.match(line)
    return Particle(
        id,
        Point.parse(data.group('position')),
        Point.parse(data.group('velocity')),
        Point.parse(data.group('acceleration')))

  def future(self, time):
    return Particle(
        self.id,
        self.position + self.velocity * time + self.acceleration * (time * (time + 1) / 2),
        self.velocity + self.acceleration * time,
        self.acceleration)

  def simulate(self, time):
    if time < 0:
      return None
    p = self.position
    v = self.velocity
    for i in xrange(time):
      v += self.acceleration
      p += v
    return Particle(self.id, p, v, self.acceleration)

  # p + tv + t(t+1)a/2 = origin
  # 3 equations (one for each coordinate), 2 possible solutions
  # p + tv + (t**2 + t)a/2 = origin
  # p + t(v + a/2) + t**2(a/2) = origin
  # quadratic equation with A = a/2, B = v + a/2, C = p
  def collision_times(self, p):
    # create a virtual particle representing relative position
    diff = Particle(-1, self.position - p.position, self.velocity - p.velocity, self.acceleration - p.acceleration)
    # calculate zeroes in each dimension
    x_zeroes = rounded_quadratic(diff.acceleration.x / 2.0, diff.velocity.x + diff.acceleration.x / 2.0, diff.position.x)
    y_zeroes = rounded_quadratic(diff.acceleration.y / 2.0, diff.velocity.y + diff.acceleration.y / 2.0, diff.position.y)
    z_zeroes = rounded_quadratic(diff.acceleration.z / 2.0, diff.velocity.z + diff.acceleration.z / 2.0, diff.position.z)
    zeroes = x_zeroes & y_zeroes & z_zeroes
    if len(zeroes) > 0:
      return filter(lambda t: t >= 0, zeroes)
    else:
      return None

  def __repr__(self):
    return '(%d) p=<%s>, v=<%s>, a=<%s>' % (self.id, self.position, self.velocity, self.acceleration)

class Point(object):
  def __init__(self, x, y, z):
    self.x = x
    self.y = y
    self.z = z

  @staticmethod
  def parse(str):
    parts = str.split(',')
    if len(parts) != 3:
      raise Exception('Invalid point spec: %s' % str)
    return Point(*map(lambda part: int(part), parts))

  def __add__(self, p):
    return Point(self.x + p.x, self.y + p.y, self.z + p.z)

  def __sub__(self, p):
    return Point(self.x - p.x, self.y - p.y, self.z - p.z)

  def __mul__(self, scalar):
    return Point(self.x * scalar, self.y * scalar, self.z * scalar)

  def __repr__(self):
    return '%d,%d,%d' % (self.x, self.y, self.z)

  def __eq__(self, p):
    return self.x == p.x and self.y == p.y and self.z == p.z

  def __ne__(self, p):
    return self.x != p.x or self.y != p.y or self.z != p.z

  def manhattan_dist(self):
    return abs(self.x) + abs(self.y) + abs(self.z)

if __name__=='__main__':
  main()
