use std::env;
use std::fs;
use std::collections::HashMap;

fn count_digits(stone: &usize) -> usize {
    let mut digits = 0u32;
    while *stone >= 10usize.pow(digits) {
        digits += 1;
    }
    digits as usize
}

fn split_digits(stone: &usize) -> Vec<usize> {
    let digits = count_digits(stone) as u32;
    let factor = 10usize.pow(digits / 2) as u64;
    vec![
        (*stone as u64 / factor) as usize,
        (*stone as u64 % factor) as usize,
    ]
}

#[allow(dead_code)]
fn transform(stones: &Vec<usize>) -> Vec<usize> {
    stones
        .iter()
        .flat_map(|stone| {
            if *stone == 0 {
                vec![1]
            } else if count_digits(stone) % 2 == 0 {
                split_digits(stone)
            } else {
                vec![stone * 2024]
            }
        })
        .collect()
}

#[allow(dead_code)]
fn transform_n(stones: &Vec<usize>, n: usize) -> Vec<usize> {
    let mut current = stones.clone();
    for _ in 0..n {
        current = transform(&current)
    }
    current
}

fn transform2(stones: &HashMap<usize, usize>) -> HashMap<usize, usize> {
    let mut new_stones: HashMap<usize, usize> = HashMap::new();
    for (stone, count) in stones {
        if *stone == 0 {
            *new_stones.entry(1).or_insert(0) += count;
        } else if count_digits(stone) % 2 == 0 {
            let new_digits = split_digits(stone);
            *new_stones.entry(new_digits[0]).or_insert(0) += count;
            *new_stones.entry(new_digits[1]).or_insert(0) += count;
        } else {
            *new_stones.entry(stone * 2024).or_insert(0) += count;
        }
    }
    new_stones
}

fn transform_n2(stones: &Vec<usize>, n: usize) -> HashMap<usize, usize> {
    let mut current: HashMap<usize, usize> = HashMap::new();
    for stone in stones {
        *current.entry(*stone).or_insert(0) += 1
    }

    for _ in 0..n {
        current = transform2(&current)
    }
    current
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let input: Vec<usize> = raw_input
        .trim()
        .split(" ")
        .map(|s| s.parse().expect("Failed to parse"))
        .collect();

    //println!("Initial stones: {:?}", input);

    // Part 1 was initially completed with `transform_n`, later replaced with `transform_n2`.
    for steps in [25, 75] {
        //let stones = transform_n(&input, steps);
        //println!("Stones after {} steps is {}: {:?}", steps, stones.len(), stones);
        let stones = transform_n2(&input, steps);
        let total = stones.iter().map(|(_, count)| count).fold(0, |acc, el| acc + *el);
        println!("Stones after {} steps is {:?}", steps, total);
    }
}
