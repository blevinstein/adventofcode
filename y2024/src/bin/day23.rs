use std::collections::HashMap;
use std::collections::HashSet;
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

/*
fn get_largest_subgraph(connections: &HashMap<String, HashSet<String>>) -> usize {
    let mut result: usize = 0;

    for start_node in connections {
        let mut stack: Vec<Vec<&str>> = vec![vec![*start_node]];
        while !stack.is_empty() {
            let current = stack.pop();
            if current.len() > result {
                result = current.len()
            }
            let next_options = connections.get(current[0]).filter(|option| {
                current
                    .iter()
                    .all(|current_node| connections.get(current_node).unwrap().contains(option))
            });
            for next in next_options {
                let new_path = current.clone();
                new_path.push(next);
                stack.push(new_path);
            }
        }
    }

    result
}
*/

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
    //let largest_subgraph = get_largest_subgraph(&graph);
}
