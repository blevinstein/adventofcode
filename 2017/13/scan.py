
def severity(scanners):
  total_severity = 0
  for (depth, range) in scanners:
    if position(range, depth) == 0:
      total_severity += depth * range
  return total_severity

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
  print severity(scanners)

if __name__=='__main__':
  main()
