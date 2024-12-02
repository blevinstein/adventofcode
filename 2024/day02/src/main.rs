use std::env;
use std::fs;

fn is_safe(report: &Vec<u32>) -> bool {
    let pairs = &report[..report.len()-1].iter().zip(report[1..].iter());
    pairs.clone().all(|(&a, &b)| a > b && a.abs_diff(b) <= 3)
        || pairs.clone().all(|(&a, &b)| a < b && a.abs_diff(b) <= 3)
}

fn is_damp_safe(report: &Vec<u32>) -> bool {
    if is_safe(report) { return true }
    for i in 0..report.len() {
        let damped_report: Vec<u32> = report[..i].iter().chain(report[i+1..].iter()).copied().collect();
        if is_safe(&damped_report) { return true }
    }
    false
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
        .expect("Failed to read input");
    let reports: Vec<Vec<u32>> = raw_input.split("\n")
        .filter(|line| line.len() > 0)
        .map(|line| line.split(" ").map(|num| num.parse().unwrap()).collect())
        .collect();
    let safe_count = reports.iter().filter(|rep| is_safe(rep)).count();
    println!("safe: {safe_count}");

    let damped_safe_count = reports.iter().filter(|rep| is_damp_safe(rep)).count();
    println!("damped safe: {damped_safe_count}");
}
