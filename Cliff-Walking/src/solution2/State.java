package solution2;

class State {
    int x;
    int y;
    int length;
    int width;
    int rew;
    int ret;

    public State(int w, int l) {
        reset();
        width = w;
        length = l;

    }

    public void reset() {
        x = 0;
        y = 0;
        rew = 0;
        ret = 0;
    }

    public void action(String a) {
        if (a.equals("up")) {
            up();
        } else if (a.equals("down")) {
            down();
        } else if (a.equals("left")) {
            left();
        } else if (a.equals("right")) {
            right();
        }
        reward();
    }

    public void up() {
        if (y < (length - 1)) {
            y++;
        }
    }

    public void down() {
        if (y > 0) {
            y--;
        }
    }

    public void right() {
        if (x < (width - 1)) {
            x++;
        }
    }

    public void left() {
        if (x > 0) {
            x--;
        }
    }

    public void reward() {
        if ((y == 0) && (x > 0) && (x < (width - 1))) {
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

    public boolean terminate() {
        return (x > 0 && (y == 0));
    }

    public String getState() {
        return String.format("(%d, %d)", x, y);
    }
}