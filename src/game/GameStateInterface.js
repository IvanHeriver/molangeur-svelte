import {get} from 'svelte/store'
import {GameStateStore} from "./GameStore"
//FIXME: '../logic/*' functions should never be accessed from components, only from here
import {evaluateBoard, onWordSubmission, newGame} from "../logic/game"

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
            score: 0,
            next_score: 0,
            current_words: [],
            next_words: [],
        },
        players: []
    })
    // GameStateStore.init({
    //     letters: [
    //         {id: "123", letter: "Y", index: 52, board: true, free: false},
    //         {id: "456", letter: "E", index: 67, board: true, free: false},
    //         {id: "789", letter: "T", index: 82, board: true, free: false},
    //         {id: "159", letter: "I", index: 97, board: true, free: false},
    //         {id: "918", letter: "S", index: 112, board: true, free: false},
    //         {id: "111", letter: "P", index: 110, board: true, free: false},
    //         {id: "222", letter: "A", index: 111, board: true, free: false},
    //         {id: "333", letter: "V", index: 20, board: true, free: false},
    //         {id: "444", letter: "E", index: 21, board: true, free: false},
    //         {id: "555", letter: "R", index: 22, board: true, free: false},
    //         {id: "666", letter: "S", index: 23, board: true, free: false},
    //     ],
    //     players:[{score:0}]
    // })
    // GameStateStore.init({
    //     letters: [
    //         {id: "123", letter: "D", index: 112, board: true, free: false},
    //         {id: "456", letter: "O", index: 113, board: true, free: false},
    //         {id: "789", letter: "R", index: 114, board: true, free: false},
    //         {id: "159", letter: "T", index: 115, board: true, free: false},
    //         {id: "918", letter: "O", index: 116, board: true, free: false},
    //         {id: "111", letter: "I", index: 117, board: true, free: false},
    //         {id: "222", letter: "R", index: 118, board: true, free: false},
    //         {id: "333", letter: "S", index: 119, board: true, free: false},
    //     ],
    //     players:[{score:0}]
    // })
    // GameStateStore.init({
    //     letters: [
    //         // {id: "333", letter: "V", index: 20, board: true, free: false},
    //         // {id: "444", letter: "E", index: 21, board: true, free: false},
    //         {id: "555", letter: "R", index: 22, board: true, free: false},
    //         // {id: "666", letter: "S", index: 23, board: true, free: false},
    //         {id: "111", letter: "E", index: 37, board: true, free: false},
    //         {id: "222", letter: "V", index: 52, board: true, free: false},
    //         {id: "777", letter: "E", index: 67, board: true, free: false},
            // {id: "888", letter: "N", index: 82, board: true, free: false},
            // {id: "999", letter: "A", index: 97, board: true, free: false},
    //         {id: "123", letter: "I", index: 112, board: true, free: false},
    //         {id: "456", letter: "S", index: 127, board: true, free: false},
    //         {id: "sdfgdsfg", letter: "E", index: 23, board: true, free: false},
    //         {id: "sdsdfds", letter: "V", index: 24, board: true, free: false},
    //         {id: "eeeee", letter: "E", index: 25, board: true, free: false},
    //     ],
    //     players:[{score:0}]
    // })
}

export const updateGame = (game) => {
    const GSS = get(GameStateStore)
    const empty_slot = getEmptyRackSlote(GSS)
    const board_letters_indices = game.board.map(e=>e.index)
    // console.log("GSS", GSS)
    // console.log("empty_slot", empty_slot)
    // console.log("game.rack", game.rack.map(e=>e.id+"#"+e.letter+"#"+e.index))
    game.board.map(e=>{
        // verify that it exists 
        if (GSS.letters.filter(l=>l.id===e.id).length !== 1) {
            throw "A letter that should exist, doesn't..."
        }
        // fix them and move them 
        GameStateStore.fixLetter(e.id)
        GameStateStore.moveLetter(e.id, true, e.index)
    })
    let k = 0
    game.rack.map(e=> {
        // console.log(">>>")
        // console.log(e)
        // console.log(GSS.letters.filter(l=>l.id===e.id))
        // if the letter already exists, 
        if (GSS.letters.filter(l=>l.id===e.id).length === 1) { 
            // console.log("here")
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
            // console.log("there")
            // console.log(k)
            // console.log(empty_slot[k])
            e.index = empty_slot[k]
            e.board = false
            e.free = true
            console.log(e)
            GameStateStore.addLetter(e)
            k++
        }
        // console.log(">k", k)
    })
    // console.log(game.players)
    GameStateStore.setPlayers(game.players)
    GameStateStore.setEvaluation(false)
}
// FIXME: obsolete?
export const updatePlayer = (players) => {
    GameStateStore.setPlayers(players)
}

export const updateMolangeur = (words=null) => {
    const GSS = get(GameStateStore)
    if (words) {
        GameStateStore.setMolangeur({
            score:  GSS.molangeur.score,
            next_score: words[0].pts,
            current_words: GSS.molangeur.next_words,
            next_words: words,
            searching: false, 
        })
    } else {
        GameStateStore.setMolangeur({
            score:  GSS.molangeur.score + GSS.molangeur.next_score,
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
export const askBoardEvaluation = () => {
    const GSS = get(GameStateStore)
    const free_letters_on_board = GSS.letters.filter(e=>e.board && e.free)
    console.log("free_letters_on_board", free_letters_on_board)
    const evaluation = evaluateBoard(free_letters_on_board)
    GameStateStore.setEvaluation(evaluation)
}

export const askForWordSubmission = (id) => {
    const GSS = get(GameStateStore)
    const free_letters_on_board = GSS.letters.filter(e=>e.board && e.free)
    console.log("free_letters_on_board", free_letters_on_board)
    onWordSubmission(id, free_letters_on_board)
}

export const gameOver = () => {
    console.log("game_over")
    GameStateStore.setGameOver()
}