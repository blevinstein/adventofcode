
def divide_any(numbers):
  for i in xrange(len(numbers)):
    for j in xrange(len(numbers)):
      if i != j:
        if numbers[i] % numbers[j] == 0:
          return numbers[i] / numbers[j]
  return None

def main():
  with open("input", "r") as f:
    data = [[int(part) for part in line.split()] for line in f.readlines()]

  quotients = [divide_any(row) for row in data]
  print sum(quotients)

if __name__ == '__main__':
  main()

