
use std::env;
use std::fs;
use regex::Regex;
use std::collections::HashMap;

type Room = (String,usize,String);

fn shift(c: &char, dist: &usize) -> char {
  let small_dist = usize::try_from(*dist).unwrap();
  u8::try_from(((*c as usize - 'a' as usize + small_dist) % 26) + 'a' as usize).unwrap() as char
}

fn decode(name: &str, id: &usize) -> String {
  name.chars().map(|c| if c == '-' { ' ' } else { shift(&c, id) }).collect()
}

fn checksum(name: &str) -> String {
  let mut letter_freqs: HashMap<char, usize> = HashMap::new();

  for letter in name.chars() {
    if letter != '-' {
      *letter_freqs.entry(letter).or_insert(0) += 1
    }
  }

  let mut letter_vec: Vec<char> = letter_freqs.keys().cloned().collect();
  letter_vec.sort_by(|a, b| letter_freqs.get(&b).cmp(&letter_freqs.get(&a))
      .then(a.cmp(&b)));

  let result = letter_vec[..5].into_iter().collect();
  //println!("checksum for {name} is {result}");
  result
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let line_re = Regex::new(r"([a-z-]+)-(\d+)\[([a-z]+)\]").unwrap();

  let input: Vec<Room> = raw_input.trim().split("\n")
      .map(|line| {
        let captures = line_re.captures(line).expect("Regex match failed");
        (
          captures.get(1).unwrap().as_str().to_string(),
          captures.get(2).unwrap().as_str().to_string().parse::<usize>().unwrap(),
          captures.get(3).unwrap().as_str().to_string(),
        )
      })
      .collect();

  let real_rooms: Vec<Room> = input
      .into_iter()
      .filter(|(name, _, given_checksum)| {
        *given_checksum == checksum(&name)
      })
      .collect();

  let sum: usize = real_rooms
      .iter()
      .map(|(_, id, _)| id)
      .sum();

  println!("Sum of real IDs is {sum}");

  for (name, id, _) in real_rooms {
    let real_name = decode(&name, &id);
    println!("{real_name} ({id})");
  }
}
