use regex::Regex;
use std::env;
use std::fs;

#[derive(Debug,Clone)]
enum Instruction {
    Mul(u32, u32),
    Do,
    Dont,
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input")).expect("Failed to read input");
    let input = raw_input.trim();

    // Part 1
    let mul_re = Regex::new(r"mul\((\d+)\,(\d+)\)").unwrap();
    let valid_instructions: Vec<(u32,u32)> = mul_re
        .captures_iter(input)
        .map(|instruction| {
            (
                instruction.get(1).expect("Capture failed").as_str().parse().expect("Parse failed"),
                instruction.get(2).expect("Capture failed").as_str().parse().expect("Parse failed"),
            )
        })
        .collect();
    let sum: u32 = valid_instructions.iter().map(|(a, b)| a * b).reduce(|acc, el| acc + el).expect("Sum failed");
    dbg!(sum);

    // Part 2
    let cmd_re = Regex::new(r"(mul|do|don't)\((?:(\d+)\,(\d+))?\)").unwrap();
    let valid_instructions: Vec<Instruction> = cmd_re
        .captures_iter(input)
        .flat_map(|instruction| {
            match instruction.get(1).expect("Capture failed").as_str() {
                "do" => vec![Instruction::Do],
                "don't" => vec![Instruction::Dont],
                "mul" => vec![Instruction::Mul(
                    instruction.get(2).expect("Capture failed").as_str().parse().expect("Parse failed"),
                    instruction.get(3).expect("Capture failed").as_str().parse().expect("Parse failed"),
                )],
                _ => vec![],
            }
        })
        .collect();
    let (_enabled, sum): (bool, u32) = valid_instructions.iter()
        .fold((true, 0), |(enabled, acc), cmd| match cmd {
            Instruction::Do => (true, acc),
            Instruction::Dont => (false, acc),
            Instruction::Mul(a, b) => (enabled, if enabled { acc + a * b } else { acc }),
        });
    dbg!(sum);
}
