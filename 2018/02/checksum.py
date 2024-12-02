import string

def main():
  with open('input.txt', 'r') as f:
    lines = f.readlines()
  # Part 1:
  twos = 0
  threes = 0
  for line in lines:
    freqs = freq_count(line)
    if contains(freqs, 2):
      twos += 1
    if contains(freqs, 3):
      threes += 1
  print(twos * threes)

  # Part 2
  for a in lines:
    for b in lines:
      if a >= b:
        continue
      if diff_count(a, b) == 1:
        same_chars = string.join([x for (x,y) in zip(a, b) if x == y], '')
        print(same_chars)
        break

def diff_count(a, b):
  return sum(1 for (x,y) in zip(a,b) if x != y)

def contains(freqs, value):
  for k in freqs:
    if freqs[k] == value:
      return True

def freq_count(word):
  freq = {}
  for letter in word:
    freq[letter] = freq.get(letter, 0) + 1
  return freq

if __name__ == '__main__':
  main()
