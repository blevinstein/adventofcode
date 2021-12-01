
import re

HEADER = re.compile(r"Player (\d):")

def parse_deck(deck_str):
  lines = deck_str.strip().split('\n')
  id = int(HEADER.fullmatch(lines[0]).group(1))
  cards = [int(line) for line in lines[1:]]
  return cards

def score_deck(deck):
  return sum((len(deck) - i) * card for i, card in enumerate(deck))

def main():
  #with open('test.txt') as f:
  with open('input.txt') as f:
    decks = [parse_deck(deck_str) for deck_str in f.read().split('\n\n')]

  while all(decks):
    played_cards = [deck.pop(0) for deck in decks]
    winner = 1 if played_cards[1] > played_cards[0] else 0
    decks[winner].append(played_cards[winner])
    decks[winner].append(played_cards[1-winner])
  print(decks)
  print([score_deck(deck) for deck in decks])

if __name__ == '__main__':
  main()
