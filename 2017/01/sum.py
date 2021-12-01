

def main():
  with open('input', 'r') as f:
    data = f.read().strip()
  sum = 0
  for i in xrange(len(data)):
    current_digit = data[i]
    next_digit = data[(i + 1) % len(data)]
    if current_digit == next_digit:
      sum += int(current_digit)
  print sum

if __name__=='__main__':
  main()
