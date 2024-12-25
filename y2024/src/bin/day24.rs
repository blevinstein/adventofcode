use rand::Rng;
use regex::Regex;
use std::collections::HashMap;
use std::env;
use std::fs;

#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone)]
enum Op {
    And,
    Xor,
    Or,
}

impl Op {
    fn parse(s: &str) -> Op {
        match s {
            "AND" => Op::And,
            "XOR" => Op::Xor,
            "OR" => Op::Or,
            _ => panic!("Unexpected input"),
        }
    }

    fn eval(&self, a: bool, b: bool) -> bool {
        match self {
            Op::And => a && b,
            Op::Xor => a ^ b,
            Op::Or => a || b,
        }
    }
}

#[derive(Debug, Eq, PartialEq, Hash, Clone)]
struct Gate {
    operands: (String, String),
    op: Op,
    out: String,
}

fn simulate<'a>(inputs: &HashMap<String, bool>, gates: &'a Vec<Gate>) -> Option<HashMap<String, bool>> {
    let mut result = inputs.clone();
    let mut remaining_gates = gates.clone();
    'outer: while !remaining_gates.is_empty() {
        for g in 0..remaining_gates.len() {
            if result.contains_key(&remaining_gates[g].operands.0)
                && result.contains_key(&remaining_gates[g].operands.1)
            {
                result.insert(
                    remaining_gates[g].out.as_str().to_string(),
                    remaining_gates[g].op.eval(
                        *result.get(&remaining_gates[g].operands.0).unwrap(),
                        *result.get(&remaining_gates[g].operands.1).unwrap(),
                    ),
                );
                remaining_gates.remove(g);
                continue 'outer;
            }
        }
        return None
    }

    Some(result)
}

fn to_bits(number: usize) -> Vec<bool> {
    (0..45).map(|i| number >> i & 1 > 0).collect()
}

fn count_bits(number: usize) -> usize {
    let mut current = number;
    let mut bits = 0;

    while current > 0 {
        bits += 1;
        current = current & (current - 1);
    }

    bits
}

const MASK: usize = 0x1FFFFFFFFFFF;
//const MASK: usize = 0xF;
fn find_errors(gates: &Vec<Gate>, times: usize) -> usize {
    let mut error_mask = 0;
    for _ in 0..times {
        let x: usize = rand::thread_rng().gen::<usize>() & MASK;
        let y: usize = rand::thread_rng().gen::<usize>() & MASK;
        let x_inputs: Vec<(String, bool)> = to_bits(x).iter().enumerate().map(|(i, b)| (format!("x{:02}", i), *b)).collect();
        let y_inputs: Vec<(String, bool)> = to_bits(y).iter().enumerate().map(|(i, b)| (format!("y{:02}", i), *b)).collect();
        let inputs: HashMap<String, bool> = x_inputs.iter().chain(y_inputs.iter()).cloned().collect();
        let final_state = simulate(&inputs, &gates);
        if final_state.is_none() {
            return usize::MAX;
        }
        let z = get_number(&final_state.unwrap(), 'z');
        error_mask |= z ^ (x + y);
    }
    error_mask
}

fn get_number(state: &HashMap<String, bool>, prefix: char) -> usize {
    let mut bits: Vec<(String, bool)> = state
        .iter()
        .filter(|(key, _value)| key.chars().nth(0).unwrap() == prefix)
        .map(|(key, value)| (key.clone(), *value))
        .collect();
    bits.sort_by(|a, b| a.0.cmp(&b.0));
    bits.iter().enumerate().map(|(i, (_k, v))| if *v { 1 } else { 0 } << i).sum()
}

fn swap(gates: &Vec<Gate>, a: &str, b: &str) -> Vec<Gate> {
    gates.iter().map(|gate| if gate.out == *a {
        Gate {
            out: b.to_string(),
            ..gate.clone()
        }
    } else if gate.out == *b {
        Gate {
            out: a.to_string(),
            ..gate.clone()
        }
    } else {
        gate.clone()
    }).collect()
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let (input_section, gate_section) = raw_input.trim().split_once("\n\n").unwrap();
    let inputs: HashMap<String, bool> = input_section
        .split("\n")
        .map(|line| {
            let (id, num_str) = line.split_once(": ").unwrap();
            (id.to_string(), num_str == "1")
        })
        .collect();

    let line_re = Regex::new(r"(\w+) (\w+) (\w+) -> (\w+)").unwrap();
    let gates: Vec<Gate> = gate_section
        .split("\n")
        .map(|line| {
            let captures = line_re.captures(&line).expect("Regex parsing failed");
            Gate {
                operands: (
                    captures.get(1).unwrap().as_str().to_string(),
                    captures.get(3).unwrap().as_str().to_string(),
                ),
                op: Op::parse(captures.get(2).unwrap().as_str()),
                out: captures.get(4).unwrap().as_str().to_string(),
            }
        })
        .collect();

    // Part 1
    let final_state = simulate(&inputs, &gates).unwrap();
    let z = get_number(&final_state, 'z');
    println!("z is {z}");

    // Part 2
    let mut modified_gates = gates.clone();
    let mut swapped: Vec<String> = Vec::new();

    let times = 10;

    /*
     * TODO:
     * - Look for errors in circuits which are connected to the particular bits with output errors
     */

    loop {
        let error_mask = find_errors(&modified_gates, times);
        if error_mask == 0 { break; }

        let error_outputs: Vec<String> = to_bits(error_mask).iter().enumerate()
            .filter(|(i, b)| **b)
            .map(|(i, b)| format!("z{:02}", i))
            .collect();
        dbg!(error_outputs);

        /*
        for i in 0..modified_gates.len() {
            if i % 10 == 0 {
                println!("Gate {}/{}... (best_errors={})", i, modified_gates.len(), best_errors);
            }
            if swapped.contains(&modified_gates[i].out) { continue; }
            for j in 0.. modified_gates.len() {
                if i <= j { continue; }
                if swapped.contains(&modified_gates[j].out) { continue; }

                let swapped_gates = swap(&modified_gates, &modified_gates[i].out, &modified_gates[j].out);
                let swapped_errors = count_errors(&swapped_gates, times);
                if swapped_errors < best_errors {
                    best_errors = swapped_errors;
                    best_swap = (i, j);
                }
            }
        }
        */

        println!("Mask: {error_mask:#016x}");
        break;
    }
    swapped.sort();
    println!("Sorted swapped list is {}", swapped.join(","));
}
