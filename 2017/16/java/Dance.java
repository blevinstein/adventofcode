
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

public class Dance {
  public static void main(String[] args) throws IOException {
    List<Move> moves = Files.lines(new File("../input").toPath())
        .flatMap((list) -> Arrays.stream(list.split(",")))
        .map((moveString) -> Move.parse(moveString))
        .collect(Collectors.toList());
    /*
    System.out.println("Moves before merging: " + moves.size());
    for (int i = 0; i < moves.size()-1; i++) {
      Move move = moves.get(i);
      Move nextMove = moves.get(i+1);
      if (move instanceof ComplexMove && nextMove instanceof ComplexMove) {
        ComplexMove moveA = (ComplexMove) move;
        ComplexMove moveB = (ComplexMove) nextMove;
        ComplexMove newMove = moveA.andThen(moveB);
        moves.set(i, newMove);
        moves.remove(i + 1);
      }
    }
    System.out.println("Moves after merging: " + moves.size());
    */
    System.out.println(afterDance(moves, 1_000_000_000));
  }

  public static char[] afterDance(List<Move> moves, int iterations) {
    char[] dancers = "abcdefghijklmnop".toCharArray();
    boolean cycleFound = false;
    HashMap<String, Integer> previousStates = new HashMap<>();
    for (int i = 0; i < iterations; i++) {
      for (Move move : moves) {
        move.perform(dancers);
      }
      if (!cycleFound) {
        if (previousStates.containsKey(new String(dancers))) {
          cycleFound = true;
          int cycleLength = i - previousStates.get(new String(dancers));
          int redundantCycles = (iterations - i) / cycleLength;
          i += (redundantCycles * cycleLength);
          System.out.println(String.format("Skipping %d redundant cycles", redundantCycles));
        }
        previousStates.put(new String(dancers), i);
      }
    }
    return dancers;
  }
}
