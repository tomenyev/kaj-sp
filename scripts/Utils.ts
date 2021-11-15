/**
 * Check types enum class
 */
enum CheckType {
    CHECKED,
    INJURED,
    KILLED
}

/**
 * Game states enum class
 */
enum GameState {
    PREPARATION,
    PLAY,
    END
}

/**
 * Difficulty levels enum class
 */
enum Difficulty {
    EASY="Easy",
    MEDIUM="Medium",
    HARD="Hard",
    INSANE="Insane",
}

/**
 * Entity enum class
 */
enum Entity {
    PLAYER,
    COMPUTER
}

/**
 * Point class, has only x,y
 */
class Point {
    public x:number;
    public y:number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

/**
 * points set class implementation that is responsible for all main operations with point array
 */
class PointSet {

    private set:Point[];//array of points

    constructor(set?:Point[]) {
        this.set = [];
        if(set) {
            set.forEach(p => this.add(p));
        }
    }

    /**
     * add unique points to the array x,y sizes are between 0 and 9
     * @param points
     */
    public add(...points: Point[]):PointSet {
        this.set.push(...points.filter(point => !this.contains(point) &&
            point.x >= 0 && point.x <= 9 && point.y >= 0 && point.y <= 9));
        return this;
    }

    /**
     * return random point from array
     */
    public getRandomPoint():Point {
        return this.set[Math.floor(Math.random()*this.size())];
    }

    /**
     * return true if @param point exists in the point array
     * @param point
     */
    public contains(point: Point): boolean {
        return !!this.set.find(s => s.x === point.x && s.y === point.y);
    }

    /**
     * return if array has neighbor points for given point
     * @param point
     */
    public containsNeighbors(point:Point):boolean {
        return !!this.set.find(neighbors => (
                ((point.x === neighbors.x + 1 && point.y === neighbors.y) || (point.x === neighbors.x - 1 && point.y === neighbors.y) ||
                (point.x === neighbors.x && point.y === neighbors.y + 1) || (point.x === neighbors.x && point.y === neighbors.y - 1) ||
                (point.x === neighbors.x + 1 && point.y === neighbors.y + 1) || (point.x === neighbors.x - 1 && point.y === neighbors.y + 1) ||
                (point.x === neighbors.x + 1  && point.y === neighbors.y - 1) || (point.x === neighbors.x - 1 && point.y === neighbors.y - 1))));
    }

    /**
     * return size of array
     */
    public size():number {
        return  this.set.length;
    }

    /**
     * return point array
     */
    public getPoints():Point[] {
        return this.set;
    }

    /**
     * set point array
     * return this instance
     * @param set
     */
    public setPointSet(set:Point[]):PointSet {
        this.set = set;
        return this;
    }

    /**
     * remove given point from point array
     * return this instance
     * @param pointSet
     */
    public remove(pointSet:PointSet):PointSet {
        this.set = this.set.filter(point => !pointSet.contains(point));
        return this;
    }

    /**
     * remove all neighbor points for given point
     * return this instance
     * @param pointSet
     */
    public revomeNeighbors(pointSet:PointSet):PointSet {
        this.set = this.set.filter(p => !pointSet.containsNeighbors(p));
        return this;
    }

    /**
     * remove all points except given points
     * return this instance
     * @param pointSet
     */
    public inverseRemove(pointSet:PointSet):PointSet {
        this.set = this.set.filter(point => pointSet.contains(point));
        return this;
    }

    /**
     * find points direction
     * return all available points on that direction
     * @param pointSet
     */
    public removeByDirection(pointSet: PointSet):PointSet {
        let maxX:number = pointSet.getPoints()
            .map(p => p.x)
            .reduce((x,y) => Math.max(x,y));

        let minX:number = pointSet.getPoints()
            .map(p => p.x)
            .reduce((x,y) => Math.min(x,y));

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
    public removeByShips(shipSet: ShipSet, count: number):PointSet {
        let ships:Point[] = shipSet.getShips().map(s => new Point(s.x, s.y));
        for(let i:number = 0; i < count; i++) {
             this.remove(new PointSet(
                 [this.set.find(p => !ships.find(s => s.x === p.x && s.y === p.y))]
             ));
        }
        return this;
    }

    /**
     * return true if array is empty
     */
    public isEmpty():boolean {
        return this.size() === 0;
    }

    /**
     * clear array
     */
    public clear():PointSet {
        this.set = [];
        return this;
    }

    /**
     * find array points direction
     * generate neighbors by direction for array point
     * return this instance
     */
    public generateNeighborsByDirection():PointSet {

        let maxY:number = this.set
            .map(p => p.y)
            .reduce((x,y) => Math.max(x,y));

        let minY:number = this.set
            .map(p => p.y)
            .reduce((x,y) => Math.min(x,y));

        let maxX:number = this.set
            .map(p => p.x)
            .reduce((x,y) => Math.max(x,y));

        let minX:number = this.set
            .map(p => p.x)
            .reduce((x,y) => Math.min(x,y));

        return maxX === minX ?
            this.add(new Point(maxX, maxY+1), new Point(maxX, minY-1)) :
            this.add(new Point(maxX+1, maxY), new Point(minX-1, maxY));
    }

    /**
     * generate neighbors for given point
     * return this instance
     * @param point
     */
    public generateNeighbors(point:Point):PointSet {
        return this.add(
            new Point(point.x+1,point.y),
            new Point(point.x-1,point.y),
            new Point(point.x,point.y+1),
            new Point(point.x, point.y-1)
        );
    }
}

/**
 * all point set possible combinations
 */
const POINTS:PointSet = new PointSet([
    new Point(0,0),new Point(0,1),new Point(0,2),new Point(0,3),new Point(0,4),
    new Point(0,5),new Point(0,6),new Point(0,7),new Point(0,8),new Point(0,9),
    new Point(1,0),new Point(1,1),new Point(1,2),new Point(1,3),new Point(1,4),
    new Point(1,5),new Point(1,6),new Point(1,7),new Point(1,8),new Point(1,9),
    new Point(2,0),new Point(2,1),new Point(2,2),new Point(2,3),new Point(2,4),
    new Point(2,5),new Point(2,6),new Point(2,7),new Point(2,8),new Point(2,9),
    new Point(3,0),new Point(3,1),new Point(3,2),new Point(3,3),new Point(3,4),
    new Point(3,5),new Point(3,6),new Point(3,7),new Point(3,8),new Point(3,9),
    new Point(4,0),new Point(4,1),new Point(4,2),new Point(4,3),new Point(4,4),
    new Point(4,5),new Point(4,6),new Point(4,7),new Point(4,8),new Point(4,9),
    new Point(5,0),new Point(5,1),new Point(5,2),new Point(5,3),new Point(5,4),
    new Point(5,5),new Point(5,6),new Point(5,7),new Point(5,8),new Point(5,9),
    new Point(6,0),new Point(6,1),new Point(6,2),new Point(6,3),new Point(6,4),
    new Point(6,5),new Point(6,6),new Point(6,7),new Point(6,8),new Point(6,9),
    new Point(7,0),new Point(7,1),new Point(7,2),new Point(7,3),new Point(7,4),
    new Point(7,5),new Point(7,6),new Point(7,7),new Point(7,8),new Point(7,9),
    new Point(8,0),new Point(8,1),new Point(8,2),new Point(8,3),new Point(8,4),
    new Point(8,5),new Point(8,6),new Point(8,7),new Point(8,8),new Point(8,9),
    new Point(9,0),new Point(9,1),new Point(9,2),new Point(9,3),new Point(9,4),
    new Point(9,5),new Point(9,6),new Point(9,7),new Point(9,8),new Point(9,9)
]);

/**
 * game Ship class extends Point class
 */
class Ship extends Point{
    public direct: number; // ship direction 0 or 1
    public size: number; // ship size from 1 to 4
    constructor(x: number, y: number, direct:number, size:number) {
        super(x,y);
        this.direct = direct;
        this.size = size;
    }
}

/**
 * game Check class extends Point class
 */
class Check extends Point{
    public type: CheckType; // check type [Checked, Injured, Killed]
    constructor(x: number, y: number, type: CheckType) {
        super(x,y);
        this.type = type;
    }
}

/**
 * Ship Set implementation
 */
class ShipSet {

    private set: Ship[]; //  array of ships

    constructor(set?:Ship[]) {
        this.set = set || [];
    }

    /**
     * return true if this array of ships contains given ship
     * @param ship
     */
    public contains(ship: Ship): boolean {
        return !!this.set.find(s => s.x === ship.x && s.y === ship.y && ship.size === s.size && s.direct === ship.direct);
    }

    /**
     * add unique ships to the ship array
     * return this instance
     * @param ships
     */
    public add(...ships: Ship[]):ShipSet {
        this.set.push(...ships.filter(ship => !this.contains(ship)));
        return this;
    }

    /**
     * return this array of ships
     */
    public getShips(): Ship[] {
        return this.set;
    }

    /**
     * set this array of ships
     * return this instance
     * @param ships
     */
    public setShips(ships: Ship[]):ShipSet {
        this.set = ships;
        return this;
    }

    /**
     * return this array of ships size
     */
    public size():number {
        return this.set.length;
    }

    /**
     * return copy of this array of ships
     */
    public clone():ShipSet {
        return new ShipSet().add(...this.set);
    }
}


/**
 * implementation of check set
 */
class CheckSet {

    private readonly set: Check[]; // array of checks

    constructor(set?:Check[]) {
        this.set = set || [];
    }

    /**
     * delete all this array of check points from POINTS(all possible combination of points) and return new Point set
     */
    public getFreePointSet():PointSet {
        return new PointSet(POINTS.getPoints().filter(point => !this.contains(new Check(point.x, point.y, CheckType.CHECKED))));
    }

    /**
     * add all unique checks to this array of checks
     * @param checks
     */
    public add(...checks: Check[]): CheckSet {
        this.set.push(...checks.filter(check => !this.contains(check)));
        return this;
    }

    /**
     * return true if this array of checks contains given check
     * @param check
     */
    public contains(check: Check): boolean {
        return !!this.set.find(c => c.x === check.x && c.y === check.y);
    }

    /**
     * return this array of checks
     */
    public getChecks(): Check[] {
        return this.set;
    }

    /**
     * return size of this array of checks
     */
    public size(): number {
        return this.set.length;
    }

    /**
     * return all injured and killed checks size
     */
    public notCheckedChecksSize():number {
        return this.set.filter(check => check.type === CheckType.KILLED || check.type === CheckType.INJURED).length;
    }

    /**
     * return all inured checks
     */
    public getInjuredChecks(): Check[] {
        return this.set.filter(check => check.type === CheckType.INJURED);
    }

    /**
     * return all killed checks
     */
    public getKilledChecks(): Check[] {
        return this.set.filter(check => check.type === CheckType.KILLED);
    }

    /**
     * change all given checks in this array of checks to killed type
     * return this instance
     * @param topology
     * @param checks
     */
    public changeToKilled(topology:Topology,...checks: Check[]): CheckSet {
        for(let check of checks) {
            for(let c of this.set) {
                if(check.x === c.x && check.y === c.y) {
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
    public changeToInjured(topology:Topology, ...checks: Check[]): CheckSet {
        for(let check of checks) {
            for(let c of this.set) {
                if(check.x === c.x && check.y === c.y) {
                    c.type = CheckType.INJURED;
                }
            }
        }
        return this;
    }

    /**
     * return copy of this array of checks
     */
    public clone():CheckSet {
        return new CheckSet()
            .add(...this.set);
    }
}

/**
 * Item class for saving game info to the local storage
 */
class Item {
    public readonly state:GameState; // current game state
    public readonly playerMove:boolean; // current game player move
    public readonly playerShips:Ship[]; // player's array of ships
    public readonly playerChecks:Check[]; // player's array of checks
    public readonly computerShips:Ship[]; // bot's array of ships
    public readonly computerChecks:Check[]; // bot's array of computer
    public readonly playerStatistic:number[]; // player's statistic
    public readonly computerStatistic:number[]; // bot's statistic
    public readonly insaneLevelMemory:Point[]; // memory of insane level

    constructor( state: GameState, playerMove: boolean, playerShips: Ship[], playerChecks: Check[], computerShips: Ship[],
                computerChecks: Check[], insaneLevelMemory: Point[], playerStatistic:number[], computerStatistic:number[] ) {
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
