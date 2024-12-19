use std::collections::HashMap;
use std::env;
use std::fs;

fn can_make<'a>(
    cache: &mut HashMap<&'a str, bool>,
    towels: &'a Vec<&'a str>,
    design: &'a str,
) -> bool {
    if design.is_empty() {
        return true
    }
    if let Some(&cached_result) = cache.get(&design) {
        return cached_result;
    }
    let result = towels.iter().cloned().any(|towel| {
        let portion = towel.len();
        portion <= design.len()
            && *towel == design[..portion]
            && can_make(cache, towels, &design[portion..])
    });
    //dbg!(&(design, result));
    cache.insert(design, result);
    result
}

fn ways<'a>(
    cache: &mut HashMap<&'a str, usize>,
    towels: &'a Vec<&'a str>,
    design: &'a str,
) -> usize {
    if design.is_empty() {
        return 1
    }
    if let Some(&cached_result) = cache.get(&design) {
        return cached_result;
    }
    let result = towels.iter().cloned().map(|towel| {
        let portion = towel.len();
        if portion > design.len() || *towel != design[..portion] {
            return 0
        }
        ways(cache, towels, &design[portion..])
    }).fold(0, |acc, el| acc + el);
    //dbg!(&(design, result));
    cache.insert(design, result);
    result
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");
    let sections: Vec<&str> = raw_input.trim().split("\n\n").collect();
    let towels: Vec<&str> = sections[0].split(", ").collect();
    let designs: Vec<&str> = sections[1].split("\n").collect();

    // Part 1
    let mut cache: HashMap<&str, bool> = HashMap::new();
    let possible = designs.iter().filter(|&d| can_make(&mut cache, &towels, &d)).count();
    println!(
        "It is possible to make {} out of {} designs",
        possible,
        designs.len()
    );

    // Part 2
    let mut cache: HashMap<&str, usize> = HashMap::new();
    let total_ways = designs.iter().map(|&d| ways(&mut cache, &towels, &d)).fold(0, |acc, el| acc + el);
    println!("There are {total_ways} total ways to make these designs");
}
