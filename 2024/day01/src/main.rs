use regex::Regex;
use std::env;
use std::fs;
use std::collections::HashMap;

fn main() {
    let line_re = Regex::new(r"\s+").unwrap();
    let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
        .expect("Failed to read input");
    let input: Vec<Vec<u32>> = raw_input
        .split("\n")
        .filter(|line| line.len() > 0)
        .map(|line| line_re.split(line).map(|s| s.parse::<u32>().unwrap()).collect())
        .collect();
    let (mut list_a, mut list_b): (Vec<u32>, Vec<u32>) = input.into_iter().map(|nums| (nums[0], nums[1])).unzip();
    list_a.sort();
    list_b.sort();

    // Part 1
    let sum_diff: u32 = list_a.clone().into_iter().zip(list_b.clone().into_iter())
        .map(|item| item.0.abs_diff(item.1))
        .reduce(|acc, it| acc + it)
        .unwrap();
    println!("{sum_diff}");

    // Part 2
    let mut count = HashMap::new();
    for elem in list_b {
        count.insert(elem, count.get(&elem).copied().unwrap_or(0) + 1);
    }
    let sum_product: u32 = list_a.into_iter()
        .map(|elem| count.get(&elem).copied().unwrap_or(0) * elem)
        .reduce(|acc, it| acc + it).unwrap();
    println!("{sum_product}");
}
