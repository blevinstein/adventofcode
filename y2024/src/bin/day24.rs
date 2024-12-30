use itertools::Itertools;
use rand::distributions::Distribution;
use rand::distributions::WeightedIndex;
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

const GENE_LEN: usize = 8;
//TEST: const GENE_LEN: usize = 4;

type Gene = [usize; GENE_LEN];

fn sexual_reproduction(a: &Gene, b: &Gene) -> Gene {
    let mut rng = rand::thread_rng();
    let cut = rng.gen_range(1..(a.len() - 1));
    let mut result: Gene = [0; GENE_LEN];
    result[..cut].clone_from_slice(&a[..cut]);
    result[cut..].clone_from_slice(&b[cut..]);
    result
}

fn mutate(orig: &Gene, max_index: usize) -> Gene {
    let mut rng = rand::thread_rng();
    let index = rng.gen_range(0..orig.len());
    let value = rng.gen_range(0..max_index);
    let mut result = orig.clone();
    result[index] = value;
    result
}

type Pop = Vec<Gene>;

fn rand_gene(max_index: usize) -> Gene {
    let mut rng = rand::thread_rng();
    let mut result: Gene = [0; GENE_LEN];
    for i in 0..GENE_LEN {
        result[i] = rng.gen_range(0..max_index);
    }
    result
}

fn is_valid(gene: &Gene) -> bool {
    for i in 1..GENE_LEN {
        for j in 0..i {
            if gene[i] == gene[j] {
                return false;
            }
        }
    }
    true
}

fn evolve(gates: &Vec<Gate>, pop: &Pop, max_index: usize) -> Pop {
    let mut new_pop: Pop = Vec::new();

    let mut fitness_scores: Vec<f64> = Vec::new();
    for gene in pop {
        fitness_scores.push(fitness(gates, gene, 10));
    }
    let dist = WeightedIndex::new(&fitness_scores).unwrap();
    let mut rng = rand::thread_rng();

    let max_fitness = fitness_scores
        .iter()
        .fold(0f64, |acc, el| f64::max(acc, *el));
    let max_fitness_index = fitness_scores
        .iter()
        .position(|score| *score == max_fitness)
        .unwrap();
    let avg_fitness = fitness_scores.iter().sum::<f64>() / fitness_scores.len() as f64;
    println!(
        "Evolving, fitness is max {:.4} {:?} / avg {:.4} / sample {:?}",
        max_fitness, pop[max_fitness_index], avg_fitness, pop[1]
    );
    /*
    println!("Evolving, fitness is max {:.4} {:?} / {:?}",
        max_fitness,
        pop[max_fitness_index],
        pop[max_fitness_index].map(|num| &gates[num].out));
    */

    new_pop.push(pop[max_fitness_index].clone());

    while new_pop.len() < pop.len() {
        let nonce = rand::random::<f64>();
        let mut new_gene = if nonce < 0.7 {
            sexual_reproduction(&pop[dist.sample(&mut rng)], &pop[dist.sample(&mut rng)])
        } else if nonce < 0.8 {
            pop[dist.sample(&mut rng)].clone()
        } else {
            rand_gene(max_index)
        };

        if rng.gen::<f64>() < 0.5 {
            for _ in 0..rng.gen_range(0..=3) {
                new_gene = mutate(&new_gene, max_index);
            }
        }

        if is_valid(&new_gene) {
            new_pop.push(new_gene);
        }
    }
    new_pop
}

fn simulate<'a>(
    inputs: &HashMap<String, bool>,
    gates: &'a Vec<Gate>,
) -> Option<HashMap<String, bool>> {
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
        return None;
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
//TEST: const MASK: usize = 0xF;
fn find_errors(gates: &Vec<Gate>, times: usize) -> isize {
    let mut error_count: isize = 0;
    for _ in 0..times {
        let mut rng = rand::thread_rng();
        let x: usize = rng.gen::<usize>() & MASK;
        let y: usize = rng.gen::<usize>() & MASK;
        let x_inputs: Vec<(String, bool)> = to_bits(x)
            .iter()
            .enumerate()
            .map(|(i, b)| (format!("x{:02}", i), *b))
            .collect();
        let y_inputs: Vec<(String, bool)> = to_bits(y)
            .iter()
            .enumerate()
            .map(|(i, b)| (format!("y{:02}", i), *b))
            .collect();
        let inputs: HashMap<String, bool> =
            x_inputs.iter().chain(y_inputs.iter()).cloned().collect();
        let final_state = simulate(&inputs, &gates);
        if final_state.is_none() {
            return (times * 50) as isize;
        }
        let z = get_number(&final_state.unwrap(), 'z');
        error_count += count_bits(z ^ (x + y)) as isize;
        //TEST: error_count += count_bits(z ^ (x & y)) as isize;
    }
    error_count
}

fn get_error_mask(gates: &Vec<Gate>, times: usize) -> usize {
    let mut error_mask: usize = 0;
    for _ in 0..times {
        let mut rng = rand::thread_rng();
        let x: usize = rng.gen::<usize>() & MASK;
        let y: usize = rng.gen::<usize>() & MASK;
        let x_inputs: Vec<(String, bool)> = to_bits(x)
            .iter()
            .enumerate()
            .map(|(i, b)| (format!("x{:02}", i), *b))
            .collect();
        let y_inputs: Vec<(String, bool)> = to_bits(y)
            .iter()
            .enumerate()
            .map(|(i, b)| (format!("y{:02}", i), *b))
            .collect();
        let inputs: HashMap<String, bool> =
            x_inputs.iter().chain(y_inputs.iter()).cloned().collect();
        let final_state = simulate(&inputs, &gates);
        if final_state.is_none() {
            return MASK;
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
    bits.iter()
        .enumerate()
        .map(|(i, (_k, v))| if *v { 1 } else { 0 } << i)
        .sum()
}

fn swap(gates: &Vec<Gate>, gene: &Gene) -> Vec<Gate> {
    let mut new_gates = gates.clone();

    for (i, j) in gene.iter().tuples() {
        let t = new_gates[*i].out.clone();
        new_gates[*i].out = new_gates[*j].out.clone();
        new_gates[*j].out = t;
    }

    new_gates
}

fn fitness(gates: &Vec<Gate>, gene: &Gene, times: usize) -> f64 {
    let swapped_gates = swap(&gates, &gene);
    1.5f64.powf(-1f64 * find_errors(&swapped_gates, times) as f64 / times as f64)
}

fn genetic_algorithm(gates: &Vec<Gate>, max_index: usize) -> Gene {
    const POP_SIZE: usize = 200;
    let mut pop: Pop = Vec::new();
    println!("Creating initial population...");

    // Bootstrap population, harvested from runs that terminated before success
    pop.push([82, 33, 190, 38, 178, 155, 195, 79]);
    pop.push([133, 58, 44, 162, 49, 62, 143, 163]);
    pop.push([133, 58, 148, 7, 33, 62, 163, 82]);
    pop.push([0, 38, 133, 102, 32, 127, 92, 114]);
    pop.push([102, 133, 4, 157, 71, 92, 33, 64]);
    pop.push([58, 133, 4, 157, 71, 92, 33, 64]);
    pop.push([58, 133, 4, 157, 65, 185, 33, 64]);
    pop.push([58, 133, 4, 157, 153, 163, 33, 64]);
    pop.push([190, 17, 201, 44, 38, 28, 200, 58]);
    pop.push([102, 133, 4, 157, 49, 38, 33, 64]);

    // Solution!
    pop.push([102, 133, 4, 157, 190, 38, 33, 64]);

    while pop.len() < POP_SIZE {
        let new_gene = rand_gene(max_index);
        //dbg!(&new_gene);
        if is_valid(&new_gene) {
            pop.push(new_gene);
        }
    }

    let mut step = 0;
    loop {
        // Check for solution
        if let Some(gene) = pop.iter().find(|gene| fitness(gates, gene, 30) == 1f64) {
            return *gene;
        }

        step += 1;
        if step % 1 == 0 {
            println!("Evolving generation {step}...");
        }

        // Evolve the pop
        pop = evolve(gates, &pop, max_index);
    }
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
    let success_gene = genetic_algorithm(&gates, gates.len());
    let mut outputs: Vec<&String> = success_gene.iter().map(|i| &gates[*i].out).collect();
    outputs.sort_by(|a, b| a.cmp(b));
    println!(
        "solution is {} (successful gene is {:?})",
        outputs.iter().join(","),
        &success_gene
    );
}
