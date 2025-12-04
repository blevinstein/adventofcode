
use std::env;
use std::fs;
use std::cmp::max;
use std::cmp::min;
use std::collections::HashSet;

#[derive(Debug)]
struct Range {
  start: u64,
  end: u64,
}

fn range_for_digit_count(digit_count: u32) -> Range {
  Range {
    start: 10_u64.pow(digit_count - 1),
    end: 10_u64.pow(digit_count) - 1,
  }
}

fn count_digits(n: u64) -> u32 {
    if n == 0 { return 0; }
    (n as f64).log10().floor() as u32 + 1
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
        .expect("Failed to read input");

    let input: Vec<Range> = raw_input.split(",")
        .map(|range| Range {
          start: range.trim().split("-").nth(0).unwrap().parse::<u64>().unwrap(),
          end: range.trim().split("-").nth(1).unwrap().parse::<u64>().unwrap(),
        })
        .collect();

    let even_ranges: Vec<Range> = input.iter().flat_map(|range| {
      // Find all sub-ranges which contain an even number of digits
      // E.g., input 10-9995 should produce the sub-ranges 10-99 and 1000-9995
      let start_digits = count_digits(range.start);
      let end_digits = count_digits(range.end);
      (start_digits..=end_digits).map(|digit_count| {
        let digit_range = range_for_digit_count(digit_count);
        let sub_start = max(range.start, digit_range.start);
        let sub_end = min(range.end, digit_range.end);
        Range { start: sub_start, end: sub_end }
      }).collect::<Vec<Range>>()
    }).collect();

    /*
    println!("{input:?}");
    println!("{even_ranges:?}");
    */

    let mut sum = 0;
    for range in even_ranges.iter() {
      let digits = count_digits(range.start);
      if digits % 2 == 0 {
        let half_digits = digits / 2;
        let half_range = range_for_digit_count(half_digits);
        for i in half_range.start..=half_range.end {
          let invalid_id = i + 10_u64.pow(half_digits) * i;
          if invalid_id >= range.start && invalid_id <= range.end {
              sum += invalid_id;
              //println!("Found invalid ID {invalid_id} in range {range:?}");
          }
        }
      }
    }
    println!("Sum of doubled IDs is {sum}");

    let mut invalid_ids: HashSet<u64> = HashSet::new();
    for range in even_ranges.iter() {
      let digits = count_digits(range.start);
      for repetitions in 2..=digits {
        if digits % repetitions == 0 {
          //println!("Check range {range:?} for repeats of length {repetitions}");
          let repeat_digits = digits / repetitions;
          let repeat_range = range_for_digit_count(repeat_digits);
          for i in repeat_range.start..=repeat_range.end {
            let invalid_id = (0..repetitions).map(|exp| 10_u64.pow(repeat_digits * exp) * i).sum::<u64>();
            if invalid_id >= range.start && invalid_id <= range.end {
                invalid_ids.insert(invalid_id);
                //println!("Found invalid ID {invalid_id} in range {range:?} repeated {repetitions}");
            }
          }
        }
      }
    }
    sum = invalid_ids.iter().sum();
    println!("Sum of repeated IDs is {sum}");
}
