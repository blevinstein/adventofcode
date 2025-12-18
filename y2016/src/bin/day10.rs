
use std::env;
use std::fs;
use regex::Regex;
use std::collections::HashMap;
use std::cmp::{min,max};

#[derive(Debug)]
struct Value {
  value: usize,
  bot: usize,
}

#[derive(Debug)]
enum DestType {
  Output,
  Bot,
}

impl DestType {
  fn parse(s: &str) -> DestType {
    match s {
      "output" => DestType::Output,
      "bot" => DestType::Bot,
      _ => panic!("Invalid destination type"),
    }
  }
}

#[derive(Debug)]
struct Compare {
  low_type: DestType,
  low_num: usize,
  high_type: DestType,
  high_num: usize,
}

fn execute(value_instructions: &Vec<Value>, compare_instructions: &HashMap<usize, Compare>) -> HashMap<usize,usize> {
  let mut outputs: HashMap<usize,usize> = HashMap::new();
  let mut bots: HashMap<usize,Vec<usize>> = HashMap::new();

  for value_instruction in value_instructions.iter() {
    bots.entry(value_instruction.bot).or_insert(vec![]).push(value_instruction.value);
  }

  for (_bot, values) in bots.iter() {
    if values.len() > 2 {
      panic!("Too many values for a single bot");
    }
  }

  loop {
    let mut done = true;

    for (bot, values) in bots.clone().iter() {
      if values.len() == 2 {
        done = false;
        let rule = compare_instructions.get(bot).unwrap();
        let low_value = min(values[0], values[1]);
        let high_value = max(values[0], values[1]);

        if low_value == 17 && high_value == 61 {
          println!("Part 1 solution is {}", *bot);
        }

        bots.get_mut(bot).unwrap().clear();
        match rule.low_type {
          DestType::Output => { outputs.insert(rule.low_num, low_value); },
          DestType::Bot => bots.entry(rule.low_num).or_insert(vec![]).push(low_value),
        }
        match rule.high_type {
          DestType::Output => { outputs.insert(rule.high_num, high_value); },
          DestType::Bot => bots.entry(rule.high_num).or_insert(vec![]).push(high_value),
        }
      }
    }

    if done {
      break
    }
  }

  outputs
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let value_re = Regex::new(r"value (\d+) goes to bot (\d+)").unwrap();
  let compare_re = Regex::new(r"bot (\d+) gives low to (\w+) (\d+) and high to (\w+) (\d+)").unwrap();

  let value_instructions: Vec<Value> = raw_input.trim().split("\n")
      .filter_map(|line| if let Some(captures) = value_re.captures(line) {
        let value = captures[1].parse::<usize>().unwrap();
        let bot = captures[2].parse::<usize>().unwrap();
        Some(Value { value, bot })
      } else {
        None
      })
      .collect();

  let compare_instructions: HashMap<usize, Compare> = raw_input.trim().split("\n")
      .filter_map(|line| if let Some(captures) = compare_re.captures(line) {
        let bot = captures[1].parse::<usize>().unwrap();
        let low_type = DestType::parse(&captures[2]);
        let low_num = captures[3].parse::<usize>().unwrap();
        let high_type = DestType::parse(&captures[4]);
        let high_num = captures[5].parse::<usize>().unwrap();
        Some((bot, Compare { low_type, low_num, high_type, high_num }))
      } else {
        None
      })
      .collect();

  let outputs = execute(&value_instructions, &compare_instructions);

  println!("Part 2 solution is {}", outputs.get(&0).unwrap() * outputs.get(&1).unwrap() * outputs.get(&2).unwrap());
}
