
# return true iff you can find two different elements that sum to [value] in [buffer]
def find_sum(buffer, value):
  for i in range(len(buffer)):
    for j in range(i):
      if buffer[i] + buffer[j] == value:
        return True
  return False

# return a continuous series of elements which sum to [target]
def find_series_with_sum(source, target):
  series = [source[0]]
  next = 1
  while sum(series) != target:
    if next >= len(source):
      raise Exception('No good series found')
    if sum(series) < target:
      series.append(source[next])
      next += 1
    else:
      series.pop(0)
  return series

def detect_invalid(stream, buffer_len = 25):
  buffer = stream[:buffer_len]
  for value in stream[buffer_len:]:
    if not find_sum(buffer, value):
      return value
    buffer.pop(0)
    buffer.append(value)
  raise Exception('No invalid elements found')

def main():
  with open('input.txt', 'r') as f:
    input = [int(line.strip()) for line in f.readlines()]
  goal = detect_invalid(input)
  series = find_series_with_sum(input, goal)
  print(series)
  print(min(series) + max(series))

if __name__ == '__main__':
  main()
