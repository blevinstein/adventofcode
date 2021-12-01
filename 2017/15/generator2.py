
PAIRS = 5000000
MASK = 0xffff

class Generator:
  def __init__(self, seed, factor, mod, multiple_filter):
    self.last_value = seed
    self.factor = factor
    self.mod = mod
    self.multiple_filter = multiple_filter

  def __step(self):
    self.last_value = (self.last_value * self.factor) % self.mod

  def next(self):
    self.__step()
    while self.last_value % self.multiple_filter != 0:
      self.__step()
    return self.last_value

def main():
  #print matches(Generator(65, 16807, 2147483647, 4), Generator(8921, 48271, 2147483647, 8))
  print matches(Generator(783, 16807, 2147483647, 4), Generator(325, 48271, 2147483647, 8))

def matches(gen_a, gen_b):
  count = 0
  for i in xrange(PAIRS):
    value_a = gen_a.next()
    value_b = gen_b.next()
    if value_a & MASK == value_b & MASK:
      count += 1
  return count

if __name__=='__main__':
  main()
