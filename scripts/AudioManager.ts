/**
 * This class is responsible for all audio/sound in the application.
 * Play music from playlist.
 * Play app sound effects.
 */
class AudioManager {

    private readonly audioPlayer:HTMLAudioElement; // audio player html element in index page
    private readonly playlist:HTMLUListElement; // playlist html element in index page

    constructor(audioPlayer:HTMLAudioElement, playlist:HTMLUListElement) {
        this.audioPlayer = audioPlayer;
        this.playlist = playlist;

        // event listener that manage audio player logic
        this.playlist.addEventListener("click", (event) => {

            playlist.childNodes.forEach(e => {
                // @ts-ignore
                if(e.classList != undefined) {
                    // @ts-ignore
                    e.classList.remove('active');
                }
            });

            // @ts-ignore
            event.composedPath().find(e => e.tagName == 'LI').classList.add('active');
            audioPlayer.children.item(0).removeAttribute('src');
            // @ts-ignore
            audioPlayer.children.item(0).setAttribute('src',   `audio/background/track${event.composedPath()[1].id}.mp3`);
            audioPlayer.load();
            audioPlayer.play();
        })
    }
    /**
     * play click sound
     */
    public click():Promise<void> {
        if(this.isSound()) {
            let click = new Audio('audio/sounds/click.mp3');
            click.loop = false;
            return click.play();
        }
    }
    /**
     * play punch sound
     */
    public punch():Promise<void> {
        if(this.isSound()) {
            let punch = new Audio('audio/sounds/punch.mp3');
            punch.loop = false;
            return punch.play();
        }
    }
    /**
     * play sword sound
     */
    public sword():Promise<void> {
        if(this.isSound()) {
            let sword = new Audio('audio/sounds/sword.wav');
            sword.loop = false;
            return sword.play();
        }
    }
    /**
     * return true if app isn't in mute. Depending on localStorage param.
     */
    public isSound():boolean {
        return JSON.parse(localStorage.getItem('__BS_SOUND__'));
    }
}