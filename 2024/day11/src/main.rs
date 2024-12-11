use std::env;
use std::fs;

fn count_digits(stone: &usize) -> usize {
    let mut digits = 0u32;
    while *stone >= 10usize.pow(digits) {
        digits += 1;
    }
    digits as usize
}

fn split_digits(stone: &usize) -> Vec<usize> {
    let digits = count_digits(stone) as u32;
    let factor = 10usize.pow(digits / 2) as u32;
    vec![
        (*stone as u32 / factor) as usize,
        (*stone as u32 % factor) as usize,
    ]
}

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

fn transform_n(stones: &Vec<usize>, n: usize) -> Vec<usize> {
    let mut current = stones.clone();
    for _ in 0..n {
        current = transform(&current)
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

    println!("Initial stones: {:?}", input);

    for steps in [1, 5, 25] {
        let stones = transform_n(&input, steps);
        println!("Stones after {} steps is {}: {:?}", steps, stones.len(), stones.iter().take(10).collect::<Vec<&usize>>());
    }
}
