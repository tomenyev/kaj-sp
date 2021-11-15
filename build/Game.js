///<reference path="Topology.ts"/>
///<reference path="script.ts"/>
/**
 * This class is responsible for game logic.
 * Manage bot logic.
 * Manage game states.
 * Draw game.
 * Game settings.
 * Manage player's and bot's game statistic
 */
var ViewMode;
(function (ViewMode) {
    ViewMode[ViewMode["LIGHT"] = 0] = "LIGHT";
    ViewMode[ViewMode["DARK"] = 1] = "DARK";
})(ViewMode || (ViewMode = {}));
class Game {
    // [0,0,0,0,0,0,0]; //[ killed total, 1, 2, 3, 4, injured checks, killed checks]
    constructor(canvas, width, height) {
        this.memory = new PointSet(); // memory for insane level bot
        this.statistic = new Map();
        this.statistic.set(Entity.PLAYER, [0, 0, 0, 0, 0, 0, 0]);
        this.statistic.set(Entity.COMPUTER, [0, 0, 0, 0, 0, 0, 0]);
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this
            .initSizes()
            .createPlayers()
            .load();
        this.mouse = new Mouse(this.canvas);
        this.context = this.canvas.getContext('2d');
        this.difficulty = JSON.parse(localStorage.getItem("__BS_DIFFICULTY__")) || Difficulty.INSANE;
        this.viewMode = JSON.parse(localStorage.getItem('__BS_VIEW_MODE__')) || ViewMode.LIGHT;
        requestAnimationFrame(x => this.tick(x));
    }
    /**
     * init game field and cell sizes depending on canvas width and height
     */
    initSizes() {
        if (this.width >= this.height) {
            this.FIELD_SIZE = (2 * this.height / 55 + this.width / 11) / 4;
            this.CELL_SIZE = this.FIELD_SIZE * 0.766;
        }
        else {
            this.FIELD_SIZE = (2 * this.width / 55 + this.height / 11) / 4;
            this.CELL_SIZE = this.FIELD_SIZE * 0.766;
        }
        return this;
    }
    /**
     * Create player and bot depending on canvas width, height, field and cell sizes.
     */
    createPlayers() {
        if (this.width >= this.height) {
            let offSetX = (this.width - 2 * 11 * this.FIELD_SIZE - 11 * this.FIELD_SIZE / 2) / 2;
            let offSetY = (this.height - 11 * this.FIELD_SIZE) / 2;
            this.player = new Topology(Entity.PLAYER, offSetX, offSetY, false);
            this.computer = new Topology(Entity.COMPUTER, offSetX + 11 * this.FIELD_SIZE + 11 * this.FIELD_SIZE / 2, offSetY, true);
        }
        else {
            let offSetX = (this.width - 11 * this.FIELD_SIZE) / 2;
            let offSetY = (this.height - 2 * 11 * this.FIELD_SIZE - 11 * this.FIELD_SIZE / 2) / 2;
            this.player = new Topology(Entity.PLAYER, offSetX, offSetY, false);
            this.computer = new Topology(Entity.COMPUTER, offSetX, offSetY + 11 * this.FIELD_SIZE + 11 * this.FIELD_SIZE / 2, true);
        }
        return this;
    }
    /**
     * main infinite tick function that manage all game states, draw and update game
     * @param timestamp
     */
    tick(timestamp) {
        this.save();
        requestAnimationFrame(x => this.tick(x));
        this.clearCanvas()
            .drawGrid();
        this.player.draw(this.context);
        this.computer.draw(this.context);
        switch (this.state) {
            case GameState.PREPARATION:
                this.tickPreparation(timestamp);
                break;
            case GameState.PLAY:
                this.tickPlay(timestamp);
                break;
            case GameState.END:
                this.tickEnd(timestamp);
                break;
            default:
                break;
        }
        this.mouse.tmpLeft = this.mouse.left;
    }
    /**
     * infinite tick function that is responsible for game preparation state
     * @param timestamp
     */
    tickPreparation(timestamp) {
        if (this.player.getShipSet().size() === 10) {
            this.state = GameState.PLAY;
        }
        if (!this.player.isPointUnder(this.mouse)) {
            return;
        }
        const shipSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
        const shipSize = shipSizes[this.player.getShipSet().size()];
        const coordinates = this.player.getCoordinats(this.mouse);
        const ship = new Ship(coordinates.x, coordinates.y, (this.mouse.s) ? 0 : 1, shipSize);
        if (!this.player.canStay(ship)) {
            return;
        }
        this.player.drawShip(this.context, ship);
        if (this.mouse.left && !this.mouse.tmpLeft) {
            audioManager.click(); ///audio///
            this.player.addShips(ship);
            if (this.player.getShipSet().size() === 10) {
                this.state = GameState.PLAY;
            }
        }
    }
    /**
     * infinite tick function that is responsible for game play state
     * @param timestamp
     */
    tickPlay(timestamp) {
        this.drawStatistic();
        if (this.playerMove) {
            if (!this.computer.isPointUnder(this.mouse)) {
                return;
            }
            const point = this.computer.getCoordinats(this.mouse);
            if (this.mouse.left && !this.mouse.tmpLeft) {
                const checksBefore = this.computer.getCheckSet().size();
                const notChecksBefore = this.computer.getCheckSet().notCheckedChecksSize();
                this.computer
                    .addChecks(point)
                    .update();
                const checksAfter = this.computer.getCheckSet().size();
                const notChecksAfter = this.computer.getCheckSet().notCheckedChecksSize();
                if (checksBefore !== checksAfter && notChecksBefore === notChecksAfter) {
                    audioManager.punch(); ///audio///
                    this.playerMove = false;
                }
                if (notChecksBefore !== notChecksAfter) {
                    audioManager.sword(); ///audio///
                    this.tickPlay(timestamp);
                }
            }
        }
        else {
            switch (this.difficulty) {
                case Difficulty.EASY:
                    this.easyComputerLevel(timestamp);
                    break;
                case Difficulty.MEDIUM:
                    this.mediumComputerLevel(timestamp, false);
                    break;
                case Difficulty.HARD:
                    this.hardComputerLevel(timestamp, false);
                    break;
                case Difficulty.INSANE:
                    this.insaneComputerLevel(timestamp, false);
                    break;
            }
        }
        if (this.statistic.get(Entity.PLAYER)[0] === 10 || this.statistic.get(Entity.COMPUTER)[0] === 10) {
            this.state = GameState.END;
        }
    }
    /**
     * infinite tick function that is responsible for game end state
     * @param timestamp
     */
    tickEnd(timestamp) {
        if (this.statistic.get(Entity.COMPUTER)[0] === 10) {
            this.drawWinner('You', this.player);
        }
        else {
            this.drawWinner('Computer', this.computer);
        }
    }
    /**
     * easy bot level implementation
     * fully random logic
     * @param timestamp
     */
    easyComputerLevel(timestamp) {
        let pointToTry = this.player.getCheckSet().getFreePointSet().getRandomPoint();
        if (pointToTry) {
            let injuredChecksBefore = this.statistic.get(Entity.PLAYER)[5];
            let killedChecksBefore = this.statistic.get(Entity.PLAYER)[6];
            this.player
                .addChecks(new Check(pointToTry.x, pointToTry.y, CheckType.CHECKED))
                .update();
            let injuredChecksAfter = this.statistic.get(Entity.PLAYER)[5];
            let killedChecksAfter = this.statistic.get(Entity.PLAYER)[6];
            if (killedChecksBefore !== killedChecksAfter || injuredChecksBefore !== injuredChecksAfter) {
                return this.easyComputerLevel(timestamp).save();
            }
        }
        return this.setPlayerMove(true).save();
    }
    /**
     * medium level bot implementation
     * @param timestamp
     * @param injured
     * @param injuredPoint
     */
    mediumComputerLevel(timestamp, injured, injuredPoint) {
        let available = this.player.getCheckSet().getFreePointSet();
        let pointToTry;
        if (!injured) {
            pointToTry = available.getRandomPoint();
        }
        else {
            pointToTry = available
                .inverseRemove(new PointSet().generateNeighbors(injuredPoint))
                .getRandomPoint();
        }
        if (pointToTry) {
            let injuredChecksBefore = this.statistic.get(Entity.PLAYER)[5];
            let killedChecksBefore = this.statistic.get(Entity.PLAYER)[6];
            this.player
                .addChecks(new Check(pointToTry.x, pointToTry.y, CheckType.CHECKED))
                .update();
            let injuredChecksAfter = this.statistic.get(Entity.PLAYER)[5];
            let killedChecksAfter = this.statistic.get(Entity.PLAYER)[6];
            if (killedChecksBefore !== killedChecksAfter || injuredChecksBefore !== injuredChecksAfter) {
                return this.mediumComputerLevel(timestamp, injuredChecksBefore !== injuredChecksAfter, pointToTry)
                    .save();
            }
        }
        return this.setPlayerMove(true).save();
    }
    /**
     * hard level bot implementation
     * @param timestamp
     * @param injured
     * @param injuredPoints
     */
    hardComputerLevel(timestamp, injured, ...injuredPoints) {
        let available = this.player.getCheckSet().getFreePointSet();
        let killed = new PointSet(this.player.getCheckSet().getKilledChecks());
        let pointToTry;
        if (killed && killed.size() !== 0) {
            available.revomeNeighbors(killed);
        }
        if (injured) {
            if (injuredPoints.length === 1) {
                available
                    .inverseRemove(new PointSet().generateNeighbors(injuredPoints[0]))
                    .getRandomPoint();
            }
            else {
                let allCombination = new PointSet();
                injuredPoints.forEach(point => allCombination.generateNeighbors(point));
                available.inverseRemove(allCombination
                    .remove(new PointSet(injuredPoints))
                    .removeByDirection(new PointSet(injuredPoints)));
                if (available.isEmpty()) {
                    available
                        .setPointSet(this.player
                        .getCheckSet()
                        .getFreePointSet()
                        .getPoints())
                        .revomeNeighbors(killed)
                        .inverseRemove(allCombination.generateNeighborsByDirection());
                }
            }
        }
        pointToTry = available.getRandomPoint();
        if (pointToTry) {
            let injuredChecksBefore = this.statistic.get(Entity.PLAYER)[5];
            let killedChecksBefore = this.statistic.get(Entity.PLAYER)[6];
            this.player
                .addChecks(new Check(pointToTry.x, pointToTry.y, CheckType.CHECKED))
                .update();
            let injuredChecksAfter = this.statistic.get(Entity.PLAYER)[5];
            let killedChecksAfter = this.statistic.get(Entity.PLAYER)[6];
            if (killedChecksBefore !== killedChecksAfter || injuredChecksBefore !== injuredChecksAfter) {
                killedChecksBefore !== killedChecksAfter ? injuredPoints = [] : injuredPoints.push(pointToTry);
                return this.hardComputerLevel(timestamp, injuredChecksBefore < injuredChecksAfter, ...injuredPoints)
                    .save();
            }
        }
        return this
            .setPlayerMove(true)
            .save();
    }
    /**
     * insane level bot implementation
     * @param timestamp
     * @param injured
     */
    insaneComputerLevel(timestamp, injured) {
        let available = this.player.getCheckSet().getFreePointSet();
        let killed = new PointSet(this.player.getCheckSet().getKilledChecks());
        let pointToTry;
        if (killed && killed.size() !== 0) {
            available.revomeNeighbors(killed);
        }
        if (injured || !this.memory.isEmpty()) {
            if (this.memory.size() === 1) {
                available
                    .inverseRemove(new PointSet().generateNeighbors(this.memory.getPoints()[0]))
                    .getRandomPoint();
            }
            else {
                let allCombination = new PointSet();
                this.memory.getPoints().forEach(point => allCombination.generateNeighbors(point));
                available.inverseRemove(allCombination
                    .remove(this.memory)
                    .removeByDirection(this.memory));
                if (available.isEmpty()) {
                    available
                        .setPointSet(this.player
                        .getCheckSet()
                        .getFreePointSet()
                        .getPoints())
                        .revomeNeighbors(killed)
                        .inverseRemove(allCombination.generateNeighborsByDirection());
                }
            }
        }
        pointToTry = available.getRandomPoint();
        if (pointToTry) {
            let injuredChecksBefore = this.statistic.get(Entity.PLAYER)[5];
            let killedChecksBefore = this.statistic.get(Entity.PLAYER)[6];
            this.player
                .addChecks(new Check(pointToTry.x, pointToTry.y, CheckType.CHECKED))
                .update();
            let injuredChecksAfter = this.statistic.get(Entity.PLAYER)[5];
            let killedChecksAfter = this.statistic.get(Entity.PLAYER)[6];
            if (killedChecksBefore !== killedChecksAfter || injuredChecksBefore !== injuredChecksAfter) {
                killedChecksBefore !== killedChecksAfter ? this.memory.clear() : this.memory.add(pointToTry);
                return this.insaneComputerLevel(timestamp, injuredChecksBefore < injuredChecksAfter)
                    .save();
            }
        }
        return this.setPlayerMove(true).save();
    }
    /**
     * save all game data into the local storage
     */
    save() {
        const item = new Item(this.state, this.playerMove, this.player.getShipSet().getShips(), this.player.getCheckSet().getChecks(), this.computer.getShipSet().getShips(), this.computer.getCheckSet().getChecks(), this.memory.getPoints(), this.statistic.get(Entity.PLAYER), this.statistic.get(Entity.COMPUTER));
        localStorage.setItem('__BATTLESHIP__', JSON.stringify(item));
        return this;
    }
    /**
     * load all game data from local storage
     */
    load() {
        const item = JSON.parse(localStorage.getItem('__BATTLESHIP__'));
        if (item) {
            this.state = item.state;
            this.playerMove = item.playerMove;
            this.memory = new PointSet(item.insaneLevelMemory);
            this.player
                .setShipSet(new ShipSet(item.playerShips))
                .setCheckSet(new CheckSet(item.playerChecks));
            this.computer
                .setShipSet(new ShipSet(item.computerShips))
                .setCheckSet(new CheckSet(item.computerChecks));
            this.setStatistic(Entity.PLAYER, item.playerStatistic)
                .setStatistic(Entity.COMPUTER, item.computerStatistic)
                .setMemory(item.insaneLevelMemory);
        }
        else {
            return this.reset();
        }
        return this;
    }
    /**
     * reset all game data in the local storage and in the game
     */
    reset() {
        localStorage.removeItem('__BATTLESHIP__');
        this.playerMove = true;
        this.state = GameState.PREPARATION;
        this.memory = new PointSet();
        this.setStatistic(Entity.COMPUTER, [0, 0, 0, 0, 0, 0, 0])
            .setStatistic(Entity.PLAYER, [0, 0, 0, 0, 0, 0, 0])
            .setMemory([]);
        this.player
            .setCheckSet(new CheckSet())
            .setShipSet(new ShipSet())
            .setSecret(false);
        this.computer
            .setCheckSet(new CheckSet())
            .setShipSet(new ShipSet())
            .setSecret(true)
            .randoming();
        return this;
    }
    /**
     * draw game background grid
     */
    drawGrid() {
        this.canvas.style.background = this.viewMode === ViewMode.DARK ? 'rgb(43,43,43)' : '#dfdfdf';
        this.context.strokeStyle = this.viewMode === ViewMode.DARK ? 'black' : 'blue';
        this.context.lineWidth = this.FIELD_SIZE * 0.5 / 30;
        for (let i = 0; i < this.canvas.width / this.CELL_SIZE; i++) {
            this.context.beginPath();
            this.context.moveTo(i * this.CELL_SIZE, 0);
            this.context.lineTo(i * this.CELL_SIZE, this.canvas.height);
            this.context.stroke();
        }
        for (let i = 0; i < this.canvas.height / this.CELL_SIZE; i++) {
            this.context.beginPath();
            this.context.moveTo(0, i * this.CELL_SIZE);
            this.context.lineTo(this.canvas.width, i * this.CELL_SIZE);
            this.context.stroke();
        }
        this.context.strokeStyle = 'red';
        this.context.lineWidth = this.FIELD_SIZE * 2 / 30;
        this.context.beginPath();
        this.context.moveTo(0, 53);
        this.context.lineTo(this.canvas.width, 53);
        this.context.stroke();
        return this;
    }
    /**
     * draw player's and bot's statistic
     */
    drawStatistic() {
        this.context.textAlign = 'center';
        this.context.font = `${this.FIELD_SIZE}px comic sans`;
        this.context.fillText(`Killed: ${this.statistic.get(Entity.PLAYER)[0]}/10`, this.player.getOffSetX() + this.FIELD_SIZE + 11 * this.FIELD_SIZE / 2 - this.FIELD_SIZE / 2, this.player.getOffSetY() - this.FIELD_SIZE, this.player.getOffSetY() + this.FIELD_SIZE);
        this.context.fillText(`Killed: ${this.statistic.get(Entity.COMPUTER)[0]}/10`, this.computer.getOffSetX() + this.FIELD_SIZE + 11 * this.FIELD_SIZE / 2 - this.FIELD_SIZE / 2, this.computer.getOffSetY() - this.FIELD_SIZE, this.computer.getOffSetY() + this.FIELD_SIZE);
        return this;
    }
    /**
     * draw winner in the end of the game
     * @param text
     * @param winner
     */
    drawWinner(text, winner) {
        this.context.textAlign = 'center';
        this.context.fillStyle = 'red';
        this.context.font = `${this.FIELD_SIZE * 1.5}px comic sans`;
        this.context.fillText(`${text} won!`, winner.getOffSetX() + this.FIELD_SIZE + 11 * this.FIELD_SIZE / 2 - this.FIELD_SIZE / 2, winner.getOffSetY() - this.FIELD_SIZE, winner.getOffSetY() + this.FIELD_SIZE);
        return this;
    }
    /**
     * clear canvas
     */
    clearCanvas() {
        this.canvas.width |= 0;
        return this;
    }
    /**
     * set difficulty and save it in the local storage
     * @param difficulty
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        localStorage.setItem("__BS_DIFFICULTY__", JSON.stringify(this.difficulty));
        return this;
    }
    /**
     * get current game state
     */
    getState() {
        return this.clone(this.state);
    }
    /**
     * get current game view
     */
    getViewMode() {
        return this.clone(this.viewMode);
    }
    /**
     * set game view
     * @param view
     */
    setViewMode(view) {
        this.viewMode = view;
        return this;
    }
    /**
     * get copy of player instance
     */
    getPlayer() {
        return this.player.clone();
    }
    /**
     * get copy of bot instance
     */
    getComputer() {
        return this.computer.clone();
    }
    /**
     * set entity's statistic
     * @param entity
     * @param s
     */
    setStatistic(entity, s) {
        this.statistic.set(entity, s);
        return this;
    }
    /**
     * set player's move
     * @param move
     */
    setPlayerMove(move) {
        this.playerMove = move;
        return this;
    }
    /**
     * set memory for insane level bot
     * @param insaneLevelMemory
     */
    setMemory(insaneLevelMemory) {
        this.memory.setPointSet(insaneLevelMemory);
        return this;
    }
    /**
     * update player's and bot's statistic depending on checks
     * @param entity
     * @param checksSize
     * @param killed
     */
    updateStatistic(entity, checksSize, killed) {
        const newStatistic = this.statistic.get(entity);
        if (killed) {
            newStatistic[5] -= checksSize;
            newStatistic[6] += checksSize;
            newStatistic[checksSize] += 1;
            newStatistic[0] += 1;
        }
        else {
            newStatistic[5] += checksSize;
        }
        return this.setStatistic(entity, newStatistic);
    }
    /**
     * generate random ships positions for player
     */
    randomingPlayer() {
        this.player.randoming();
        return this;
    }
    /**
     * clone function for making copy
     * @param obj
     */
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
}
//# sourceMappingURL=Game.js.map