
def try_int(value):
  return int(value) if value != 'x' else None

# find smallest solution k to A*k = B (mod C)
def min_solution(a, b, c):
  for i in range(c):
    if a * i % c == b:
      return i

def main():
  with open('input.txt', 'r') as f:
    lines = f.readlines()
    if len(lines) != 2:
      raise Exception('Unexpected input length')
    min_time = int(lines[0])
    buses = [try_int(bus) for bus in lines[1].split(',')]

  print(buses)

  t = 0
  multiplier = 1
  for offset, bus in enumerate(buses):
    if bus is None:
      continue
    # calculate min_wait_time for this bus
    min_wait_time = -t % bus
    # how much longer do we need to wait for this bus
    additional_wait_time = (offset - min_wait_time) % bus
    # find a multiple of [multiplier] which gives the correct additional wait time
    multiplied_time = min_solution(-multiplier, additional_wait_time, bus)
    t += multiplier * multiplied_time
    print('t = %d' % t)
    multiplier *= bus
  print(t)

if __name__ == '__main__':
  main()
