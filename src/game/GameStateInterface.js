import {get} from 'svelte/store'
import {GameStateStore} from "./GameStore"
// import {evaluateBoard, submitWord, newGame, loadGame, updateGameImagePreview} from "../logic/game"
import {submitWord, newGame, loadGame, updateGameImagePreview} from "../logic/game"

const getEmptyRackSlote = (GSS) => {
    const occupied_slot = GSS.letters.filter(e=>!e.board).map(e=>e.index)
    return Array(7).fill(0).map((e,i)=>i).filter(e=>occupied_slot.indexOf(e) === -1)
}
export const addNewLettersToRack = (letters) => {
    const GSS = get(GameStateStore)
    const empty_slot = getEmptyRackSlote(GSS)
    let k = -1
    letters.map(e=>{
        k++
        GameStateStore.addLetter( { ...e,
            index: empty_slot[k],
            board: false,
            free: true,
        })
    })
    GameStateStore.addNewLetterFlag()
}

export const moveAllFreeLettersToRack = () => {
    const GSS = get(GameStateStore)
    const empty_slot = getEmptyRackSlote(GSS)
    let k = -1
    GSS.letters.filter(e=>e.board && e.free).map(e=>{
        k++
        GameStateStore.moveLetter(e.id, false, empty_slot[k])
        GameStateStore.setJoker(e.id, "")
    })
    GameStateStore.setEvaluation(false)
}

export const unsetGame = () => GameStateStore.init(null)

export const setGame = (id, player_id, round, n_letters_left, players, board, rack, history) => {
    const GSS = get(GameStateStore)
    if (GSS === null) {
        rack = rack.map((e, i) => {
            e.index = i
            return e
        })
        GameStateStore.init({
            id: id,
            player_id: player_id,
            round: round,
            letters_left: n_letters_left,
            players: players,
            letters: [...board, ...rack],
            molangeur: {next_score: 0, current_words: null, next_words: null},
            history: history,
        })
        GameStateStore.setNeedForNewImagePreview()
    } else {
        const empty_slot = getEmptyRackSlote(GSS)
        const board_letters_indices = board.map(e=>e.index)
        board.map(e=>{
            // verify that it exists 
            if (GSS.letters.filter(l=>l.id===e.id).length !== 1) {
                throw "A letter that should exist, doesn't..."
                // GameStateStore.addLetter(e)
            }
            // fix them and move them (FIXME: do I need to move it?)
            // FIXME: weird stuff happening here... Should match the 
            // what is comming more closely... and not rely on what's 
            // already existing so much...
            GameStateStore.fixLetter(e.id)
            GameStateStore.moveLetter(e.id, true, e.index)
        })
        let k = 0
        rack.map(e=> {
            // if the letter already exists, 
            if (GSS.letters.filter(l=>l.id===e.id).length === 1) { 
                // and is on the board on an occupied spot
                // if (e.board && board_letters_indices.indexOf(e.index) !== -1) {
                if (e.board && board_letters_indices.indexOf(e.index) !== -1) {
                    // move it back to the rack
                    GameStateStore.moveLetter(e.id, false, empty_slot[k])
                    GameStateStore.setJoker(e.id, "")
                    k++
                }
            } else {// if letter's doesn't exist add it
                // add it in the rack
                e.index = empty_slot[k]
                e.board = false
                e.free = true
                GameStateStore.addLetter(e)
                k++
            }
        })
        GameStateStore.setPlayers(players)
        // console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", history)
        // console.log("setHistory", history)
        GameStateStore.setHistory(history)
        GameStateStore.setEvaluation(false)
        GameStateStore.setRound(round)
        GameStateStore.setNeedForNewImagePreview()
        GameStateStore.setLettersLeft(n_letters_left)
    }
}

export const resetMolangeur = () => {
    GameStateStore.setMolangeur({
        next_score: null,
        current_words: null,
        next_words: null,
        searching: true, 
    })
}
export const updateMolangeur = (words=null) => {
    const GSS = get(GameStateStore)
    if (words) {
        GameStateStore.setMolangeur({
            next_score: words[0].pts,
            current_words: GSS.molangeur.next_words,
            next_words: words,
            searching: false, 
        })
    } else {
        GameStateStore.setMolangeur({
            next_score: null,
            current_words: null,
            next_words: GSS.molangeur.next_words,
            searching: true, 
        })
    }
}

export const askForNewGame = () => {
    newGame()
}

export const setupGame = (id) => {
    if (!id) {
        newGame()
    } else {
        loadGame(id)
    }
}

// export const askBoardEvaluation = () => {
//     const GSS = get(GameStateStore)
//     const free_letters_on_board = GSS.letters.filter(e=>e.board && e.free)
//     const fixed_letters_on_board = GSS.letters.filter(e=>e.board && !e.free)
//     const evaluation = evaluateBoard(fixed_letters_on_board, free_letters_on_board)
//     GameStateStore.setEvaluation(evaluation)
// }

export const askForWordSubmission = (id, player_id) => {
    const GSS = get(GameStateStore)
    const free_letters_on_board = GSS.letters.filter(e=>e.board && e.free)
    submitWord(id, player_id, free_letters_on_board, GSS.molangeur)
}

export const newGameImagePreviewUpdate = (id, image_data) => {
    updateGameImagePreview(id, image_data)
}
export const gameOver = () => {
    GameStateStore.setNeedForNewImagePreview()
    GameStateStore.setGameOver()
}