use regex::Regex;
use std::env;
use std::fs;
use std::collections::HashMap;

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
        .expect("Failed to read input");
    println!("{raw_input}");
}
