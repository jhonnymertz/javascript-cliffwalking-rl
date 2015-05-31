package solution;

public class CliffWorld implements RLWorld {

    // Actions.
    final int UP = 0;
    final int RIGHT = 1;
    final int DOWN = 2;
    final int LEFT = 3;

    // dimension: { x, y, actions }
    final int[] dimSize = {12, 4, 4};

    public int[] getDimension() {
        return dimSize;
    }

    public int[] getNextState(int[] state, int action) {

        int[] newstate = new int[state.length];
        System.arraycopy(state, 0, newstate, 0, state.length);

        // UP-LEFT corner in coordinates 0,0
        if (action == UP)
            newstate[1]++;
        else if (action == RIGHT)
            newstate[0]++;
        else if (action == DOWN)
            newstate[1]--;
        else if (action == LEFT)
            newstate[0]--;
        return newstate;
    }

    public boolean validAction(int[] state, int action) {

        // West border
        if (state[0] == 0 && action == LEFT)
            return false;
            // East border
        else if (state[0] == 11 && action == RIGHT)
            return false;
            // North border
        else if (state[1] == 3 && action == UP)
            return false;
            // South border
        else if (state[1] == 0 && action == DOWN)
            return false;
            // Cliff
        else if (state[0] > 0 && state[0] < 11 && state[1] == 1 && action == DOWN)
            return false;
        else return true;
    }

    public boolean endState(int[] state) {
        if (state[0] == 11 && state[1] == 0) {
            return true;
        } else return false;
    }

    public double getReward(int[] state, int action) {
        //Cliff
        if (state[0] > 0 && state[0] < 11 && state[1] == 1 && action == DOWN)
            return -100;
        //Final state
        if (state[1] == 1 && state[0] == 11 && action == DOWN)
            return 0;

        return -1;
    }

    public int[] resetState(int[] state) {

        state[0] = 0;
        state[1] = 0;

        return state;
    }

    public double getInitValues() {
        return 0;
    }


}
