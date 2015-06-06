import solution.CliffWorld;
import solution.RLearner;

/**
 * Created by jhonnymertz on 30/05/15.
 */
public class QLearning {

    public static void main(String args[]) {

        RLearner rl = new RLearner(new CliffWorld());
        rl.setEpisodes(200);

        rl.runTrial();
    }


}
