import re

LINE_REGEX = re.compile('Step (\w) must be finished before step (\w) can begin.')

def main():
  with open('input.txt', 'r') as f:
    lines = f.readlines()
  deps = {}
  steps = set([])
  for line in lines:
    match = LINE_REGEX.match(line)
    deps[match.group(2)] = deps.get(match.group(2), []) + [match.group(1)]
    steps.add(match.group(1))
    steps.add(match.group(2))
  # Part 1
  #print topo_sort(steps, deps)
  # Part 2
  print parallel_duration(steps, deps, 5)

def parallel_duration(steps, deps, num_workers):
  order = []
  done = set([])
  in_progress = set([])
  ready_time = {}
  current_task = {}
  for worker in xrange(num_workers):
    ready_time[worker] = 0
    current_task[worker] = None
  time = 0
  while steps - done:
    # Update for completed tasks
    done_workers = [worker for worker in xrange(num_workers) if ready_time[worker] <= time and
        current_task[worker] is not None]
    if done_workers:
      for worker in done_workers:
        order.append(current_task[worker])
        done.add(current_task[worker])
        in_progress.remove(current_task[worker])
        #print 'Worker %d completes task %s at time %d' % (worker, current_task[worker], time)
        current_task[worker] = None
    else:
      available_workers = [worker for worker in xrange(num_workers) if ready_time[worker] <= time]
      next_step = next_task(deps, steps - in_progress, done)
      if available_workers and next_step:
        # Assign a task
        worker = available_workers[0]
        ready_time[worker] = time + duration(next_step)
        current_task[worker] = next_step
        in_progress.add(next_step)
        #print 'Worker %d starts task %s at time %d, to be completed at %d' % (worker, next_step,
        #    time, ready_time[worker])
      else:
        # Advance time to the next ready_time
        time = min(ready_time[w] for w in xrange(num_workers) if current_task[w])
  return time


def duration(step):
  return ord(step) - 64 + 60

def next_task(deps, todo, done):
  for step in todo - done:
    if all(dep in done for dep in deps.get(step, [])):
      return step
  return None

def topo_sort(steps, deps):
  done = set([])
  order = []
  while steps - done:
    step = next_task(deps, steps, done)
    order.append(step)
    done.add(step)
  return ''.join(order)

if __name__ == '__main__':
  main()
