package solution2;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Created by jhonnymertz on 30/05/15.
 */
public class Walker {

    private final Position initialPosition;
    private Position position;
    private Integer rew;
    private Integer ret;

    private double eta;
    private double alpha;
    private double gamma;
    private int n;

    public Walker(Position initialPosition) {
        this.initialPosition = initialPosition;
        reset();
    }

    private void reset() {
        position = new Position(initialPosition.getX(), initialPosition.getY());
        rew = 0;
        ret = 0;
    }

    public boolean isInCliff() {
        return position.getX() > 1 && position.getY() < 2 && position.getY() != 12;
    }

    public void reward() {
        if (isInCliff()) {
            reset();
            rew = -100;
        } else {
            rew = -1;
        }
        ret += rew;
    }

    public int getReward() {
        return rew;
    }

    //select next action
    public Action etaGreedy(State2 qa, double eta) {
        Random rand = new Random();
        Double maxValue = Double.NEGATIVE_INFINITY;
        int maxCount = 0;
        List<Action> actions = new ArrayList<Action>();
        for (Action action : qa.getActions()) {
            if (action.getWeight() > maxValue) {
                maxValue = action.getWeight();
                maxCount = 1;
            } else if (action.getWeight() == maxValue) {
                maxCount++;
            }
        }
        Double exploreProb = eta / qa.getActions().size();
        Double greedyProb = (1.0 - eta) / maxCount + exploreProb;
        Double oldProb = 0.0;
        for (Action action : qa.getActions()) {
            if (action.getWeight() == maxValue) {
                oldProb += greedyProb;
            } else {
                oldProb += exploreProb;
            }
            System.out.printf("%f\n", oldProb);
            actions.add(new Action(action.getName(), oldProb));
        }
        double r = rand.nextDouble();
        for (Action action : actions) {
            if (r < action.getWeight()) {
                return action;
            }
        }
        return actions.get(qa.getActions().size() - 1);
    }

    public Double getMaxQAV(State2 qa) {
        Double maxValue = Double.NEGATIVE_INFINITY;
        for (Action action : qa.getActions()) {
            if (action.getWeight() > maxValue) {
                maxValue = action.getWeight();
            }
        }
        return maxValue;
    }

    public void action(Action action, Table table) {
        if (action.getName().equals("up")) {
            if (position.getY() < table.getWidth()) {
                up();
            }
        } else if (action.getName().equals("down")) {
            if (position.getY() > 1) {
                down();
            }
        } else if (action.getName().equals("left")) {
            if (position.getX() > 1) {
                left();
            }
        } else if (action.getName().equals("right")) {
            if (position.getX() < table.getLength()) {
                right();
            }
        }
        reward();
    }

    protected void up() {
        position.setY(position.getY() + 1);
    }

    protected void down() {
        position.setY(position.getY() - 1);
    }

    protected void right() {
        position.setX(position.getX() + 1);
    }

    protected void left() {
        position.setX(position.getX() - 1);
    }


    public Table apply(Table table, State2 finalState, double eta, double alpha, double gamma, int n) {
        this.eta = eta;
        this.alpha = alpha;
        this.gamma = gamma;
        this.n = n;

        //HashMap<String, HashMap<String, Double>> q = new HashMap<String, HashMap<String, Double>>();
        //solution2.State cs = new solution2.State(w, l);

        // initialize Q arbitrarily
        //for(int i = 0; i < w; i++){
        //for(int j = 0; j < l; j++){
        //       HashMap<String, Double> qa = new HashMap<String, Double>();
        //     qa.put("up", 0.5);
        //   qa.put("down", 0.5);
        // qa.put("right", 0.5);
        //qa.put("left", 0.5);
        //q.put(String.format("(%d, %d)", i, j), qa);
        // }
        //}

        for (int i = 0; i < n; i++) {
            //cs.reset();
            reset();
            State2 s = table.get(initialPosition);
            int rs = 0;
            while (!position.equals(finalState)) {
                Action a = etaGreedy(s, eta);
                action(a, table);
                int r = getReward();
                State2 s_n = table.get(position.getX(), position.getY());
                Double qav = a.getWeight() + alpha * (r + gamma * (getMaxQAV(s_n)) - a.getWeight());
                a.setWeight(qav);
                s.addAction(a);

                if (position.equals(initialPosition)) {
                    continue;
                }
                s = s_n;
                rs += r;
                System.out.printf("%d: %s-%s %f\n", i, s, a, qav);
            }
            if (i == (n - 1)) {
                System.out.printf("%d\n", rs);
            } else {
                System.out.printf("%d, ", rs);
            }
        }
        return table;
    }
}
