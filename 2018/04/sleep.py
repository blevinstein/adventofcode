import re
from enum import Enum

LINE_PATTERN = re.compile('^\\[(\d+-\d+-\d+) (\d+):(\d+)\] ([\w\d\s#]+)\n')
SHIFT_START = re.compile('Guard #(\d+) begins shift')
SLEEPS = 'falls asleep'
WAKES = 'wakes up'

class Event:
  def __init__(self, date, hour, minute, text):
    self.date = date
    self.hour = hour
    self.minute = minute
    self.text = text
    if hour not in [23, 0]:
      raise Exception('bad hour')

  def __repr__(self):
    return '[%s %02d:%02d] %s' % (self.date, self.hour, self.minute, self.text)

def main():
  with open('input.txt', 'r') as f:
    lines = f.readlines()
  events = []
  for line in lines:
    match = LINE_PATTERN.match(line)
    events.append(Event(match.group(1), int(match.group(2)), int(match.group(3)), match.group(4)))
  sleeps = {}
  active_guard = None
  all_guards = set([])
  asleep = False
  sleep_start = None
  events.sort(key = lambda e: (e.date, e.hour, e.minute))
  # Go through events in chronological order
  for event in events:
    match = SHIFT_START.match(event.text)
    if match:
      if asleep:
        raise Exception('guard asleep at shift change')
      active_guard = int(match.group(1))
      sleeps[active_guard] = sleeps.get(active_guard, [])
      all_guards.add(active_guard)
    elif event.text == SLEEPS:
      if event.hour == 23:
        raise Exception('unexpected sleep')
      if asleep:
        raise Exception('already asleep')
      if not active_guard:
        raise Exception('no guard active')
      asleep = True
      sleep_start = event.minute
    elif event.text == WAKES:
      if event.hour == 23:
        raise Exception('unexpected wake')
      if not asleep:
        raise Exception('already awake')
      if not active_guard:
        raise Exception('no guard active')
      asleep = False
      sleeps[active_guard].append((sleep_start, event.minute))
    else:
      raise Exception('bad instruction')
  # Part 1
  #minutes_asleep = {guard: sum(end - start for (start,end) in sleeps[guard]) for guard in sleeps}
  #most_asleep = max(all_guards, key=lambda g: minutes_asleep[g])
  #time_most_asleep = max(range(0,60), key=lambda m: sum(1 for (start,end) in sleeps[most_asleep]
  #    if start <= m and m < end))
  #print time_most_asleep * most_asleep
  all_options = [(guard, min) for guard in all_guards for min in range(0,60)]
  chosen_option = max(all_options, key=lambda (g,m): sum(1 for (start,end) in sleeps[g] if start <=
    m and m < end))
  print chosen_option[0] * chosen_option[1]

if __name__ == '__main__':
  main()
