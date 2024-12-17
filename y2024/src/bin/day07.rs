use std::env;
use std::fs;

#[derive(Debug)]
struct Equation {
    result: u64,
    inputs: Vec<u64>,
}

#[derive(Debug)]
enum Operator {
    Mul,
    Add,
    Concat,
}

fn concat_op(a: u64, b: u64) -> u64 {
    format!("{a}{b}").parse().expect("Concat parse failed")
}

fn num_to_operators(num: u64, count: u64) -> Vec<Operator> {
    (0..count).map(|bit| match num & (1 << bit) {
            0 => Operator::Add,
            _ => Operator::Mul,
        }).collect()
}

fn num_to_operators2(num: u64, count: u64) -> Vec<Operator> {
    (0..count).map(|bit| match num / (3u64.pow(bit as u32)) % 3 {
            0 => Operator::Add,
            1 => Operator::Mul,
            _ => Operator::Concat,
        }).collect()
}

fn can_satisfy(equation: &Equation) -> bool {
    let operator_list_len: u64 = (equation.inputs.len() - 1) as u64;
    let count = (2u64).pow(operator_list_len as u32);
    for i in 0..count {
        if satisfies(equation, &num_to_operators(i, operator_list_len)[..]) {
            return true
        }
    }
    false
}

fn can_satisfy2(equation: &Equation) -> bool {
    let operator_list_len: u64 = (equation.inputs.len() - 1) as u64;
    let count = (3u64).pow(operator_list_len as u32);
    for i in 0..count {
        if satisfies(equation, &num_to_operators2(i, operator_list_len)[..]) {
            return true
        }
    }
    false
}

fn satisfies(equation: &Equation, operators: &[Operator]) -> bool {
    let mut acc = equation.inputs[0];
    for i in 0..operators.len() {
        acc = match operators[i] {
            Operator::Mul => acc * equation.inputs[i+1],
            Operator::Add => acc + equation.inputs[i+1],
            Operator::Concat => concat_op(acc, equation.inputs[i+1]),
        };
        if acc > equation.result {
            return false
        }
    }
    acc == equation.result
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let input: Vec<Equation> = raw_input.trim().split("\n")
        .map(|line| {
            let parts: Vec<&str> = line.split(": ").collect();
            let result: u64 = parts[0].parse().expect("Parse result failed");
            let inputs: Vec<u64> = parts[1].split(" ").map(|s| s.parse().expect("Parse input failed")).collect();
            Equation { result, inputs }
        })
        .collect();

    // Part 1
    let total_calibration_result = input.iter().filter(|e| can_satisfy(e)).fold(0, |acc, el| acc + el.result);
    println!("Total calibration result: {total_calibration_result}");

    // Part 2
    let total_calibration_result2 = input.iter().filter(|e| can_satisfy2(e)).fold(0, |acc, el| acc + el.result);
    println!("Total calibration result (2): {total_calibration_result2}");
}
