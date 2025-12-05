
use std::env;
use std::fs;
use std::collections::HashMap;

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let input: Vec<&str> = raw_input.trim().split("\n").collect();

  let length = input[0].len();

  let mut freqs: Vec<HashMap<char,usize>> = vec![HashMap::new(); length];

  for line in input {
    for i in 0..length {
      *freqs[i].entry(line.chars().nth(i).unwrap()).or_insert(0) += 1
    }
  }

  let message: String = (0..length)
      .map(|i| freqs[i].keys().max_by(|a, b| freqs[i].get(&a).cmp(&freqs[i].get(&b))).unwrap())
      .collect();

  println!("Message is {message}");

  let hidden_message: String = (0..length)
      .map(|i| freqs[i].keys().min_by(|a, b| freqs[i].get(&a).cmp(&freqs[i].get(&b))).unwrap())
      .collect();

  println!("Hidden message is {hidden_message}");
}
