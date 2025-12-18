
use std::env;
use std::fs;

fn decompress_part1(input: &str) -> String {
  let mut decompressed: Vec<char> = vec![];
  let mut i: usize = 0;

  loop {
    if i >= input.len() { break; }

    let next_char = input.chars().nth(i).unwrap();
    if next_char == '(' {
      match input[i+1..].find(')') {
        Some(dist) => {
          let j = i + dist + 1;
          let marker = &input[i+1..=j-1];
          let (chars_raw, repeats_raw) = marker.split_once("x").unwrap();
          let chars = chars_raw.parse::<usize>().unwrap();
          let repeats = repeats_raw.parse::<usize>().unwrap();
          for _ in 0..repeats {
            //println!("extend {}", &input[j+1..(j+chars+1)]);
            decompressed.extend(input[j+1..(j+chars+1)].chars());
          }
          i = j + chars + 1;
        },
        _ => panic!("Unmatched parentheses"),
      }
    } else {
      decompressed.push(next_char);
      //println!("push {next_char}");
      i += 1;
    }
  }

  decompressed.into_iter().collect()
}

fn decompress_part2(input: &str) -> usize {
  let mut decompressed_size: usize = 0;
  let mut i: usize = 0;

  loop {
    if i >= input.len() { break; }

    let next_char = input.chars().nth(i).unwrap();
    if next_char == '(' {
      match input[i+1..].find(')') {
        Some(dist) => {
          let j = i + dist + 1;
          let marker = &input[i+1..=j-1];
          let (chars_raw, repeats_raw) = marker.split_once("x").unwrap();
          let chars = chars_raw.parse::<usize>().unwrap();
          let repeats = repeats_raw.parse::<usize>().unwrap();
          decompressed_size += repeats * decompress_part2(&input[j+1..(j+chars+1)]);
          i = j + chars + 1;
        },
        _ => panic!("Unmatched parentheses"),
      }
    } else {
      decompressed_size += 1;
      //println!("push {next_char}");
      i += 1;
    }
  }

  decompressed_size
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");
  let input = raw_input.trim();

  let result_part1 = decompress_part1(&input);
  println!("Part 1 result is length {}", result_part1.len());

  let result_part2 = decompress_part2(&input);
  println!("Part 2 result is length {}", result_part2);
}
