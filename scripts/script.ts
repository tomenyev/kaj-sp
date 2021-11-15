///<reference path="Game.ts"/>
///<reference path="AudioManager.ts"/>
/**
 * Enum for aside menu control buttons
 */
enum ControlButton {
    NEWGAME="New game",
    GENERATE="Generate"
}

// change view function for checkbox click event that save view mode to the local storage
const changeView =  () => {
    game.setViewMode(game.getViewMode() === ViewMode.DARK ? 0 : 1);
    localStorage.setItem('__BS_VIEW_MODE__', JSON.stringify(game.getViewMode()));
};

// all needed html elements
const canvas = document.querySelector('canvas');
const main = document.getElementById('main');
const mainSection = document.getElementById('main-section');
const aside = document.getElementById('aside-menu');
const view = document.getElementById('toggle_checkbox');
const controlButtons = document.getElementById('control-buttons-section');
const settingsButtons = document.getElementById('settings-buttons-section');
const sound = document.getElementById('sound');

//game instance
let game = new Game(
    canvas,
    (mainSection.clientWidth > 750 ) ? mainSection.clientWidth - aside.clientWidth : main.clientWidth,
    main.clientHeight
);

// audio manager instance
// @ts-ignore
let audioManager = new AudioManager(document.getElementById('audio'), document.getElementById('playlist'));

//view checkbox event listener
view.addEventListener('click', changeView);

// set correct view mode for check box
if (game.getViewMode() === ViewMode.DARK) {
    view.removeEventListener('click',changeView);
    view.click();
    view.addEventListener('click', changeView);
}

//set right game state depending on control buttons in the aside menu
controlButtons.addEventListener('click', (event) => {
    // @ts-ignore
    switch (event.target.value) {
        case ControlButton.NEWGAME:
            game.reset();
            break;
        case ControlButton.GENERATE:
            if(game.getState() === GameState.PREPARATION) {
                game.randomingPlayer();
            }
            break;
        default:
            break;
    }
});

// set right game difficulty depending on aside menu difficulty buttons
settingsButtons.addEventListener('click', (event) => {
    settingsButtons.childNodes.forEach(e => {
        // @ts-ignore
        if(e.classList != undefined) {
            // @ts-ignore
            e.classList.remove('active');
        }
    });
    // @ts-ignore
    event.target.classList.add('active');
    // @ts-ignore
    game.setDifficulty(event.target.value);
});

//set right sound/mute button url and difficulty level active button depending on local storage on page load
window.addEventListener('load', () => {
    let mute = !JSON.parse(localStorage.getItem('__BS_SOUND__')) || false;
    if(mute) {
        sound.setAttribute('src', 'img/mute.png');
        sound.dataset.state = "mute";
    } else {
        sound.setAttribute('src', 'img/sound.png');
        sound.dataset.state = "sound";
    }

    document.getElementById(JSON.parse(localStorage.getItem('__BS_DIFFICULTY__')) || Difficulty.INSANE).classList.add('active');
});

// resize game canvas on page resize
window.addEventListener('resize', () =>
    game = new Game(
        canvas,
        (mainSection.clientWidth > 750 ) ? mainSection.clientWidth - aside.clientWidth : main.clientWidth,
        main.clientHeight
    ));


// change sound/mute settings in the game and save them to local storage
sound.addEventListener('click', () => {
    switch (sound.dataset.state) {
        case "sound":
            sound.setAttribute('src', 'img/mute.png');
            sound.dataset.state = "mute";
            localStorage.setItem('__BS_SOUND__', JSON.stringify(false));
            break;
        case "mute":
            sound.setAttribute('src', 'img/sound.png');
            sound.dataset.state = "sound";
            localStorage.setItem('__BS_SOUND__', JSON.stringify(true));
            break;
    }
});





