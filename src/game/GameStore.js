import {writable} from "svelte/store";

const createGameStateStore = () => {

    // initialize game state
    const {subscribe, set, update} = writable(null)
    // const myUpdate = (e)=> {
    //     update(e)
        
    // }
    const isBoardCellEmpty = (letters, index) => {
        return letters.filter(ltr=>ltr.board && ltr.index === index).length === 0
    }
    const moveLetter = (id, board, index) => {
        update(state => {
            if (board && !isBoardCellEmpty(state.letters, index)) return state
            state.letters = state.letters.map(ltr => {
                if (ltr.id === id) {
                    ltr.index = index
                    ltr.board = board
                }
                return ltr
            })
            return state
        })
    }
    const addLetter = (letter) => {
        update(state => {
            state.letters = [...state.letters, letter]
            return state
        })
    }
    // FIXME: this should be a NewStateFlag or something...
    const addNewLetterFlag = () => {
        update(state => {
            state.new_letters = true;
            return state
        })
    }
    const removeNewLetterFlag = () => {
        update(state => {
            state.new_letters = false;
            return state
        })
    }

    const setJoker = (id, letter) => {
        console.log(id)
        console.log(letter)
        update(state => {
            state.letters = state.letters.map(e=>{
                if (e.id === id && e.letter === "_") {
                    console.log(letter)
                    console.log(e)
                    e.joker = letter
                }
                return e
            })
            return state;
        })
    }

    const setJokerPicker = (letter, active=false) =>{
        update(state => {
            state.jocker_picker = active
            state.jocker_picker_letter = {...letter}
            return state
        })
    }

    const fixLetter = (id) => {
        update(state=>{
            state.letters = state.letters.map(e=>{
                if (e.id === id) {
                    e.free = false
                }
                return e
            })
            return state
        })
    }

    const setPlayers = (players) => {
        update(state => {
            state.players = players
            return state;
        })
    }

    const setMolangeur = (molangeur) => {
        update(state => {
            state.molangeur = molangeur
            return state;
        })
    }
    const setEvaluation = (evaluation) => {
        update(state => {
            state.evaluation = evaluation
            return state
        })
    }
    const setGameOver = () => {
        update(state => {
            state.game_over = true
            return state
        })
    }
    return {
        subscribe,
        init: set,

        moveLetter,
        addLetter,
        setJoker,
        fixLetter,

        setPlayers,
        setMolangeur,

        setJokerPicker,
        addNewLetterFlag,
        removeNewLetterFlag,

        setEvaluation,
        setGameOver,
    }

}

// const createActionStore = ()=>{
//     // initialize game state
//     const {subscribe, set, update} = writable({
//         moving_board_letter
//     })


//     return {
//         subscribe,
//         init: set,
//         moveLetter,
//         addLetter,
//     }

// }

const createGameGimmickStore = () => {

    // initialize game state
    const {subscribe, set, update} = writable({
        temp_letters: []
    })

    const setTempLetters = (temp_letters) => {
        update(state=>{
            state.temp_letters = temp_letters
            return state
        })
    }
    return {
        subscribe,
        init: set,
        setTempLetters
    }
}

const GameStateStore = createGameStateStore()
const GameGimmickStore = createGameGimmickStore()

export {GameStateStore, GameGimmickStore}