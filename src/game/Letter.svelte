<script>
    //FIXME: this component should be called GameLetters and LetterLook should simply be called Letter
    import {LETTERS} from "../logic/constants"
    // import {askBoardEvaluation} from "./GameStateInterface"
    // import {checkBoard} from "../logic/molangeur"
    import {GameStateStore, GameGimmickStore} from "./GameStore"
    import RM from "./RackMovements"
    import LetterLook from "./LetterLook.svelte"

    import {soundDropBoard, soundDropRack} from "./sound"

    // import * as Tone from "tone"
   
    export let game
    export let letter

    $:free = letter.free
    $:board = letter.board
    $:grab = false

    $:is_joker = letter.letter === "_"
    
    let location;
    let grab_position = {x: null, y:null}
    let self;

    const handleEvent = (e) => {
        if (e.touches) {
            e.preventDefault && e.preventDefault()
            e.stopImmediatePropagation && e.stopImmediatePropagation();
            e.stopPropagation && e.stopPropagation();
            return e.touches[0]
        } else {
            return e
        }
    }
    
    const dragStart = (e) => {
        let E = handleEvent(e)
        window.addEventListener("mousemove", dragMove)
        window.addEventListener("touchmove", dragMove, {passive: false})
        window.addEventListener("mouseup", dragEnd)
        window.addEventListener("touchend", dragEnd)
        window.addEventListener("touchstart", handleEvent, {passive: false})
        grab = true;
        grab_position = game.getXY(E)
        location = game.getLocation(E)
        RM.init($GameStateStore.letters.filter(e=>!e.board), $GameStateStore.letters.filter(e=>e.id===letter.id)[0])
        GameGimmickStore.setHoverLocation(location)
    }
    const dragMove = (e) => {
        // if (grab) {
            let E = handleEvent(e)
            grab_position = game.getXY(E)
            location = game.getLocation(E)
            if (!location.board && location.index !== undefined) {
                RM.update(location.index)
            } else {
                RM.reset()
            }
            GameGimmickStore.setHoverLocation(location)
        // }
    }
    const dragEnd = (e) => {
        handleEvent(e)
        window.removeEventListener("mousemove", dragMove)
        window.removeEventListener("touchmove", dragMove)
        window.removeEventListener("mouseup", dragEnd)
        window.removeEventListener("touchend", dragEnd)
        window.removeEventListener("touchstart", handleEvent)
        if (!location.board && location.index !== undefined) { // if dropped on rack
            // update the rack letters' positions
            const new_rack_location = RM.get()
            new_rack_location.map(e=> {
                GameStateStore.moveLetter(e.id, false, e.index)
            })
        }
        if (location.index !== undefined) { // if dropped location is valid
            if (is_joker) { // if the letter is a joker
                if (location.board && $GameStateStore.letters.filter(e=>e.id===letter.id)[0].joker === "") { // if dropped on board and has no joker letter
                    GameStateStore.setJokerPicker(letter, true) // activate joker picker
                } else if (!location.board) { // if dropped on rack
                    GameStateStore.setJoker(letter.id, "") // unset the joker letter
                }
            } 
            // in all valid cases, update the letter location
            GameStateStore.moveLetter(letter.id, location.board, location.index) 
            // and ask for a new board ask for a new board evaluation
            // askBoardEvaluation()
            location.board ? soundDropBoard() : soundDropRack()
        }
        grab = false;
        GameGimmickStore.setHoverLocation(null)
    }


    $: classes = (grab ? " grab" : "") + (!board ? " rack" : " board") + (free ? " free" : "") + (is_joker ? " isjoker" : "")
    $: on_mouse_down_callback = (free && !grab ? dragStart : null)
    $: styles=`--x:${grab_position.x}px; --y:${grab_position.y}px;`
    $: {
        if (grab) {
            styles=`--x:${grab_position.x}px; --y:${grab_position.y}px;`
        } else {
            if (board) {
                styles=`--x:${game.getBoardXY(letter.index).x}; --y:${game.getBoardXY(letter.index).y};`
            } else {
                styles=`--pos:${game.getRackPos(letter.index)};`
            }
        }
    }

    const preventScrolling = (e)=>{
            console.log("scroll_attempt")
            e.preventDefault && e.preventDefault()
            e.stopImmediatePropagation && e.stopImmediatePropagation();
            e.stopPropagation && e.stopPropagation();
    }
</script>
{#if free && !grab}
<div class={"prevent-scroll "+classes} style={styles} on:touchstart={preventScrolling}>

</div>
{/if}
<LetterLook 
letter={is_joker? letter.joker : letter.letter}
value={LETTERS[letter.letter].pts}
id={letter.id}
classes={classes}
styles={styles}
self={self}
on_mousedown={on_mouse_down_callback}
/>


<style>
    .prevent-scroll {
        position: absolute;
        
        z-index: 0;
    }
    .board {
        /* background-color: rgba(255, 0, 0, 0.425); */
        background-color: transparent;
        --F: 1;
        width: calc(var(--S) * 2);
        height: calc(var(--S) * 2);

        top: calc(var(--S) * var(--y) - var(--S) * 0.5);
        left: calc(var(--S) * var(--x) - var(--S) * 0.5);
    }
    .rack {
        /* background-color: rgba(21, 255, 0, 0.425); */
        background-color: transparent;

        --F: 2;
        width: calc(var(--S) * 3);
        height: calc(var(--S) * 2.75);

        top: calc(var(--S) * 15.2  - var(--S) / 2);
        left: calc((var(--S) * 2.1) * var(--pos) + var(--S) * 0.2 - var(--S) / 2);
    }
</style>