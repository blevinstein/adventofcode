use std::env;
use std::fs;
use std::collections::HashMap;
use regex::Regex;

#[derive(Eq, PartialEq, Hash, Clone, Copy, Debug)]
enum Op {
    Adv,
    Bxl,
    Bst,
    Jnz,
    Bxc,
    Out,
    Bdv,
    Cdv,
}

impl Op {
    fn decode(opcode: usize) -> Op {
        match opcode {
            0 => Op::Adv,
            1 => Op::Bxl,
            2 => Op::Bst,
            3 => Op::Jnz,
            4 => Op::Bxc,
            5 => Op::Out,
            6 => Op::Bdv,
            7 => Op::Cdv,
            _ => panic!("Unexpected opcode"),
        }
    }
}

#[derive(Eq, PartialEq, Hash, Clone, Copy, Debug)]
enum Operand {
    Literal(usize),
    A,
    B,
    C,
}

impl Operand {
    fn combo(code: usize) -> Operand {
        match code {
            4 => Operand::A,
            5 => Operand::B,
            6 => Operand::C,
            v => Operand::Literal(v),
        }
    }
}

#[derive(Eq, PartialEq, Hash, Clone, Debug)]
struct State {
    a: usize,
    b: usize,
    c: usize,
    instruction: usize,
    output: Vec<usize>,
    program: Vec<usize>,
}

impl State {
    fn step(&mut self) -> bool {
        if self.instruction >= self.program.len() {
            return false
        }
        let op: Op = Op::decode(self.program[self.instruction]);
        let operand: usize = self.program[self.instruction + 1];
        //println!("exec {op:?} {operand:?}/{}", self.get(&Operand::combo(operand)));
        match op {
            Op::Adv => self.a = self.a >> self.get(&Operand::combo(operand)),
            Op::Bxl => self.b = self.b ^ operand,
            Op::Bst => self.b = self.get(&Operand::combo(operand)) % 8,
            Op::Jnz => if self.a != 0 { self.instruction = operand } else { self.instruction += 2 },
            Op::Bxc => self.b = self.b ^ self.c,
            Op::Out => self.output.push(self.get(&Operand::combo(operand)) % 8),
            Op::Bdv => self.b = self.a >> self.get(&Operand::combo(operand)),
            Op::Cdv => self.c = self.a >> self.get(&Operand::combo(operand)),
        }
        if op != Op::Jnz {
            self.instruction += 2;
        }
        //println!("state is {self:?}");
        true
    }

    fn get(&self, operand: &Operand) -> usize {
        match operand {
            Operand::A => self.a,
            Operand::B => self.b,
            Operand::C => self.c,
            Operand::Literal(v) => *v,
        }
    }
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");
    let sections: Vec<&str> = raw_input.trim().split("\n\n").collect();

    let line_re = Regex::new(r"Register (\w): (\d+)").unwrap();
    let registers_raw: HashMap<&str, usize> = sections[0].split("\n")
        .map(|line| {
            let captures = line_re.captures(line).expect("Regex match failed");
            (captures.get(1).unwrap().as_str(), captures.get(2).unwrap().as_str().parse().unwrap())
        })
        .collect();

    let program_raw: Vec<usize> = sections[1].split(": ").nth(1).unwrap().split(",").map(|s| s.parse().unwrap()).collect();

    let initial_state = State {
        a: registers_raw["A"],
        b: registers_raw["B"],
        c: registers_raw["C"],
        instruction: 0,
        output: vec![],
        program: program_raw.clone(),
    };

    // Part 1
    {
        let mut state = initial_state.clone();
        while state.step() {}
        println!("Output is: {}", state.output.iter().map(|n| n.to_string())
            .fold(String::new(), |acc, el| if acc.len() > 0 { acc + "," + &el } else { acc + &el }));
    }

    // Part 2 - brute force
    /*
    let mut input = 0;
    'outer: loop {
        input += 1;
        // Setup initial state
        let mut state = initial_state.clone();
        state.a = input;

        // Run until the quine condition is violated
        while state.step() {
            if !state.output.is_empty()
                && (state.output.len() > state.program.len()
                || state.output[state.output.len() - 1] != state.program[state.output.len() - 1]) {
                continue 'outer
            }
        }
        if state.output.len() != state.program.len() {
            continue 'outer
        }

        println!("Quine condition is satisfied with input: {input}");
        break;
    }
    */

    // Part 2 - with insights
    // At each depth, all inputs in `candidates` should produce the last `depth` digits of the
    // output correctly.
    let mut candidates = vec![0];
    for depth in 0..program_raw.len() {
        let mut new_candidates: Vec<usize> = Vec::new();
        for old_candidate in candidates {
            for new_word in 0..8 {
                let new_candidate = (old_candidate << 3) ^ new_word;

                // Execute the program for a bit
                let mut state = initial_state.clone();
                state.a = new_candidate;
                while state.step() && state.output.is_empty() {}

                if !state.output.is_empty() && state.output[0] == program_raw[program_raw.len() - 1 - depth] {
                    new_candidates.push(new_candidate);
                }
            }
        }
        candidates = new_candidates;
    }
    // Verify
    for candidate in candidates {
        let mut state = initial_state.clone();
        state.a = candidate;
        while state.step() {}

        println!("Candidate {candidate} output: {:?}", state.output);
    }
}
