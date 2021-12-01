
import re

HEADER = re.compile(r"Player (\d):")

def parse_deck(deck_str):
  lines = deck_str.strip().split('\n')
  id = int(HEADER.fullmatch(lines[0]).group(1))
  cards = [int(line) for line in lines[1:]]
  return cards

def score_deck(deck):
  return sum((len(deck) - i) * card for i, card in enumerate(deck))

# returns (winner, decks)
def play_game(decks, memory):
  original_decks = tuple(tuple(deck) for deck in decks)
  if original_decks in memory:
    #print('Short circuit: %s vs %s' % (decks[0], decks[1]))
    return memory[original_decks]
  previous_states = []
  while all(decks):
    tuple_decks = tuple(tuple(deck) for deck in decks)
    if tuple_decks in previous_states:
      memory[original_decks] = (0, decks)
      return (0, decks)
    previous_states.append(tuple_decks)
    played_cards = [deck.pop(0) for deck in decks]
    if len(decks[0]) >= played_cards[0] and len(decks[1]) >= played_cards[1]:
      # recurse to determine winner
      recur_decks = [decks[0][:played_cards[0]], decks[1][:played_cards[1]]]
      #print('Recurse: %s vs %s' % (recur_decks[0], recur_decks[1]))
      winner = play_game(recur_decks, memory)[0]
    else:
      winner = 1 if played_cards[1] > played_cards[0] else 0
    decks[winner].append(played_cards[winner])
    decks[winner].append(played_cards[1-winner])
  winner = 1 if decks[1] else 0
  memory[original_decks] = (winner, decks)
  return (winner, decks)

def main():
  #with open('test.txt') as f:
  #with open('test2.txt') as f:
  with open('input.txt') as f:
    decks = [parse_deck(deck_str) for deck_str in f.read().split('\n\n')]

  winner, new_decks = play_game(decks, {})
  print([score_deck(deck) for deck in new_decks])

if __name__ == '__main__':
  main()
