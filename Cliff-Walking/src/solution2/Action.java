package solution2;

/**
 * Created by jhonnymertz on 30/05/15.
 */
public class Action {

    private final String name;
    private Double weight;

    public Action(String name, Double weight) {
        this.name = name;
        this.weight = weight;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public String getName() {
        return name;
    }

    @Override
    public boolean equals(Object obj) {
        return getName().equals(((Action) obj).getName());
    }
}
