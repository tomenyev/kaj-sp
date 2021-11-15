///<reference path="Utils.ts"/>
class Topology {
    constructor(entity, offSetX, offSetY, secret) {
        this.entity = entity;
        this.offSetX = offSetX;
        this.offSetY = offSetY;
        this.secret = secret || false;
        this.shipSet = new ShipSet();
        this.checkSet = new CheckSet();
    }
    /**
     * return true if player's mouse is under right field
     * @param point
     */
    isPointUnder(point) {
        return (point.x >= this.offSetX + game.FIELD_SIZE &&
            point.x <= this.offSetX + 11 * game.FIELD_SIZE &&
            point.y >= this.offSetY + game.FIELD_SIZE &&
            point.y <= this.offSetY + 11 * game.FIELD_SIZE);
    }
    /**
     * convert x,y coords to check
     * return player's check  depending on mouse coords on bot's field 10x10 checks.
     * @param point
     */
    getCoordinats(point) {
        return (!this.isPointUnder(point)) ? null :
            new Check(Math.floor(Math.max(0, Math.min(9, ((point.x - this.offSetX) - game.FIELD_SIZE) / game.FIELD_SIZE))), Math.floor(Math.max(0, Math.min(9, ((point.y - this.offSetY) - game.FIELD_SIZE) / game.FIELD_SIZE))), CheckType.CHECKED);
    }
    /**
     * return true if ship given ship can stay on player's grid
     * @param ship
     */
    canStay(ship) {
        if ((ship.direct === 0 && (ship.x + ship.size) > 10) || (ship.direct === 1 && (ship.y + ship.size) > 10)) {
            return false;
        }
        const map = [
            [true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true, true, true]
        ];
        for (const ship of this.shipSet.getShips()) {
            if (ship.direct === 0) {
                for (let x = ship.x - 1; x < ship.x + ship.size + 1; x++) {
                    for (let y = ship.y - 1; y < ship.y + 2; y++) {
                        if (map[y] && map[y][x]) {
                            map[y][x] = false;
                        }
                    }
                }
            }
            else {
                for (let x = ship.x - 1; x < ship.x + 2; x++) {
                    for (let y = ship.y - 1; y < ship.y + ship.size + 1; y++) {
                        if (map[y] && map[y][x]) {
                            map[y][x] = false;
                        }
                    }
                }
            }
        }
        if (ship.direct === 0) {
            for (let i = 0; i < ship.size; i++) {
                if (!map[ship.y][ship.x + i]) {
                    return false;
                }
            }
        }
        else {
            for (let i = 0; i < ship.size; i++) {
                if (!map[ship.y + i][ship.x]) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * generate random ships positions
     */
    randoming() {
        this.shipSet.setShips([]);
        for (let size = 4; size > 0; size--) {
            for (let n = 0; n < 5 - size; n++) {
                const ship = {
                    x: Math.floor(Math.random() * 10),
                    y: Math.floor(Math.random() * 10),
                    direct: Math.random() > Math.random() ? 0 : 1,
                    size: size
                };
                if (this.canStay(ship)) {
                    this.addShips(ship);
                }
                else {
                    n--;
                }
            }
        }
        return this;
    }
    /**
     * update checks, change check type depending on grid position and enemies ships.
     */
    update() {
        const map = [
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false]
        ];
        for (const ship of this.shipSet.getShips()) {
            if (ship.direct === 0) {
                for (let x = ship.x; x < ship.x + ship.size; x++) {
                    if (map[ship.y] && !map[ship.y][x]) {
                        map[ship.y][x] = true;
                    }
                }
            }
            else {
                for (let y = ship.y; y < ship.y + ship.size; y++) {
                    if (map[y] && !map[y][ship.x]) {
                        map[y][ship.x] = true;
                    }
                }
            }
        }
        this.checkSet.getChecks().forEach(check => {
            if (map[check.y][check.x] && check.type === CheckType.CHECKED) {
                this.checkSet.changeToInjured(this, new Check(check.x, check.y, CheckType.CHECKED));
                game.updateStatistic(this.entity, 1, false);
            }
        });
        const injuredChecks = new CheckSet();
        injuredChecks.add(...this.checkSet.getInjuredChecks());
        let killedBuffer = [];
        for (let ship of this.shipSet.getShips()) {
            for (let i = 0; i < ship.size; i++) {
                if (ship.direct === 0) {
                    if (injuredChecks.contains(new Check(ship.x + i, ship.y, CheckType.INJURED))) {
                        killedBuffer.push(new Check(ship.x + i, ship.y, CheckType.INJURED));
                    }
                    else {
                        killedBuffer = [];
                        break;
                    }
                }
                else {
                    if (injuredChecks.contains(new Check(ship.x, ship.y + i, CheckType.INJURED))) {
                        killedBuffer.push(new Check(ship.x, ship.y + i, CheckType.INJURED));
                    }
                    else {
                        killedBuffer = [];
                        break;
                    }
                }
                if (killedBuffer.length === ship.size) {
                    this.checkSet.changeToKilled(this, ...killedBuffer);
                    game.updateStatistic(this.entity, killedBuffer.length, true);
                    killedBuffer = [];
                }
            }
        }
        return this;
    }
    /**
     * manage draw process
     * @param context
     */
    draw(context) {
        this.drawFields(context);
        if (!this.secret) {
            for (let ship of this.shipSet.getShips()) {
                this.drawShip(context, ship);
            }
        }
        for (let check of this.checkSet.getChecks()) {
            this.drawCheck(context, check);
        }
        return this;
    }
    /**
     * draw game fields
     * @param context
     */
    drawFields(context) {
        context.lineWidth = game.FIELD_SIZE * 1.7 / 30;
        context.strokeStyle = game.getViewMode() === ViewMode.DARK ? '#f4f3f3' : 'blue';
        for (let i = 1; i <= 11; i++) {
            context.beginPath();
            context.moveTo(this.offSetX + i * game.FIELD_SIZE, this.offSetY);
            context.lineTo(this.offSetX + i * game.FIELD_SIZE, this.offSetY + 11 * game.FIELD_SIZE);
            context.stroke();
        }
        for (let i = 1; i <= 11; i++) {
            context.beginPath();
            context.moveTo(this.offSetX, this.offSetY + i * game.FIELD_SIZE);
            context.lineTo(this.offSetX + 11 * game.FIELD_SIZE, this.offSetY + i * game.FIELD_SIZE);
            context.stroke();
        }
        const ALPHABET = "ABCDEFGHIJ";
        context.textAlign = 'center';
        context.fillStyle = game.getViewMode() === ViewMode.LIGHT ? 'black' : '#dfdfdf';
        context.font = `${game.FIELD_SIZE * 20 / 30}px comic sans`;
        for (let i = 0; i < 10; i++) {
            const letter = ALPHABET[i];
            context.fillText(letter, this.offSetX + i * game.FIELD_SIZE + 1.5 * game.FIELD_SIZE, this.offSetY + game.FIELD_SIZE * 0.7);
        }
        for (let i = 0; i <= 9; i++) {
            context.fillText(String(i + 1), this.offSetX + game.FIELD_SIZE * 0.5, this.offSetY + i * game.FIELD_SIZE + 1.7 * game.FIELD_SIZE);
        }
        return this;
    }
    /**
     * draw ships on players grids
     * @param context
     * @param ship
     */
    drawShip(context, ship) {
        context.fillStyle = game.getViewMode() === ViewMode.LIGHT ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.75)';
        context.beginPath();
        context.rect(this.offSetX + ship.x * game.FIELD_SIZE + game.FIELD_SIZE + 2, this.offSetY + ship.y * game.FIELD_SIZE + game.FIELD_SIZE + 2, (ship.direct === 0 ? ship.size : 1) * game.FIELD_SIZE - 4, (ship.direct === 1 ? ship.size : 1) * game.FIELD_SIZE - 4);
        context.fill();
        return this;
    }
    /**
     * draw checks on players grids
     * @param context
     * @param check
     */
    drawCheck(context, check) {
        if (check.type === CheckType.INJURED) {
            this.drawInjury(context, check);
            return this;
        }
        if (check.type === CheckType.KILLED) {
            this.drawKilled(context, check);
            return this;
        }
        if (check.type === CheckType.CHECKED) {
            context.fillStyle = game.getViewMode() === ViewMode.LIGHT ? 'black' : 'white';
            context.beginPath();
            context.arc(this.offSetX + check.x * game.FIELD_SIZE + game.FIELD_SIZE * 1.5, this.offSetY + check.y * game.FIELD_SIZE + game.FIELD_SIZE * 1.5, game.FIELD_SIZE * 3 / 30, 0, Math.PI * 2);
            context.fill();
        }
        return this;
    }
    /**
     * draw infured checks on players grids
     * @param context
     * @param injury
     */
    drawInjury(context, injury) {
        context.strokeStyle = 'red';
        context.lineWidth = game.FIELD_SIZE * 1.5 / 30;
        context.beginPath();
        context.moveTo(this.offSetX + injury.x * game.FIELD_SIZE + game.FIELD_SIZE, this.offSetY + injury.y * game.FIELD_SIZE + game.FIELD_SIZE);
        context.lineTo(this.offSetX + injury.x * game.FIELD_SIZE + game.FIELD_SIZE * 2, this.offSetY + injury.y * game.FIELD_SIZE + game.FIELD_SIZE * 2);
        context.stroke();
        context.moveTo(this.offSetX + injury.x * game.FIELD_SIZE + game.FIELD_SIZE * 2, this.offSetY + injury.y * game.FIELD_SIZE + game.FIELD_SIZE);
        context.lineTo(this.offSetX + injury.x * game.FIELD_SIZE + game.FIELD_SIZE, this.offSetY + injury.y * game.FIELD_SIZE + game.FIELD_SIZE * 2);
        context.stroke();
        return this;
    }
    /**
     * draw killed checks on players grids
     * @param context
     * @param killed
     */
    drawKilled(context, killed) {
        context.strokeStyle = 'red';
        context.lineWidth = game.FIELD_SIZE * 2 / 30;
        context.beginPath();
        context.moveTo(this.offSetX + killed.x * game.FIELD_SIZE + game.FIELD_SIZE, this.offSetY + killed.y * game.FIELD_SIZE + game.FIELD_SIZE);
        context.lineTo(this.offSetX + killed.x * game.FIELD_SIZE + game.FIELD_SIZE * 2, this.offSetY + killed.y * game.FIELD_SIZE + game.FIELD_SIZE * 2);
        context.stroke();
        context.moveTo(this.offSetX + killed.x * game.FIELD_SIZE + game.FIELD_SIZE * 2, this.offSetY + killed.y * game.FIELD_SIZE + game.FIELD_SIZE);
        context.lineTo(this.offSetX + killed.x * game.FIELD_SIZE + game.FIELD_SIZE, this.offSetY + killed.y * game.FIELD_SIZE + game.FIELD_SIZE * 2);
        context.stroke();
        context.beginPath();
        context.lineWidth = game.FIELD_SIZE * 1.5 / 30;
        context.strokeStyle = 'red';
        context.strokeRect(this.offSetX + killed.x * game.FIELD_SIZE + game.FIELD_SIZE, this.offSetY + killed.y * game.FIELD_SIZE + game.FIELD_SIZE, game.FIELD_SIZE, game.FIELD_SIZE);
        return this;
    }
    /**
     * get all ships
     */
    getShipSet() {
        return this.shipSet;
    }
    /**
     * get all checks
     */
    getCheckSet() {
        return this.checkSet;
    }
    /**
     * set ships
     * @param ships
     */
    setShipSet(ships) {
        this.shipSet = ships;
        return this;
    }
    /**
     * set checks
     * @param checks
     */
    setCheckSet(checks) {
        this.checkSet = checks;
        return this;
    }
    /**
     * add ships or ship
     * @param ships
     */
    addShips(...ships) {
        this.shipSet.add(...ships);
        return this;
    }
    /**
     * add check or checks
     * @param checks
     */
    addChecks(...checks) {
        this.checkSet.add(...checks);
        return this;
    }
    /**
     * set secret
     * @param secret
     */
    setSecret(secret) {
        this.secret = secret;
        return this;
    }
    /**
     * get off set x
     */
    getOffSetX() {
        return this.offSetX;
    }
    /**
     * get off set y
     */
    getOffSetY() {
        return this.offSetY;
    }
    /**
     * clone function for making copy
     */
    clone() {
        return new Topology(this.entity, this.offSetX, this.offSetY, this.secret)
            .setCheckSet(this.checkSet.clone())
            .setShipSet(this.shipSet.clone());
    }
}
//# sourceMappingURL=Topology.js.map