
def main():
  with open('input.txt', 'r') as f:
    input = [int(line.strip()) for line in f.readlines()]
  solutions = [a * b for a in input for b in input if a > b and a + b == 2020]
  print(solutions)

if __name__ == '__main__':
  main()
