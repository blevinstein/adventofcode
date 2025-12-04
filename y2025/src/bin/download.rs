use std::env;
use std::fs;
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() != 3 {
        eprintln!("Usage: {} <day> <session-cookie>", args[0]);
        process::exit(1);
    }

    let day: u8 = match args[1].parse() {
        Ok(d) if d >= 1 && d <= 12 => d,
        _ => {
            eprintln!("Error: Day must be a number between 1 and 12");
            process::exit(1);
        }
    };

    let session_cookie = &args[2];

    // Create data directory if it doesn't exist
    let data_dir = format!("data/{:02}", day);
    if let Err(e) = fs::create_dir_all(&data_dir) {
        eprintln!("Error creating directory {}: {}", data_dir, e);
        process::exit(1);
    }

    // Download the input
    let url = format!("https://adventofcode.com/2025/day/{}/input", day);
    let output_path = format!("{}/input.txt", data_dir);

    println!("Downloading day {} input to {}...", day, output_path);

    let status = process::Command::new("curl")
        .arg(&url)
        .arg("-H")
        .arg(format!("Cookie: session={}", session_cookie))
        .arg("-o")
        .arg(&output_path)
        .status();

    match status {
        Ok(status) if status.success() => {
            println!("Successfully downloaded input for day {}", day);
        }
        Ok(status) => {
            eprintln!("curl failed with status: {}", status);
            process::exit(1);
        }
        Err(e) => {
            eprintln!("Error running curl: {}", e);
            process::exit(1);
        }
    }
}
