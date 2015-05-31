package solution2;

/**
 * Created by jhonnymertz on 30/05/15.
 */
public class Position {

    private int x;
    private int y;

    public Position(Integer x, Integer y) {
        this.x = x;
        this.y = y;
    }

    public Integer getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public Integer getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    @Override
    public boolean equals(Object obj) {
        Position position = (Position) obj;
        return this.getX().equals(position.getX()) && this.getY().equals(position.getY());
    }
}
