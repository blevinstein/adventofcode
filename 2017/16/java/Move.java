
public abstract class Move {
  public abstract void perform(char[] dancers);

  public static Move parse(String moveString) {
    if (moveString.charAt(0) == 's') {
      int size = Integer.parseInt(moveString.substring(1));
      return new SpinMove(size);
    } else if (moveString.charAt(0) == 'x') {
      String[] parts = moveString.substring(1).split("/");
      int pos_a = Integer.parseInt(parts[0]);
      int pos_b = Integer.parseInt(parts[1]);
      return new ExchangeMove(pos_a, pos_b);
    } else if (moveString.charAt(0) == 'p') {
      String[] parts = moveString.substring(1).split("/");
      return new PartnerMove(parts[0].charAt(0), parts[1].charAt(0));
    }
    throw new IllegalArgumentException(moveString);
  }
}
