
use std::env;
use std::fs;
use std::cmp::min;
use std::cmp::max;

#[derive(Debug,Copy,Clone)]
struct Range {
  start: usize,
  end: usize,
}

impl Range {
  pub fn contains(&self, value: &usize) -> bool {
    self.start <= *value && *value <= self.end
  }

  pub fn overlaps(&self, other: &Range) -> bool {
    self.start <= other.end && other.start <= self.end
  }

  pub fn merge(&self, other: &Range) -> Range {
    Range {
      start: min(self.start, other.start),
      end: max(self.end, other.end),
    }
  }

  pub fn size(&self) -> usize {
    self.end - self.start + 1
  }
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let parts: Vec<&str> = raw_input.trim().split("\n\n").collect();

  let ranges: Vec<Range> = parts.iter().nth(0).unwrap().split("\n")
      .map(|line| {
        let mut nums = line.split("-").map(|num| num.parse::<usize>().unwrap());
        Range {
          start: nums.next().unwrap(),
          end: nums.next().unwrap(),
        }
      })
      .collect();

  let ingredients: Vec<usize> = parts.iter().nth(1).unwrap().split("\n")
      .map(|line| line.parse::<usize>().unwrap())
      .collect();

  let fresh_count = ingredients.iter()
      .filter(|ingredient| ranges.iter().find(|&range| range.contains(ingredient)).is_some())
      .count();

  println!("There are {fresh_count} fresh ingredients");

  let mut distinct_ranges: Vec<Range> = vec![];

  println!("Processing {} input ranges", ranges.len());

  for range in ranges {
    let overlap_ranges: Vec<Range>;
    (overlap_ranges, distinct_ranges) = distinct_ranges
        .iter()
        .partition(|distinct_range| distinct_range.overlaps(&range));
    //println!("{range:?} overlaps {overlap_ranges:?}");
    if overlap_ranges.len() == 0 {
      // If there are no overlaps, add the new distinct_ranges entry
      distinct_ranges.push(range);
    } else {
      // Else, merge all overlapping ranges together
      let new_range = overlap_ranges.iter().fold(range, |acc, el| acc.merge(&el));
      distinct_ranges.push(new_range);
    }
  }

  println!("Merged into {} output ranges", distinct_ranges.len());

  println!("Total fresh ingredients possible is {}", distinct_ranges.iter().map(|range| range.size()).sum::<usize>());
}
