
use std::env;
use std::fs;

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let input: Vec<Vec<char>> = raw_input.trim().split("\n")
      .map(|line| line.chars().collect())
      .collect();

  let width: usize = input[0].len();

  let mut split_count: usize = 0;

  // Keep a vector of booleans, indicating which positions have a beam
  let mut state: Vec<bool> = input[0].iter().map(|c| *c == 'S').collect();
  for line in input.clone() {
    let mut new_state: Vec<bool> = vec![false; width];
    for x in 0..width {
      // Count splits
      if state[x] && line[x] == '^' {
        split_count += 1;
      }
      // Calculate new state
      new_state[x] =
          // Undisturbed beam
          (state[x] && line[x] != '^')
          // Beam split to right
          || (x > 0 && state[x-1] && line[x-1] == '^')
          // Beam split to left
          || (x < width - 1 && state[x+1] && line[x+1] == '^');
    }
    state = new_state;
  }

  println!("Total split count is {split_count}");

  // Similar approach, but instead of a vector of booleans, we track how many unique paths
  // lead to each point, using a vector of integers
  let mut quantum_state: Vec<usize> = input[0].iter()
      .map(|c| if *c == 'S' { 1 } else { 0 })
      .collect();
  for line in input {
    let mut new_quantum_state: Vec<usize> = vec![0; width];
    for x in 0..width {
      if line[x] == '^' {
        new_quantum_state[x] = 0;
      } else {
        // Undisturbed beam
        new_quantum_state[x] = quantum_state[x];
        // Beam split to right
        if x > 0 && line[x-1] == '^' {
          new_quantum_state[x] += quantum_state[x-1];
        }
        // Beam split to left
        if x < width - 1 && line[x+1] == '^' {
          new_quantum_state[x] += quantum_state[x+1];
        }
      }
    }
    quantum_state = new_quantum_state;
  }

  let total_timelines: usize = quantum_state.iter().sum();

  println!("Total timelines is {total_timelines}");
}
