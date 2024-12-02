
```bash
for day in {1..25}; do mkdir day$(printf "%02d" $day); curl https://adventofcode.com/2016/day/$day/input -H "Cookie: session=<session-key>" > day$(printf "%02d" $day)/input.txt; done
```
