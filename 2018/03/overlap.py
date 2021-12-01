import re
import operator

LINE_REGEX = re.compile('^#(\d+) @ (\d+),(\d+): (\d+)x(\d+)$')

class Patch:
  def __init__(self, id, x, y, width, height):
    self.id = id
    self.x = x
    self.y = y
    self.width = width
    self.height = height

  def __repr__(self):
    return 'ID %d (%d,%d): %dx%d' % (self.id, self.x, self.y, self.width, self.height)

  def overlaps(self, patch):
    return self.x < (patch.x + patch.width) and (self.x + self.width) > patch.x and \
        self.y < (patch.y + patch.height) and (self.y + self.height) > patch.y

  def intersect(self, patch):
    if not self.overlaps(patch):
      return None
    x1 = max(self.x, patch.x)
    y1 = max(self.y, patch.y)
    x2 = min(self.x + self.width, patch.x + patch.width)
    y2 = min(self.y + self.height, patch.y + patch.height)
    return Patch(-1, x1, y1, x2-x1, y2-y1)

  def contains(self, patch):
    return self.x <= patch.x and self.x + self.width >= patch.x + patch.width and \
        self.y <= patch.y and self.y + self.height >= patch.y + patch.height

  def area(self):
    return self.width * self.height

  def split_y(self, y):
    if self.y < y and self.y + self.height > y:
      return [Patch(-1, self.x, self.y, self.width, y - self.y),
          Patch(-1, self.x, y, self.width, self.y + self.height - y)]
    else:
      return [self]

  def split_x(self, x):
    if self.x < x and self.x + self.width > x:
      return [Patch(-1, self.x, self.y, x - self.x, self.height),
          Patch(-1, x, self.y, self.x + self.width - x, self.height)]
    else:
      return [self]

  def split(self, xs, ys):
    patches = [self]
    for x in xs:
      patches = reduce(operator.add, [p.split_x(x) for p in patches])
    for y in ys:
      patches = reduce(operator.add, [p.split_y(y) for p in patches])
    return patches

  def diff(self, patch):
    if not self.overlaps(patch):
      return [self]
    parts = self.split([patch.x, patch.x + patch.width], [patch.y, patch.y + patch.height])
    result = [part for part in parts if not patch.contains(part)]

    new_area = sum(p.area() for p in result)
    expected_area = self.area() - self.intersect(patch).area()
    if new_area != expected_area:
      raise Exception('bad diff')

    return result

  def equals(self, patch):
    return self.x == patch.x and self.width == patch.width and \
        self.y == patch.y and self.height == patch.height

  def __eq__(self, patch):
    return self.id == patch.id and self.x == patch.x and self.width == patch.width and \
        self.y == patch.y and self.height == patch.height

  def __hash__(self):
    return hash((self.id, self.x, self.y, self.width, self.height))

def main():
  with open('input.txt', 'r') as f:
    lines = f.readlines()
  patches = []
  for line in lines:
    match = LINE_REGEX.match(line)
    patches.append(Patch(
        int(match.group(1)),
        int(match.group(2)),
        int(match.group(3)),
        int(match.group(4)),
        int(match.group(5))))
  overlapping_patches = set([])
  for a in patches:
    for b in patches:
      if a.id >= b.id:
        continue
      if a.overlaps(b):
        overlapping_patches.add(a)
        overlapping_patches.add(b)
  print([x for x in patches if not x in overlapping_patches])
  #print('Overlapping...')
  #overlaps = []
  #for a in patches:
  #  for b in patches:
  #    if a.id >= b.id:
  #      continue
  #    if a.overlaps(b):
  #      overlaps.append(a.intersect(b))
  #print('Adding up...')
  #unique_overlaps = union_all(overlaps)
  #print(sum(p.area() for p in unique_overlaps))

def dedupe_patches(all_patches):
  unique_patches = []
  for candidate in all_patches:
    unique = True
    for i in xrange(len(unique_patches)):
      if candidate.equals(unique_patches[i]) or unique_patches[i].contains(candidate):
        unique = False
        break
      elif candidate.contains(unique_patches[i]):
        unique_patches.pop(i)
        unique_patches.insert(i, candidate)
        unique = False
        break
    if unique:
      unique_patches.append(candidate)
  return unique_patches

def union_all(patches):
  result = []
  for patch in patches:
    remaining_areas = [patch]
    for existing_patch in result:
      if not remaining_areas:
        break
      remaining_areas = reduce(operator.add,
          map(lambda p: p.diff(existing_patch), remaining_areas))
    if remaining_areas:
      result += remaining_areas
  return result

if __name__ == '__main__':
  main()
