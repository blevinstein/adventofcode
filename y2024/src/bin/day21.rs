use once_cell::sync::Lazy;
use regex::Regex;
use std::env;
use std::fs;
use std::collections::HashMap;

static NUM_KEYPAD_PATHS: Lazy<HashMap<char, HashMap<char, &str>>> = Lazy::new(|| {
    HashMap::from([
        ('0', HashMap::from([('0', "A"), ('1', "^<A"), ('2', "^A"), ('3', "^>A"), ('4', "^^<A"), ('5', "^^A"), ('6', "^^>A"), ('7', "^^^<A"), ('8', "^^^A"), ('9', "^^^>A"), ('A', ">A")])),
        ('1', HashMap::from([('0', ">vA"), ('1', "A"), ('2', ">A"), ('3', ">>A"), ('4', "^A"), ('5', "^>A"), ('6', "^>>A"), ('7', "^^A"), ('8', "^^>A"), ('9', "^^>>A"), ('A', ">>vA")])),
        ('2', HashMap::from([('0', "vA"), ('1', "<A"), ('2', "A"), ('3', ">A"), ('4', "<^A"), ('5', "^A"), ('6', "^>A"), ('7', "<^^A"), ('8', "^^A"), ('9', "^^>A"), ('A', ">vA")])),
        ('3', HashMap::from([('0', "<vA"), ('1', "<<A"), ('2', "<A"), ('3', "A"), ('4', "<<^A"), ('5', "<^A"), ('6', "^A"), ('7', "<<^^A"), ('8', "<^^A"), ('9', "^^A"), ('A', "vA")])),
        ('4', HashMap::from([('0', ">vvA"), ('1', "vA"), ('2', "v>A"), ('3', ">>vA"), ('4', "A"), ('5', ">A"), ('6', ">>A"), ('7', "^A"), ('8', "^>A"), ('9', "^>>A"), ('A', ">>vvA")])),
        ('5', HashMap::from([('0', "vvA"), ('1', "<vA"), ('2', "vA"), ('3', ">vA"), ('4', "<A"), ('5', "A"), ('6', ">A"), ('7', "<^A"), ('8', "^A"), ('9', "^>A"), ('A', ">vvA")])),
        ('6', HashMap::from([('0', "<vvA"), ('1', "<<vA"), ('2', "<vA"), ('3', "vA"), ('4', "<<A"), ('5', "<A"), ('6', "A"), ('7', "<<^A"), ('8', "<^A"), ('9', "^A"), ('A', "vvA")])),
        ('7', HashMap::from([('0', ">vvvA"), ('1', "vvA"), ('2', ">vvA"), ('3', ">>vvA"), ('4', "vA"), ('5', "v>A"), ('6', "v>>A"), ('7', "A"), ('8', ">A"), ('9', ">>A"), ('A', ">>vvvA")])),
        ('8', HashMap::from([('0', "vvvA"), ('1', "<vvA"), ('2', "vvA"), ('3', ">vvA"), ('4', "<vA"), ('5', "vA"), ('6', "v>A"), ('7', "<A"), ('8', "A"), ('9', ">A"), ('A', ">vvvA")])),
        ('9', HashMap::from([('0', "<vvvA"), ('1', "<<vvA"), ('2', "<vvA"), ('3', "vvA"), ('4', "<<vA"), ('5', "<vA"), ('6', "vA"), ('7', "<<A"), ('8', "<A"), ('9', "A"), ('A', "vvvA")])),
        ('A', HashMap::from([('0', "<A"), ('1', "^<<A"), ('2', "<^A"), ('3', "^A"), ('4', "^^<<A"), ('5', "<^^A"), ('6', "^^A"), ('7', "^^^<<A"), ('8', "<^^^A"), ('9', "^^^A"), ('A', "A")])),
    ])
});

static DIR_KEYPAD_PATHS: Lazy<HashMap<char, HashMap<char, &str>>> = Lazy::new(|| {
    HashMap::from([
        ('A', HashMap::from([('^', "<A"), ('<', "v<<A"), ('v', "v<A"), ('>', "vA"), ('A', "A")])),
        ('^', HashMap::from([('^', "A"), ('<', "v<A"), ('v', "vA"), ('>', "v>A"), ('A', ">A")])),
        ('<', HashMap::from([('^', ">^A"), ('<', "A"), ('v', ">A"), ('>', ">>A"), ('A', ">>^A")])),
        ('v', HashMap::from([('^', "^A"), ('<', "<A"), ('v', "A"), ('>', ">A"), ('A', ">^A")])),
        ('>', HashMap::from([('^', "<^A"), ('<', "<<A"), ('v', "<A"), ('>', "A"), ('A', "^A")])),
    ])
});

// Given a keypad and a code to type, expand the code into directions
fn expand(keypad: &HashMap<char,HashMap<char,&str>>, code: &str) -> String {
    let mut result = String::new();
    let mut last_character = 'A';

    for c in code.chars() {
        result.push_str(&keypad[&last_character][&c]);
        last_character = c;
    }

    result
}

fn expand_three(code: &str) -> String {
    let a = dbg!(expand(&*NUM_KEYPAD_PATHS, &code));
    let b = dbg!(expand(&*DIR_KEYPAD_PATHS, &a));
    let c = dbg!(expand(&*DIR_KEYPAD_PATHS, &b));
    c
}

fn expand_more(code: &str) -> String {
    // TODO: Instead of keeping result in string form, maintain a HashMap<String, usize> where each
    // (key, value) indicates that `key` (a two-character sequence) occurs `value` times. Then,
    // expand using the same rules, while ignoring the length of the sequences. This allows
    // parallellization and memory efficiency in the computation.
    let mut result = expand(&*NUM_KEYPAD_PATHS, &code);

    for step in 0..25 {
        result = expand(&*DIR_KEYPAD_PATHS, &result);
        println!("Code {code} step {step} length {}", result.len());
    }

    result
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let codes: Vec<&str> = raw_input.trim().split("\n").collect();

    let number_re = Regex::new(r"\d+").unwrap();

    // Part 1
    {
        let complexity = |code| {
            number_re
                .find(code)
                .unwrap()
                .as_str()
                .parse::<usize>()
                .unwrap()
                * expand_three(code).len()
        };
        let sum = codes.iter().map(|code| complexity(code)).reduce(|acc, el| acc + el).unwrap();
        println!("Sum of complexity is {sum}");
    }

    // Part 2
    {
        let complexity = |code| {
            number_re
                .find(code)
                .unwrap()
                .as_str()
                .parse::<usize>()
                .unwrap()
                * expand_more(code).len()
        };
        let sum = codes.iter().map(|code| complexity(code)).reduce(|acc, el| acc + el).unwrap();
        println!("Sum of complexity is {sum}");
    }
}
