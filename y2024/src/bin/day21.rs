use once_cell::sync::Lazy;
use regex::Regex;
use std::env;
use std::fs;
use std::collections::HashMap;

type ExpandMap<'a> = HashMap<char, HashMap<char, &'a str>>;
type FrequencyMap = HashMap<String, usize>;

static NUM_KEYPAD_PATHS: Lazy<ExpandMap> = Lazy::new(|| {
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

static DIR_KEYPAD_PATHS: Lazy<ExpandMap> = Lazy::new(|| {
    HashMap::from([
        ('A', HashMap::from([('^', "<A"), ('<', "v<<A"), ('v', "v<A"), ('>', "vA"), ('A', "A")])),
        ('^', HashMap::from([('^', "A"), ('<', "v<A"), ('v', "vA"), ('>', "v>A"), ('A', ">A")])),
        ('<', HashMap::from([('^', ">^A"), ('<', "A"), ('v', ">A"), ('>', ">>A"), ('A', ">>^A")])),
        ('v', HashMap::from([('^', "^A"), ('<', "<A"), ('v', "A"), ('>', ">A"), ('A', ">^A")])),
        ('>', HashMap::from([('^', "<^A"), ('<', "<<A"), ('v', "<A"), ('>', "A"), ('A', "^A")])),
    ])
});

// Given a keypad and a code to type, expand the code into directions
fn expand(keypad: &ExpandMap, code: &str) -> String {
    let mut result = String::new();
    let mut last_character = 'A';

    for c in code.chars() {
        result.push_str(&keypad[&last_character][&c]);
        last_character = c;
    }

    result
}

fn expand_freq(keypad: &ExpandMap, freq: &FrequencyMap) -> FrequencyMap {
    let mut result: FrequencyMap = HashMap::new();

    for (pair, count) in freq {
        let replacement_substring = keypad[&pair.chars().nth(0).unwrap()][&pair.chars().nth(1).unwrap()];
        let replacement_freq = freq_of(&format!("A{replacement_substring}"));
        for (new_pair, new_count) in replacement_freq {
            *result.entry(new_pair).or_insert(0) += count * new_count;
        }
    }

    result
}

fn length_of(freq: &FrequencyMap) -> usize {
    freq.iter().map(|(_, value)| value).sum::<usize>()
}

fn expand_three(code: &str) -> usize {

    let a = expand_freq(&*NUM_KEYPAD_PATHS, &freq_of(&format!("A{code}")));
    let b = expand_freq(&*DIR_KEYPAD_PATHS, &a);
    let c = expand_freq(&*DIR_KEYPAD_PATHS, &b);
    length_of(&c)
}

fn expand_three_old(code: &str) -> String {
    let a = dbg!(expand(&*NUM_KEYPAD_PATHS, &code));
    let b = dbg!(expand(&*DIR_KEYPAD_PATHS, &a));
    dbg!(expand(&*DIR_KEYPAD_PATHS, &b))
}

fn freq_of(code: &str) -> FrequencyMap {
    let mut result: FrequencyMap = HashMap::new();

    for i in 0..(code.len() - 1) {
        *result.entry(code[i..i+2].to_string()).or_insert(0) += 1
    }

    result
}

fn expand_more(code: &str) -> usize {
    let mut freq = expand_freq(&*NUM_KEYPAD_PATHS, &freq_of(&format!("A{code}")));

    for step in 0..25 {
        freq = expand_freq(&*DIR_KEYPAD_PATHS, &freq);
        println!("Code {code} step {step} length {}", length_of(&freq));
    }

    length_of(&freq)
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
                * expand_three(code)
        };
        let sum = codes.iter().map(|code| dbg!(complexity(code))).reduce(|acc, el| acc + el).unwrap();
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
                * expand_more(code)
        };
        let sum = codes.iter().map(|code| complexity(code)).reduce(|acc, el| acc + el).unwrap();
        println!("Sum of complexity is {sum}");
    }
}
