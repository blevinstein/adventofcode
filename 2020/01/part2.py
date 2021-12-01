
def main():
  with open('input.txt', 'r') as f:
    input = [int(line.strip()) for line in f.readlines()]
  solutions = [a * b * c for a in input for b in input for c in input if a > b and b > c and a + b + c == 2020]
  print(solutions)

if __name__ == '__main__':
  main()
