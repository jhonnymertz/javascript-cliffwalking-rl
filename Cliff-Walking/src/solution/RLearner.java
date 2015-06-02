package solution;

public class RLearner {

    // action selection types
    public static final int E_GREEDY = 1;
    public static final int SOFTMAX = 2;
    private RLWorld thisWorld;
    private RLPolicy policy;
    private int actionSelection;
    private double epsilon;
    private double temp;
    private double alpha;
    private double gamma;
    private int[] state;
    private int[] newstate;
    private int action;
    private double reward;
    private int episodes;

    public RLearner(RLWorld world) {
        // Getting the world from the invoking method.
        thisWorld = world;

        // Creating new policy with dimensions to suit the world.
        policy = new RLPolicy(thisWorld.getDimension());

        // Initializing the policy with the initial values defined by the world.
        policy.initValues(thisWorld.getInitValues());

        actionSelection = E_GREEDY;

        // set default values
        epsilon = 0.1;
        temp = 1;

        alpha = 1; // For cliffWorld alpha = 1 is good
        gamma = 0.1; // For cliffWorld gamma = 0.1 is a good choice.

        System.out.println("RLearner initialised");

    }

    // execute one trial
    public void runTrial() {
        System.out.println("Learning! (" + episodes + " episodes)\n");
        for (int i = 0; i < episodes; i++) {
            System.out.println(runEpisode() + " passos");
        }
    }

    // execute one epoch
    public int runEpisode() {

        // Reset state to start position defined by the world.

        state = thisWorld.resetState(new int[2]);

        double this_Q;
        double max_Q;
        double new_Q;

        int steps = 0;

        while (!thisWorld.endState(state)) {

            action = selectAction(state);
            newstate = thisWorld.getNextState(state, action);
            reward = thisWorld.getReward(state, action);

            this_Q = policy.getQValue(state, action);
            max_Q = policy.getMaxQValue(newstate);

            // Calculate new Value for Q
            new_Q = this_Q + alpha * (reward + gamma * max_Q - this_Q);
            policy.setQValue(state, action, new_Q);

            // Set state to the new state.
            state = newstate;
            steps++;
        }

        return steps;
    } // runEpisode

    private int selectAction(int[] state) {

        double[] qValues = policy.getQValuesAt(state);
        int selectedAction = -1;

        switch (actionSelection) {

            case E_GREEDY: {

                double maxQ = -Double.MAX_VALUE;
                int[] doubleValues = new int[qValues.length];
                int maxDV = 0;

                //Explore
                if (Math.random() < epsilon) {
                    selectedAction = -1;
                } else {

                    for (int action = 0; action < qValues.length; action++) {

                        if (qValues[action] > maxQ) {
                            selectedAction = action;
                            maxQ = qValues[action];
                            maxDV = 0;
                            doubleValues[maxDV] = selectedAction;
                        } else if (qValues[action] == maxQ) {
                            maxDV++;
                            doubleValues[maxDV] = action;
                        }
                    }

                    if (maxDV > 0) {
                        int randomIndex = (int) (Math.random() * (maxDV + 1));
                        selectedAction = doubleValues[randomIndex];
                    }
                }

                // Select random action if all qValues == 0 or exploring.
                if (selectedAction == -1) {
                    //System.out.println("Exploring ...");
                    selectedAction = (int) (Math.random() * qValues.length);
                }

                // Choose new action if not valid.
                while (!thisWorld.validAction(state, selectedAction)) {
                    selectedAction = (int) (Math.random() * qValues.length);
                    //System.out.println("Invalid action, new one:" + selectedAction);
                }

                break;
            }

            case SOFTMAX: {

                int action;
                double prob[] = new double[qValues.length];
                double sumProb = 0;

                for (action = 0; action < qValues.length; action++) {
                    prob[action] = Math.exp(qValues[action] / temp);
                    sumProb += prob[action];
                }
                for (action = 0; action < qValues.length; action++)
                    prob[action] = prob[action] / sumProb;

                boolean valid = false;
                double rndValue;
                double offset;

                while (!valid) {

                    rndValue = Math.random();
                    offset = 0;

                    for (action = 0; action < qValues.length; action++) {
                        if (rndValue > offset && rndValue < offset + prob[action])
                            selectedAction = action;
                        offset += prob[action];
                        //System.out.println("Action " + action + " chosen with " + prob[action]);
                    }

                    if (thisWorld.validAction(state, selectedAction))
                        valid = true;
                }
                break;
            }
        }
        return selectedAction;
    }

    public RLPolicy getPolicy() {
        return policy;
    }

    public double getAlpha() {
        return alpha;
    }

    public void setAlpha(double a) {
        if (a >= 0 && a < 1)
            alpha = a;
    }

    public double getGamma() {
        return gamma;
    }

    public void setGamma(double g) {
        if (g > 0 && g < 1)
            gamma = g;
    }

    public double getEpsilon() {
        return epsilon;
    }

    public void setEpsilon(double e) {
        if (e > 0 && e < 1)
            epsilon = e;
    }

    public int getEpisodes() {
        return episodes;
    }

    public void setEpisodes(int e) {
        if (e > 0)
            episodes = e;
    }

    public int getActionSelection() {
        return actionSelection;
    }

    public void setActionSelection(int as) {
        switch (as) {
            case SOFTMAX: {
                actionSelection = SOFTMAX;
                break;
            }
            case E_GREEDY:
            default: {
                actionSelection = E_GREEDY;
            }

        }
    }
}

