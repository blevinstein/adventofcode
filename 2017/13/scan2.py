
def caught(scanners, delay):
  for (depth, range) in scanners:
    if position(range, depth + delay) == 0:
      return True
  return False

def position(range, time):
  cycle_length = (range - 1) * 2
  if time % cycle_length < range:
    return time % cycle_length
  else:
    return range - 2 - (time % cycle_length - range)

def main():
  scanners = []
  with open('input', 'r') as f:
    for line in f.readlines():
      parts = line.split(': ')
      scanners.append((int(parts[0]), int(parts[1])))
  delay = 0
  while caught(scanners, delay):
    delay += 1
  print delay

if __name__=='__main__':
  main()
