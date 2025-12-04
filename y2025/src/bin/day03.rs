
use std::env;
use std::fs;

fn max_two_jolts(bank: Vec<u64>) -> u64 {
  let mut first_digit = bank.iter().nth(0).unwrap();
  let mut result = 0;

  for second_digit in &bank[1..] {
    let jolts = first_digit * 10 + second_digit;
    if jolts > result { result = jolts; }
    if second_digit > first_digit { first_digit = second_digit; }
  }

  result
}

fn max_twelve_jolts(bank: Vec<u64>) -> u64 {
  let mut digits: Vec<u64> = bank.clone()[..12].to_vec();

  for new_digit in &bank[12..] {
    digits.push(new_digit.clone());
    match digits.windows(2).position(|w| w[0] < w[1]) {
      Some(i) => digits.remove(i),
      None => digits.remove(12),
    };
  }

  digits.iter().fold(0, |acc, &d| acc * 10 + d)
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let banks: Vec<Vec<u64>> = raw_input.split("\n")
      .filter(|line| line.len() > 0)
      .map(|line| line.chars().map(|c| (c.to_digit(10).unwrap() as u64)).collect())
      .collect();

  let sum: u64 = banks.clone().into_iter().map(|bank| max_two_jolts(bank)).sum();
  println!("Max two-digit jolts is {sum}");

  let sum_twelve: u64 = banks.into_iter().map(|bank| max_twelve_jolts(bank)).sum();
  println!("Max twelve-digit jolts is {sum_twelve}");
}
