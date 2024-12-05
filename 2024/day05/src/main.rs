use std::env;
use std::fs;
use std::collections::HashMap;
use std::collections::HashSet;

fn build_map(rules: &Vec<(u32, u32)>) -> HashMap<u32, Vec<u32>> {
    let mut map: HashMap<u32, Vec<u32>> = HashMap::new();
    for &(a, b) in rules {
        map.entry(b).or_insert_with(Vec::new).push(a);
    }
    map
}

fn is_correctly_ordered(rule_map: &HashMap<u32, Vec<u32>>, list: &[u32]) -> bool {
    let mut cannot_see: HashSet<u32> = HashSet::new();
    for item in list {
        if cannot_see.contains(item) {
            return false
        } else {
            cannot_see.extend(rule_map.get(item).unwrap_or(&vec![]))
        }
    }
    true
}

fn topo_sort(rule_map: &HashMap<u32, Vec<u32>>, list: &Vec<u32>) -> Vec<u32> {
    let mut remaining = list.clone();
    let mut result: Vec<u32> = Vec::new();
    while !remaining.is_empty() {
        'check: for (candidate_index, candidate) in remaining.clone().iter().enumerate() {
            for must_satisfy in rule_map.get(candidate).unwrap_or(&vec![]) {
                if remaining.contains(must_satisfy) {
                    continue 'check;
                }
            }
            result.push(*candidate);
            remaining.remove(candidate_index);
            break 'check;
        }
    }
    result
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");
    let sections: Vec<&str> = raw_input.split("\n\n").collect();

    // If (a,b) is in the list, a must come before b
    let rules: Vec<(u32, u32)> = sections[0].trim().split("\n")
        .map(|line| {
            let parts: Vec<u32> = line.split("|").map(|s| s.parse().unwrap()).collect();
            (parts[0], parts[1])
        })
        .collect();
    let page_lists: Vec<Vec<u32>> = sections[1].trim().split("\n")
        .map(|line| line.split(",").map(|s| s.parse().unwrap()).collect())
        .collect();

    // If b=>[a] in the map, a must come before b
    let rule_map = build_map(&rules);

    let (correctly_ordered_lists, incorrectly_ordered_lists): (Vec<Vec<u32>>, Vec<Vec<u32>>) = page_lists
        .into_iter()
        .partition(|list| is_correctly_ordered(&rule_map, list));

    // Part 1
    {
        let sum = correctly_ordered_lists
            .iter()
            .map(|list| list[(list.len() - 1) / 2])
            .reduce(|acc, el| acc + el)
            .unwrap_or(0);
        println!("{sum}");
    }

    // Part 2
    {
        let reordered_lists: Vec<Vec<u32>> = incorrectly_ordered_lists.iter().map(|list| topo_sort(&rule_map, list)).collect();
        let sum = reordered_lists
            .iter()
            .map(|list| list[(list.len() - 1) / 2])
            .reduce(|acc, el| acc + el)
            .unwrap_or(0);
        println!("{sum}");
    }
}
