use std::env;
use std::fs;

#[derive(Debug,Copy,Clone)]
enum Block {
    Gap(usize),
    File(usize, usize),
}

#[derive(Debug)]
struct DiskMap {
    blocks: Vec<Block>,
    size: usize,
}

fn build_disk_map(sizes: &Vec<u8>) -> DiskMap {
    let mut blocks: Vec<Block> = vec![];
    let mut next_id: usize = 0;

    let size = sizes.iter().fold(0, |acc, el| acc + *el as usize);

    for chunk_sizes in sizes[..].chunks(2) {
        blocks.push(Block::File(chunk_sizes[0] as usize, next_id));
        next_id += 1;
        if chunk_sizes.len() > 1 {
            blocks.push(Block::Gap(chunk_sizes[1] as usize));
        }
    }

    DiskMap { blocks, size }
}

fn get_file_size(b: &Block) -> usize {
    match b {
        Block::File(file_size, _) => *file_size,
        Block::Gap(_) => panic!("Unexpected gap"),
    }
}

fn get_file_id(b: &Block) -> usize {
    match b {
        Block::File(_, file_id) => *file_id,
        Block::Gap(_) => panic!("Unexpected gap"),
    }
}

fn checksum(map: &DiskMap) -> usize {
    let mut position = 0;
    let mut result = 0;
    for block in &map.blocks {
        match block {
            Block::Gap(size) => position += size,
            Block::File(size, id) => {
                for i in 0..*size {
                    result += (position + i) * id;
                }
                position += size
            },
        }
    }
    result
}

fn defrag(map: &DiskMap) -> DiskMap {
    let mut blocks: Vec<Block> = vec![];

    // Must always be even
    let mut defrag_index = if map.blocks.len() % 2 == 0 { map.blocks.len() - 2 } else { map.blocks.len() - 1 };
    let mut defrag_partial_index = 0;

    'outer: for (index, block) in map.blocks.iter().enumerate() {
        match block {
            Block::Gap(size) => {
                let mut remaining_size = *size;
                let mut next_chunk_size = get_file_size(&map.blocks[defrag_index]) - defrag_partial_index;
                // Push whole blocks
                while remaining_size >= next_chunk_size {
                    blocks.push(Block::File(next_chunk_size, get_file_id(&map.blocks[defrag_index])));
                    remaining_size -= next_chunk_size;
                    defrag_partial_index = 0;
                    defrag_index -= 2;
                    next_chunk_size = get_file_size(&map.blocks[defrag_index]);
                    if defrag_index < index { break 'outer; }
                }
                // Push partial block
                if remaining_size > 0 {
                    blocks.push(Block::File(remaining_size, get_file_id(&map.blocks[defrag_index])));
                    defrag_partial_index += remaining_size;
                }
            },
            Block::File(size, id) => {
                if index == defrag_index {
                    blocks.push(Block::File(*size - defrag_partial_index, *id));
                    break;
                } else {
                    blocks.push(Block::File(*size, *id));
                }
            }
        }
    }

    DiskMap { blocks, size: map.size }
}

fn defrag2(map: &DiskMap) -> DiskMap {
    let mut blocks = map.blocks.clone();

    let last_file = blocks.iter().rev().find(|&b| matches!(b, Block::File(_, _))).expect("No files");
    let last_file_id = match last_file { Block::File(_, id) => *id, _ => panic!("Missing file") };

    for file_id in (0..=last_file_id).rev() {
        let block_index = blocks.iter().position(|&b| matches!(b, Block::File(_, id) if id == file_id)).expect("Missing file id");
        //println!("Found file {} at index {}", file_id, block_index);
        match blocks[block_index] {
            Block::File(file_size, id) => {
                let find_index = blocks[0..block_index]
                    .iter()
                    .position(|&b| if let Block::Gap(gap_size) = b { gap_size >= file_size } else { false });
                if let Some(new_index) = find_index {
                    let gap_size = match blocks[new_index] { Block::Gap(gap_size) => gap_size, _ => panic!("Unexpected gap") };
                    //println!("Move file {} to index {}", id, new_index);
                    blocks.splice(block_index..block_index+1, [Block::Gap(file_size)]);
                    blocks.splice(new_index..new_index+1, [
                        Block::File(file_size, id),
                        Block::Gap(gap_size - file_size),
                    ]);
                }
            },
            Block::Gap(_) => (),
        }
    }

    DiskMap { blocks, size: map.size }
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");
    let digits: Vec<u8> = raw_input
        .trim()
        .chars()
        .map(|c| c.to_string().parse().expect("Invalid digit in input"))
        .collect();

    // Part 1
    let disk_map = build_disk_map(&digits);
    {
        let defrag_map = defrag(&disk_map);
        println!("Checksum is {}", checksum(&defrag_map));
    }

    // Part 2
    {
        let defrag_map = defrag2(&disk_map);
        println!("Checksum is {}", checksum(&defrag_map));
    }
}
