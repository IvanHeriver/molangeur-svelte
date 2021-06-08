import {get} from 'svelte/store'
import {GameStateStore} from "./GameStore"
import {evaluateBoard, onWordSubmission, newGame, loadGame} from "../logic/game"

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

// This is an accessor needed in the game logic
// FIXME: this should not be needed
export const getLetters = () => get(GameStateStore).letters

export const resetGame = (id) => {
    GameStateStore.init({
        id: id,
        letters: [],
        molangeur: {
            // score: 0,
            next_score: 0,
            current_words: null,
            next_words: null,
        },
        players: [],
        round: 0
    })
}
export const setGame = (game) => {
    console.log(game)
    GameStateStore.init({
        id: game.id,
        letters: game.letters,
        molangeur: {
            // score: game.molangeur,
            next_score: 0,
            current_words: null,
            next_words: null,
        },
        players: game.players,
        round: game.round
    })
}

export const updateGame = (game) => {
    const GSS = get(GameStateStore)
    const empty_slot = getEmptyRackSlote(GSS)
    const board_letters_indices = game.board.map(e=>e.index)
    game.board.map(e=>{
        // verify that it exists 
        if (GSS.letters.filter(l=>l.id===e.id).length !== 1) {
            throw "A letter that should exist, doesn't..."
            // GameStateStore.addLetter(e)
        }
        // fix them and move them 
        GameStateStore.fixLetter(e.id)
        GameStateStore.moveLetter(e.id, true, e.index)
    })
    let k = 0
    game.rack.map(e=> {
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
    GameStateStore.setPlayers(game.players)
    GameStateStore.setEvaluation(false)
    GameStateStore.setRound(game.round)
}
// FIXME: obsolete?
export const updatePlayer = (players) => {
    GameStateStore.setPlayers(players)
}

export const updateMolangeur = (words=null) => {
    const GSS = get(GameStateStore)
    if (words) {
        GameStateStore.setMolangeur({
            // score:  GSS.molangeur.score,
            next_score: words[0].pts,
            current_words: GSS.molangeur.next_words,
            next_words: words,
            searching: false, 
        })
    } else {
        GameStateStore.setMolangeur({
            // score:  GSS.molangeur.score + GSS.molangeur.next_score,
            next_score: GSS.molangeur.next_score,
            current_words: GSS.molangeur.next_words,
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

export const askBoardEvaluation = () => {
    const GSS = get(GameStateStore)
    const free_letters_on_board = GSS.letters.filter(e=>e.board && e.free)
    const evaluation = evaluateBoard(free_letters_on_board)
    GameStateStore.setEvaluation(evaluation)
}

export const askForWordSubmission = (id) => {
    const GSS = get(GameStateStore)
    const free_letters_on_board = GSS.letters.filter(e=>e.board && e.free)
    onWordSubmission(id, free_letters_on_board, GSS.molangeur.next_score)
}

export const gameOver = () => {
    GameStateStore.setGameOver()
}