
def find_sum(buffer, value):
  for i in range(len(buffer)):
    for j in range(i):
      if buffer[i] + buffer[j] == value:
        return True
  return False

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
  print(detect_invalid(input))

if __name__ == '__main__':
  main()
