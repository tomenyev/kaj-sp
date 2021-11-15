/**
 * Check types enum class
 */
var CheckType;
(function (CheckType) {
    CheckType[CheckType["CHECKED"] = 0] = "CHECKED";
    CheckType[CheckType["INJURED"] = 1] = "INJURED";
    CheckType[CheckType["KILLED"] = 2] = "KILLED";
})(CheckType || (CheckType = {}));
/**
 * Game states enum class
 */
var GameState;
(function (GameState) {
    GameState[GameState["PREPARATION"] = 0] = "PREPARATION";
    GameState[GameState["PLAY"] = 1] = "PLAY";
    GameState[GameState["END"] = 2] = "END";
})(GameState || (GameState = {}));
/**
 * Difficulty levels enum class
 */
var Difficulty;
(function (Difficulty) {
    Difficulty["EASY"] = "Easy";
    Difficulty["MEDIUM"] = "Medium";
    Difficulty["HARD"] = "Hard";
    Difficulty["INSANE"] = "Insane";
})(Difficulty || (Difficulty = {}));
/**
 * Entity enum class
 */
var Entity;
(function (Entity) {
    Entity[Entity["PLAYER"] = 0] = "PLAYER";
    Entity[Entity["COMPUTER"] = 1] = "COMPUTER";
})(Entity || (Entity = {}));
/**
 * Point class, has only x,y
 */
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
/**
 * points set class implementation that is responsible for all main operations with point array
 */
class PointSet {
    constructor(set) {
        this.set = [];
        if (set) {
            set.forEach(p => this.add(p));
        }
    }
    /**
     * add unique points to the array x,y sizes are between 0 and 9
     * @param points
     */
    add(...points) {
        this.set.push(...points.filter(point => !this.contains(point) &&
            point.x >= 0 && point.x <= 9 && point.y >= 0 && point.y <= 9));
        return this;
    }
    /**
     * return random point from array
     */
    getRandomPoint() {
        return this.set[Math.floor(Math.random() * this.size())];
    }
    /**
     * return true if @param point exists in the point array
     * @param point
     */
    contains(point) {
        return !!this.set.find(s => s.x === point.x && s.y === point.y);
    }
    /**
     * return if array has neighbor points for given point
     * @param point
     */
    containsNeighbors(point) {
        return !!this.set.find(neighbors => (((point.x === neighbors.x + 1 && point.y === neighbors.y) || (point.x === neighbors.x - 1 && point.y === neighbors.y) ||
            (point.x === neighbors.x && point.y === neighbors.y + 1) || (point.x === neighbors.x && point.y === neighbors.y - 1) ||
            (point.x === neighbors.x + 1 && point.y === neighbors.y + 1) || (point.x === neighbors.x - 1 && point.y === neighbors.y + 1) ||
            (point.x === neighbors.x + 1 && point.y === neighbors.y - 1) || (point.x === neighbors.x - 1 && point.y === neighbors.y - 1))));
    }
    /**
     * return size of array
     */
    size() {
        return this.set.length;
    }
    /**
     * return point array
     */
    getPoints() {
        return this.set;
    }
    /**
     * set point array
     * return this instance
     * @param set
     */
    setPointSet(set) {
        this.set = set;
        return this;
    }
    /**
     * remove given point from point array
     * return this instance
     * @param pointSet
     */
    remove(pointSet) {
        this.set = this.set.filter(point => !pointSet.contains(point));
        return this;
    }
    /**
     * remove all neighbor points for given point
     * return this instance
     * @param pointSet
     */
    revomeNeighbors(pointSet) {
        this.set = this.set.filter(p => !pointSet.containsNeighbors(p));
        return this;
    }
    /**
     * remove all points except given points
     * return this instance
     * @param pointSet
     */
    inverseRemove(pointSet) {
        this.set = this.set.filter(point => pointSet.contains(point));
        return this;
    }
    /**
     * find points direction
     * return all available points on that direction
     * @param pointSet
     */
    removeByDirection(pointSet) {
        let maxX = pointSet.getPoints()
            .map(p => p.x)
            .reduce((x, y) => Math.max(x, y));
        let minX = pointSet.getPoints()
            .map(p => p.x)
            .reduce((x, y) => Math.min(x, y));
        let y = pointSet.getRandomPoint().y;
        this.set = maxX === minX ?
            this.set.filter(p => p.x === maxX) :
            this.set.filter(p => p.y === y);
        return this;
    }
    /**
     * remove all points 1 square near ships
     * return this instance
     * @param shipSet
     * @param count
     */
    removeByShips(shipSet, count) {
        let ships = shipSet.getShips().map(s => new Point(s.x, s.y));
        for (let i = 0; i < count; i++) {
            this.remove(new PointSet([this.set.find(p => !ships.find(s => s.x === p.x && s.y === p.y))]));
        }
        return this;
    }
    /**
     * return true if array is empty
     */
    isEmpty() {
        return this.size() === 0;
    }
    /**
     * clear array
     */
    clear() {
        this.set = [];
        return this;
    }
    /**
     * find array points direction
     * generate neighbors by direction for array point
     * return this instance
     */
    generateNeighborsByDirection() {
        let maxY = this.set
            .map(p => p.y)
            .reduce((x, y) => Math.max(x, y));
        let minY = this.set
            .map(p => p.y)
            .reduce((x, y) => Math.min(x, y));
        let maxX = this.set
            .map(p => p.x)
            .reduce((x, y) => Math.max(x, y));
        let minX = this.set
            .map(p => p.x)
            .reduce((x, y) => Math.min(x, y));
        return maxX === minX ?
            this.add(new Point(maxX, maxY + 1), new Point(maxX, minY - 1)) :
            this.add(new Point(maxX + 1, maxY), new Point(minX - 1, maxY));
    }
    /**
     * generate neighbors for given point
     * return this instance
     * @param point
     */
    generateNeighbors(point) {
        return this.add(new Point(point.x + 1, point.y), new Point(point.x - 1, point.y), new Point(point.x, point.y + 1), new Point(point.x, point.y - 1));
    }
}
/**
 * all point set possible combinations
 */
const POINTS = new PointSet([
    new Point(0, 0), new Point(0, 1), new Point(0, 2), new Point(0, 3), new Point(0, 4),
    new Point(0, 5), new Point(0, 6), new Point(0, 7), new Point(0, 8), new Point(0, 9),
    new Point(1, 0), new Point(1, 1), new Point(1, 2), new Point(1, 3), new Point(1, 4),
    new Point(1, 5), new Point(1, 6), new Point(1, 7), new Point(1, 8), new Point(1, 9),
    new Point(2, 0), new Point(2, 1), new Point(2, 2), new Point(2, 3), new Point(2, 4),
    new Point(2, 5), new Point(2, 6), new Point(2, 7), new Point(2, 8), new Point(2, 9),
    new Point(3, 0), new Point(3, 1), new Point(3, 2), new Point(3, 3), new Point(3, 4),
    new Point(3, 5), new Point(3, 6), new Point(3, 7), new Point(3, 8), new Point(3, 9),
    new Point(4, 0), new Point(4, 1), new Point(4, 2), new Point(4, 3), new Point(4, 4),
    new Point(4, 5), new Point(4, 6), new Point(4, 7), new Point(4, 8), new Point(4, 9),
    new Point(5, 0), new Point(5, 1), new Point(5, 2), new Point(5, 3), new Point(5, 4),
    new Point(5, 5), new Point(5, 6), new Point(5, 7), new Point(5, 8), new Point(5, 9),
    new Point(6, 0), new Point(6, 1), new Point(6, 2), new Point(6, 3), new Point(6, 4),
    new Point(6, 5), new Point(6, 6), new Point(6, 7), new Point(6, 8), new Point(6, 9),
    new Point(7, 0), new Point(7, 1), new Point(7, 2), new Point(7, 3), new Point(7, 4),
    new Point(7, 5), new Point(7, 6), new Point(7, 7), new Point(7, 8), new Point(7, 9),
    new Point(8, 0), new Point(8, 1), new Point(8, 2), new Point(8, 3), new Point(8, 4),
    new Point(8, 5), new Point(8, 6), new Point(8, 7), new Point(8, 8), new Point(8, 9),
    new Point(9, 0), new Point(9, 1), new Point(9, 2), new Point(9, 3), new Point(9, 4),
    new Point(9, 5), new Point(9, 6), new Point(9, 7), new Point(9, 8), new Point(9, 9)
]);
/**
 * game Ship class extends Point class
 */
class Ship extends Point {
    constructor(x, y, direct, size) {
        super(x, y);
        this.direct = direct;
        this.size = size;
    }
}
/**
 * game Check class extends Point class
 */
class Check extends Point {
    constructor(x, y, type) {
        super(x, y);
        this.type = type;
    }
}
/**
 * Ship Set implementation
 */
class ShipSet {
    constructor(set) {
        this.set = set || [];
    }
    /**
     * return true if this array of ships contains given ship
     * @param ship
     */
    contains(ship) {
        return !!this.set.find(s => s.x === ship.x && s.y === ship.y && ship.size === s.size && s.direct === ship.direct);
    }
    /**
     * add unique ships to the ship array
     * return this instance
     * @param ships
     */
    add(...ships) {
        this.set.push(...ships.filter(ship => !this.contains(ship)));
        return this;
    }
    /**
     * return this array of ships
     */
    getShips() {
        return this.set;
    }
    /**
     * set this array of ships
     * return this instance
     * @param ships
     */
    setShips(ships) {
        this.set = ships;
        return this;
    }
    /**
     * return this array of ships size
     */
    size() {
        return this.set.length;
    }
    /**
     * return copy of this array of ships
     */
    clone() {
        return new ShipSet().add(...this.set);
    }
}
/**
 * implementation of check set
 */
class CheckSet {
    constructor(set) {
        this.set = set || [];
    }
    /**
     * delete all this array of check points from POINTS(all possible combination of points) and return new Point set
     */
    getFreePointSet() {
        return new PointSet(POINTS.getPoints().filter(point => !this.contains(new Check(point.x, point.y, CheckType.CHECKED))));
    }
    /**
     * add all unique checks to this array of checks
     * @param checks
     */
    add(...checks) {
        this.set.push(...checks.filter(check => !this.contains(check)));
        return this;
    }
    /**
     * return true if this array of checks contains given check
     * @param check
     */
    contains(check) {
        return !!this.set.find(c => c.x === check.x && c.y === check.y);
    }
    /**
     * return this array of checks
     */
    getChecks() {
        return this.set;
    }
    /**
     * return size of this array of checks
     */
    size() {
        return this.set.length;
    }
    /**
     * return all injured and killed checks size
     */
    notCheckedChecksSize() {
        return this.set.filter(check => check.type === CheckType.KILLED || check.type === CheckType.INJURED).length;
    }
    /**
     * return all inured checks
     */
    getInjuredChecks() {
        return this.set.filter(check => check.type === CheckType.INJURED);
    }
    /**
     * return all killed checks
     */
    getKilledChecks() {
        return this.set.filter(check => check.type === CheckType.KILLED);
    }
    /**
     * change all given checks in this array of checks to killed type
     * return this instance
     * @param topology
     * @param checks
     */
    changeToKilled(topology, ...checks) {
        for (let check of checks) {
            for (let c of this.set) {
                if (check.x === c.x && check.y === c.y) {
                    c.type = CheckType.KILLED;
                }
            }
        }
        return this;
    }
    /**
     * change all given checks in this array of checks to injured type
     * return this intance
     * @param topology
     * @param checks
     */
    changeToInjured(topology, ...checks) {
        for (let check of checks) {
            for (let c of this.set) {
                if (check.x === c.x && check.y === c.y) {
                    c.type = CheckType.INJURED;
                }
            }
        }
        return this;
    }
    /**
     * return copy of this array of checks
     */
    clone() {
        return new CheckSet()
            .add(...this.set);
    }
}
/**
 * Item class for saving game info to the local storage
 */
class Item {
    constructor(state, playerMove, playerShips, playerChecks, computerShips, computerChecks, insaneLevelMemory, playerStatistic, computerStatistic) {
        this.state = state;
        this.playerMove = playerMove;
        this.playerShips = playerShips;
        this.playerChecks = playerChecks;
        this.computerShips = computerShips;
        this.computerChecks = computerChecks;
        this.insaneLevelMemory = insaneLevelMemory;
        this.playerStatistic = playerStatistic;
        this.computerStatistic = computerStatistic;
    }
}
//# sourceMappingURL=Utils.js.map