
def main():
  #print power(71, 101, 153)
  print max_power_patch(18)
  print max_power_patch(42)
  x, y = max_power_patch(6042)
  show_patch(6042, x, y)
  print (x, y)

def power(serial_number, x, y):
  rack_id = x + 10
  power_level = ((rack_id * y) + serial_number) * rack_id
  hundreds = (power_level % 1000) / 100
  return hundreds - 5

def max_power_patch(serial_number):
  power_map = {}
  return max(((x, y) for x in xrange(1, 301 - 2) for y in xrange(1, 301 - 2)),
      key = lambda (x, y): sum(
          power(serial_number, x2, y2) for x2 in xrange(x, x+3) for y2 in xrange(y, y+3)))

def show_patch(serial_number, x, y):
  for y2 in xrange(y-1, y+4):
    for x2 in xrange(x-1, x+4):
      print '%5d  ' % power(serial_number, x2, y2),
    print

if __name__ == '__main__':
  main()
