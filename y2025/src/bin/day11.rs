
use std::env;
use std::fs;
use std::collections::HashMap;

fn count_paths(start: &str, end: &str, output_map: &HashMap<&str,Vec<&str>>) -> usize {
  if start == end {
    1
  } else {
    output_map.get(start)
        .map(|v| v.as_slice())
        .unwrap_or(&[])
        .iter()
        .map(|next| count_paths(next, end, output_map))
        .sum::<usize>()
  }
}

fn count_paths_cache(start: &str, end: &str, output_map: &HashMap<&str,Vec<&str>>) -> usize {
  let mut cache: HashMap<&str,usize> = HashMap::new();
  count_paths_helper(start, end, output_map, &mut cache)
}

fn count_paths_helper<'a>(
    start: &'a str,
    end: &str,
    output_map: &HashMap<&'a str,Vec<&'a str>>,
    cache: &mut HashMap<&'a str,usize>) -> usize {
  if start == end {
    1
  } else if let Some(result) = cache.get(start) {
    *result
  } else {
    let result = output_map.get(start)
        .map(|v| v.as_slice())
        .unwrap_or(&[])
        .iter()
        .map(|next| count_paths_helper(next, end, output_map, cache))
        .sum::<usize>();
    cache.insert(start, result);
    result
  }
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let output_map: HashMap<&str,Vec<&str>> = raw_input.trim().split("\n")
      .map(|line| {
        let Some((input, outputs)) = line.split_once(": ") else { panic!("Failed to split line"); };
        (
          input,
          outputs.split(" ").collect()
        )
      })
      .collect();

  // Part 1
  println!("There are {} paths from `you` to `out`", count_paths("you", "out", &output_map));

  // Part 2
  let a_paths =
      count_paths_cache("svr", "fft", &output_map)
      * count_paths_cache("fft", "dac", &output_map)
      * count_paths_cache("dac", "out", &output_map);
  let b_paths =
      count_paths_cache("svr", "dac", &output_map)
      * count_paths_cache("dac", "fft", &output_map)
      * count_paths_cache("fft", "out", &output_map);
  println!("There are {} paths from `svr` to `out` which include `dac` and `fft` ({} + {})", a_paths + b_paths, a_paths, b_paths);
}
