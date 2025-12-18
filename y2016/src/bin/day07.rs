
use std::env;
use std::fs;
use regex::Regex;

fn is_abba(slice: &[u8]) -> bool {
  slice[0] != slice[1]
      && slice[0] == slice[3]
      && slice[1] == slice[2]
}

fn is_bab(slice: &[u8]) -> bool {
  slice[0] != slice[1] && slice[0] == slice[2]
}

fn supports_tls(sequence: &str) -> bool {
  let hypernet_re = Regex::new(r"\[[a-z]*\]").expect("Parsing regex failed");
  if hypernet_re.find_iter(sequence)
      .find(|hypernet_addr| hypernet_addr.as_str().as_bytes().windows(4).find(|window| is_abba(window)).is_some())
      .is_some() {
    false
  } else {
    sequence.as_bytes().windows(4).find(|window| is_abba(window)).is_some()
  }
}

fn supports_ssl(sequence: &str) -> bool {
  let hypernet_re = Regex::new(r"\[[a-z]*\]").expect("Parsing regex failed");
  let babs: Vec<&[u8]> = hypernet_re.find_iter(sequence)
      .flat_map(|hypernet_addr| hypernet_addr.as_str().as_bytes().windows(3)
          .filter(|window| is_bab(window))
          .collect::<Vec<&[u8]>>())
      .collect();
  let outside_sequence = hypernet_re.replace_all(sequence, "");
  outside_sequence.as_bytes().windows(3)
      .find(|window| is_bab(window) && babs.iter().find(|bab| window[0] == bab[1] && window[1] == bab[0]).is_some())
      .is_some()
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let input: Vec<&str> = raw_input.trim().split("\n").collect();

  println!("{} inputs support TLS", input.iter().filter(|seq| supports_tls(seq)).count());
  println!("{} inputs support SSL", input.iter().filter(|seq| supports_ssl(seq)).count());
}
