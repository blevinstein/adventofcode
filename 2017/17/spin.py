

def main():
  buffer, current_position = build_buffer(380, 2018)
  print buffer[(current_position + 1) % len(buffer)]

def build_buffer(input, size):
  buffer = [0]
  current_position = 0
  for i in xrange(1, size):
    current_position = (current_position + input) % len(buffer)
    buffer.insert(current_position + 1, i)
    current_position += 1
  return (buffer, current_position)

if __name__=='__main__':
  main()
