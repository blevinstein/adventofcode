import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.List;
import java.util.stream.Collectors;

public final class Lumber {
  public enum State {
    CLEAR,
    LUMBERYARD,
    TREES,
  }

  public static void main(String[] args) throws Exception {
    List<String> lines = new BufferedReader(new FileReader(new File("input.txt"))).lines()
        .collect(Collectors.toList());
    int N = lines.size();

    State[][] map = new State[N][N];
    for (int y = 0; y < N; y++) {
      for (int x = 0; x < N; x++) {
        switch (lines.get(y).charAt(x)) {
          case '.':
            map[x][y] = State.CLEAR;
            break;
          case '|':
            map[x][y] = State.TREES;
            break;
          case '#':
            map[x][y] = State.LUMBERYARD;
            break;
          default:
            throw new RuntimeException("bad state");
        }
      }
    }

    //State[][] finalMap = evolve(map, 10);
    State[][] finalMap = evolve(map, 1000000000);
    show(finalMap);
    System.out.println(totalCount(finalMap, State.TREES) * totalCount(finalMap, State.LUMBERYARD));
  }

  private static State[][] evolve(State[][] map, long steps) {
    int N = map.length;
    State[][] newMap = new State[N][N];
    for (long i = 0; i < steps; i++) {
      if (i % 10000 == 0) {
        System.out.println(String.format("progress = %f", i * 1.0 / steps));
      }
      for (int x = 0; x < N; x++) {
        for (int y = 0; y < N; y++) {
          switch(map[x][y]) {
            case CLEAR:
              newMap[x][y] = neighborCount(map, x, y, State.TREES) >= 3 ? State.TREES : State.CLEAR;
              break;
            case TREES:
              newMap[x][y] = neighborCount(map, x, y, State.LUMBERYARD) >= 3 ? State.LUMBERYARD : State.TREES;
              break;
            case LUMBERYARD:
              newMap[x][y] = neighborCount(map, x, y, State.LUMBERYARD) >= 1
                && neighborCount(map, x, y, State.TREES) >= 1 ? State.LUMBERYARD : State.CLEAR;
              break;
            default:
              throw new RuntimeException("bad state");
          }
        }
      }
      // Swap and re-use previous array
      State[][] t = map;
      map = newMap;
      newMap = t;
    }
    return map;
  }

  private static int[][] neighbors(int x, int y) {
    return new int[][]{{x, y+1},
                       {x, y-1},
                       {x+1, y},
                       {x-1, y},
                       {x+1, y+1},
                       {x+1, y-1},
                       {x-1, y+1},
                       {x-1, y-1}};
  }

  private static int neighborCount(State[][] map, int x, int y, State state) {
    int count = 0;
    int N = map.length;
    for (int[] coord : neighbors(x, y)) {
      if (coord[0] >= 0 && coord[0] < N && coord[1] >= 0 && coord[1] < N && map[coord[0]][coord[1]] == state) {
        count += 1;
      }
    }
    return count;
  }

  private static int totalCount(State[][] map, State state) {
    int N = map.length;
    int count = 0;
    for (int x = 0; x < N; x++) {
      for (int y = 0; y < N; y++) {
        if (map[x][y] == state) {
          count += 1;
        }
      }
    }
    return count;
  }

  private static void show(State[][] map) {
    int N = map.length;

    for (int y = 0; y < N; y++) {
      for (int x = 0; x < N; x++) {
        switch (map[x][y]) {
          case CLEAR:
            System.out.print('.');
            break;
          case TREES:
            System.out.print('|');
            break;
          case LUMBERYARD:
            System.out.print('#');
            break;
          default:
            throw new RuntimeException("bad state");
        }
      }
      System.out.println();
    }
  }
}
