package solution2;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by jhonnymertz on 30/05/15.
 */
public class State2 extends Position {

    private List<Action> actions;

    public State2(Integer x, Integer y) {
        super(x, y);
        actions = new ArrayList<Action>();
    }

    public void addAction(Action action) {
        for (Action a : actions) {
            if (a.getName().equals(action.getName())) {
                a.setWeight(action.getWeight());
                return;
            }
        }
        actions.add(action);
    }

    public List<Action> getActions() {
        return actions;
    }

    @Override
    public String toString() {
        return "solution2.Position: " + getX() + ":" + getY();
    }

    @Override
    public boolean equals(Object obj) {
        return super.equals(obj);
    }
}
