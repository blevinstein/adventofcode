
public class PartnerMove extends Move {
  private final char dancerA, dancerB;

  public PartnerMove(char dancerA, char dancerB) {
    this.dancerA = dancerA;
    this.dancerB = dancerB;
  }

  public void perform(char[] dancers) {
    int posA = -1, posB = -1;
    for (int i = 0; i < dancers.length && (posA < 0 || posB < 0); i++) {
      if (dancers[i] == dancerA) {
        posA = i;
      } else if (dancers[i] == dancerB) {
        posB = i;
      }
    }
    char t = dancers[posA];
    dancers[posA] = dancers[posB];
    dancers[posB] = t;
  }

  @Override
  public String toString() {
    return String.format("PartnerMove(%s, %s)", dancerA, dancerB);
  }
}
