///<reference path="script.ts"/>
/**
 * Util class that is responsible for managing all mouse and keyboard stuff.
 * This class store all data about player's mouse
 * mouse move
 * mouse down
 * mouse up
 * keyboard space button
 */
class Mouse extends Point {
    private element:HTMLElement; // canvas html element
    public s:number; // number that is responsible for ship direction depending on space button
    public left:number; // mouse down/up click
    public tmpLeft:number; // tmp mouse click

    constructor(element: HTMLElement) {
        super(null,null);
        this.element = element;

        this.element.addEventListener('mousemove',  function (event) {
            const rect = element.getBoundingClientRect();
            this.x = event.clientX - rect.left;
            this.y = event.clientY - rect.top;
        }.bind(this));

        //for touchscreen
        this.element.addEventListener('touchmove',  function (event) {
            const rect = element.getBoundingClientRect();
            this.x = event.clientX - rect.left;
            this.y = event.clientY - rect.top;
        }.bind(this));

        this.element.addEventListener('mousedown', function() {
            if(game.getPlayer().isPointUnder(new Point(this.x, this.y)) || game.getComputer().isPointUnder(new Point(this.x, this.y))) {
                this.left = true;
            }
        }.bind(this));

        //for touchscreen
        this.element.addEventListener('touchstart', function() {
            if(game.getPlayer().isPointUnder(new Point(this.x, this.y)) || game.getComputer().isPointUnder(new Point(this.x, this.y))) {
                this.left = true;
            }
        }.bind(this));

        this.element.addEventListener('mouseup', function() {
            if(game.getPlayer().isPointUnder(new Point(this.x, this.y)) || game.getComputer().isPointUnder(new Point(this.x, this.y))) {
                this.left = false;
            }
        }.bind(this));

        //for touchscreen
        this.element.addEventListener('touchend', function() {
            if(game.getPlayer().isPointUnder(new Point(this.x, this.y)) || game.getComputer().isPointUnder(new Point(this.x, this.y))) {
                this.left = false;
            }
        }.bind(this));

        document.addEventListener('keypress', function(event)  {
            if(event.keyCode === 32 && game.getPlayer().isPointUnder(new Point(this.x, this.y))) {
                this.s = !this.s;
            }
        }.bind(this));

    }
}
