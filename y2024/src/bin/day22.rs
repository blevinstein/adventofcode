use std::env;
use std::fs;
use std::collections::HashMap;
use std::collections::HashSet;

fn evolve(secret: usize) -> usize {
    let mut result = secret;

    result = (result ^ (result * 64)) % 16777216;

    result = (result ^ (result / 32)) % 16777216;

    result = (result ^ (result * 2048)) % 16777216;

    result
}

fn evolve_n(secret: usize, n: usize) -> usize {
    let mut result = secret;

    for _ in 0..n {
        result = evolve(result);
    }

    result
}

fn key_of(changes: [isize; 4]) -> usize {
    ((changes[0] + 10) + ((changes[1] + 10) << 5) + ((changes[2] + 10) << 10) + ((changes[3] + 10) << 15)).try_into().unwrap()
}

fn calc_score_map(secret: usize, n: usize) -> HashMap<usize, usize> {
    let mut result: HashMap<usize, usize> = HashMap::new();

    let mut current_secret = secret;
    let mut recent_changes = Vec::new();

    for _ in 0..n {
        let old_secret = current_secret;
        current_secret = evolve(current_secret);
        let change = (current_secret % 10) as isize - (old_secret % 10) as isize;
        recent_changes.push(change);
        if recent_changes.len() > 4 {
            recent_changes.remove(0);
        }
        if recent_changes.len() == 4 {
            let key = key_of(recent_changes.clone().try_into().unwrap());
            result.entry(key).or_insert(current_secret % 10);
        }
    }

    result
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let initial_secrets: Vec<usize> = raw_input
        .trim()
        .split("\n")
        .map(|s| s.parse().unwrap())
        .collect();

    // Part 1
    let final_secrets: Vec<usize> = initial_secrets.iter().map(|secret| evolve_n(*secret, 2000)).collect();
    let sum = final_secrets.iter().fold(0, |acc, el| acc + *el);
    println!("Sum of final secrets is {}", sum);

    // Part 2
    let score_maps: Vec<_> = initial_secrets.iter().map(|sec| calc_score_map(*sec, 2000)).collect();
    println!("Calculated score maps");
    let possible_keys: Vec<usize> = score_maps.iter().flat_map(|score_map| score_map.keys().copied()).collect::<HashSet<_>>().into_iter().collect();
    println!("Fetched possible keys ({})", possible_keys.len());

    let mut best_key = possible_keys[0];
    let mut best_score = score_maps.iter().map(|score_map| score_map.get(&possible_keys[0]).unwrap_or(&0)).fold(0, |acc, el| acc + *el);
    let mut counter = 0;
    for possible_key in &possible_keys[1..] {
        counter += 1;
        if counter % 1_000 == 0 {
            //println!("Checking key {}/{}", counter, possible_keys.len());
        }

        let score = score_maps.iter().map(|score_map| score_map.get(possible_key).unwrap_or(&0)).fold(0, |acc, el| acc + *el);
        if score > best_score {
            best_score = score;
            best_key = *possible_key;
        }
    }
    println!("Best score is {best_score} using key {best_key:?}");
}
