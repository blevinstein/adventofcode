use std::collections::HashMap;
use std::collections::HashSet;
use rand::seq::IteratorRandom;
use rand::seq::SliceRandom;
use std::env;
use std::fs;

fn build_map(connections: &Vec<Vec<&str>>) -> HashMap<String, HashSet<String>> {
    let mut result: HashMap<String, HashSet<String>> = HashMap::new();

    for connection in connections {
        result
            .entry(connection[0].into())
            .or_insert_with(HashSet::new)
            .insert(connection[1].into());
        result
            .entry(connection[1].into())
            .or_insert_with(HashSet::new)
            .insert(connection[0].into());
    }

    result
}

fn get_largest_subgraph(connections: &HashMap<String, HashSet<String>>) -> Vec<String> {
    let iterations = 1000;

    let mut rng = rand::thread_rng();
    let mut result: Vec<String> = Vec::new();

    let all_nodes: Vec<String> = connections.keys().cloned().collect();

    for _ in 0..iterations {
        let mut subgraph = Vec::from([all_nodes.choose(&mut rng).unwrap().clone()]);
        'outer: loop {
            for i in (0..all_nodes.len()).choose_multiple(&mut rng, all_nodes.len()) {
                if subgraph.iter().all(|old_node| connections.get(old_node).unwrap().contains(&all_nodes[i])) {
                    subgraph.push(all_nodes[i].clone());
                    continue 'outer;
                }
            }
            break;
        }
        if subgraph.len() > result.len() {
            result = dbg!(subgraph);
        }
    }

    result
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let input: Vec<Vec<&str>> = raw_input
        .trim()
        .split("\n")
        .map(|line| line.split("-").collect())
        .collect();

    let graph = build_map(&input);

    println!("{} nodes in the graph", graph.keys().count());

    // Part 1
    let mut triples: Vec<(&str, &str, &str)> = Vec::new();
    for a in graph.keys() {
        for b in graph.get(a).unwrap() {
            if a <= b {
                continue;
            }
            for c in graph.get(b).unwrap() {
                if b <= c {
                    continue;
                }
                if graph.get(c).unwrap().contains(a) {
                    triples.push((a, b, c));
                }
            }
        }
    }
    println!(
        "{} triples with a t",
        triples
            .iter()
            .filter(|(a, b, c)| a.chars().nth(0).unwrap() == 't'
                || b.chars().nth(0).unwrap() == 't'
                || c.chars().nth(0).unwrap() == 't')
            .count()
    );

    // Part 2
    let mut largest_subgraph = get_largest_subgraph(&graph);
    largest_subgraph.sort_by(|a, b| a.cmp(b));
    println!("Largest subgraph is {}", largest_subgraph.join(","));
}
