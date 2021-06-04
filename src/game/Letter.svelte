<script>
    //FIXME: this component should be called GameLetters and LetterLook should simply be called Letter
    import {LETTERS} from "../logic/constants"
    import {askBoardEvaluation} from "./GameStateInterface"
    import {GameStateStore} from "./GameStore"
    import RM from "./RackMovements"
    import LetterLook from "./LetterLook.svelte"
   
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
            e.preventDefault()
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
        grab = true;
        grab_position = game.getXY(E)
        location = game.getLocation(E)
        RM.init($GameStateStore.letters.filter(e=>!e.board), $GameStateStore.letters.filter(e=>e.id===letter.id)[0])
    }
    const dragMove = (e) => {
        if (grab) {
            let E = handleEvent(e)
            grab_position = game.getXY(E)
            location = game.getLocation(E)
            if (!location.board && location.index !== undefined) {
                RM.update(location.index)
            } else {
                RM.reset()
            }
        }
    }
    const dragEnd = (e) => {
        console.log("drag_end")
        console.log("location", location)
        console.log("is_joker", is_joker)
        console.log("$GameStateStore.letters.filter(e=>e.id===letter.id)",  $GameStateStore.letters.filter(e=>e.id===letter.id))
        e.preventDefault()
        window.removeEventListener("mousemove", dragMove)
        window.removeEventListener("touchmove", dragMove)
        window.removeEventListener("mouseup", dragEnd)
        window.removeEventListener("touchend", dragEnd)
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
                    console.log("setjoker", $GameStateStore)
                    GameStateStore.setJokerPicker(letter, true) // activate joker picker
                } else if (!location.board) { // if dropped on rack
                    GameStateStore.setJoker(letter.id, "") // unset the joker letter
                }
            } 
            // in all valid cases, update the letter location
            GameStateStore.moveLetter(letter.id, location.board, location.index) 
            // and ask for a new board ask for a new board evaluation
            console.log("askBoardEvaluation")
            askBoardEvaluation()
        }
        grab = false;
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

</script>

<LetterLook 
letter={is_joker? letter.joker : letter.letter}
value={LETTERS[letter.letter].pts}
id={letter.id}
classes={classes}
styles={styles}
self={self}
on_mousedown={on_mouse_down_callback}
/>
