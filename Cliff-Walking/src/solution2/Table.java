package solution2;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by jhonnymertz on 30/05/15.
 */
public class Table {

    private final int length;
    private final int width;
    private Set<State2> states;

    //width = y, length = x
    public Table(int length, int width) {
        this.length = length;
        this.width = width;
        states = new HashSet<State2>();
        reset();
    }

    public State2 get(Integer x, Integer y) {
        for (State2 state : states) {
            if (state.getX().equals(x) && state.getY().equals(y))
                return state;
        }
        return null;
    }

    public void reset() {
        for (int x = 1; x <= length; x++) {
            for (int y = 1; y <= width; y++) {
                State2 state = new State2(x, y);
                state.addAction(new Action("up", 0.5));
                state.addAction(new Action("down", 0.5));
                state.addAction(new Action("right", 0.5));
                state.addAction(new Action("left", 0.5));
                states.add(state);
            }
        }
    }

    public int getLength() {
        return length;
    }

    public int getWidth() {
        return width;
    }

    public State2 get(Position position) {
        return get(position.getX(), position.getY());
    }
}
