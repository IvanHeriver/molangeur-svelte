import * as U from "./utils"
import {LETTERS, CELLS} from "./constants"
import * as GSI from "../game/GameStateInterface"
import * as DICO from "./dico"

// let DICO
let bag

let GAME

export const newGame = () => {
    // console.log("newGame")
    GAME = {
        bag: createBag(),
        board: [],
        players: [{
            id: Math.random().toString().slice(2),
            rack: [],
            score: 0,
        }],
        round: 0
    }
    GSI.resetGame(GAME.players[0].id)
    const drawing_result = drawLetters(GAME.bag, GAME.players[0].rack, GAME.round)
    GAME.players[0].rack = drawing_result.letters
    console.log("++++++++++++++++++++")
    console.log(GAME.bag)
    console.log(drawing_result.bag)
    console.log(drawing_result.letters)
    GAME.bag = drawing_result.bag
    // GSI.addNewLettersToRack(GAME.players[0].rack)
    const game = {
        board: [...GAME.board],
        rack: [...GAME.players[0].rack],
        players: GAME.players.map(e=>{
            return {id: e.id, score: e.score}
        }),
    }
    GSI.updateGame(game)
    // launch master molangeur on the new players game
    DICO.masterMolangeur(GAME.players[0].rack, (words)=>{
        window.console.timeEnd("launchMasterMolangeur")
        GSI.updateMolangeur(words)
    })
}


export const onWordSubmission = (id, free_letters_on_board) => {
    // verify board validity
    
    
    // 
    // update GameStateStore
    const evaluation = evaluateBoard(free_letters_on_board)
    if (evaluation && evaluation.is_position_valid && evaluation.is_word_valid) {
        
        // retrieve player index:
        const player_index = GAME.players.map(e=>e.id).indexOf(id)
        // add letters to board
        GAME.board = [...GAME.board, ...free_letters_on_board]
        // retrieve remaining letters in rack
        const rack_remaining_letters = GAME.players[player_index].rack.filter(e=>free_letters_on_board.filter(l=>l.id===e.id).length === 0)
        // draw new letter's player
        const drawing_result  = drawLetters(GAME.bag, rack_remaining_letters, GAME.round)
        console.log("++++++++++++++++++++")
        console.log(GAME.bag)
        console.log(drawing_result.bag)
        console.log(drawing_result.letters)
        console.log(rack_remaining_letters)
        console.log("++++++++++++++++++++")
        GAME.bag = drawing_result.bag
        const new_letters = drawing_result.letters
        GAME.bag = drawing_result.bag
        // remove letters from player's rack and 
        GAME.players[player_index].rack = [
            ...rack_remaining_letters,
            ...new_letters
        ]
        // update player's score
        GAME.players[player_index].score += evaluation.total_score
        // update round number
        GAME.round++
        // update player's game
        const game = {
            board: [...GAME.board],
            rack: [...GAME.players[player_index].rack],
            players: GAME.players.map(e=>{
                return {id: e.id, score: e.score}
            }),
        }
        GSI.updateGame(game)
        // launch master molangeur on the new players game
        GSI.updateMolangeur() 
        DICO.masterMolangeur([...GAME.board, ...GAME.players[player_index].rack], (words)=>{
            window.console.timeEnd("launchMasterMolangeur")
            if (words.length !== 0) {
                GSI.updateMolangeur(words)
            } else {
                GSI.gameOver()
            }
        })
        

    }
}

export const bestWords = (callback) => {
    const letters = GSI.getLetters()
    // DICO.computePossibleWordPositions(letters.filter(e=>e.board && !e.free))
    DICO.masterMolangeur(letters, (words) => {
        GAME.players[0].target_score += words[0].pts
        GSI.updatePlayer(GAME.players)
        callback(words)
    })
}
export const evaluateBoard = (free_letters_on_board) => {
    // retrieve necessary data
    const fixed_letters = GAME.board
    const board_letters = [...fixed_letters, ...free_letters_on_board]
    // const letters = GSI.getLetters()
    // const free_letters = letters.filter(e=>e.board && e.free)
    // const fixed_letters = letters.filter(e=>e.board && !e.free)


    // these contains the same data but in "board" dimension
    // which makes it easier to access in some cases
    const arr_board_letters = U.buildBoardIndexArray(board_letters)
    // const arr_free_letters = U.buildBoardIndexArray(free_letters)
    const arr_fixed_letters = U.buildBoardIndexArray(fixed_letters)
    
    // ------------------------------------------------------------
    // This section deals with the positionning of the new letters
    const new_letter_on_center_cell = free_letters_on_board.filter(e=>e.index === 112).length === 1
    const new_letters_on_same_row = U.unique(free_letters_on_board.map(e=>U.getRowIndex(e.index))).length === 1 
    const new_letters_on_same_col = U.unique(free_letters_on_board.map(e=>U.getColIndex(e.index))).length === 1
    const new_letters_with_neighbors = free_letters_on_board.map(e=>{
        return U.getNeighborsIndex(e.index).filter(n=>arr_fixed_letters[n] !== null)
    }).flat().length > 0
    let no_interletter_space = false
    let start = Math.min(...free_letters_on_board.map(e=>e.index))
    let end   = Math.max(...free_letters_on_board.map(e=>e.index))
    if (new_letters_on_same_row) {
        no_interletter_space = U.getIndexSeq(start, end, true).filter(e=>arr_board_letters[e]===null).length === 0
    } else if (new_letters_on_same_col) {
        no_interletter_space = U.getIndexSeq(start, end, false).filter(e=>arr_board_letters[e]===null).length === 0
    }
    const is_position_valid = (new_letter_on_center_cell || new_letters_with_neighbors)
         && (new_letters_on_same_row || new_letters_on_same_col) && no_interletter_space
    console.log("is_position_valid", is_position_valid)
    console.log("new_letters_on_same_col", new_letters_on_same_col)
    console.log("new_letters_on_same_row", new_letters_on_same_row)
    if (!is_position_valid) return false

    // ------------------------------------------------------------
    // This section deals with building, checking the words and 
    // scoring
    const words = findWords(board_letters)
    const new_words = words.filter(w=>w.word.filter(e=>e.free).length > 0)
    const actual_words = new_words.map(e=>buildWord(e.word))
    console.log("words", words)
    console.log("new_words", new_words)
    console.log("actual_words", actual_words)

    if (actual_words.length === 0) return false

    const words_validity = actual_words.map(e=>DICO.checkWordValidity(e))
    const is_word_valid = words_validity.reduce((p, c) => p && c, true)
    const words_free_letter_count = new_words.map(e=>e.word.filter(l=>l.free).length)
    const main_word_index = words_free_letter_count.indexOf(Math.max(...words_free_letter_count))
    const word_scores = new_words.map(e=>DICO.computeWordScore(e.word))
    const total_score = word_scores.reduce((p, c)=>p+c, 0)

    console.log("words_validity", words_validity)
    console.log("is_word_valid", is_word_valid)
    console.log("words_free_letter_count", words_free_letter_count)
    console.log("main_word_index", main_word_index)
    console.log("word_scores", word_scores)
    console.log("total_score", total_score)
    

    let last_letter_index = new_words[main_word_index].word.slice(-1)[0].index
    // console.log(last_letter_index)
    // ------------------------------------------------------------
    // This section deals with point compu

    
    return {
        is_position_valid,
        is_word_valid,
        words: actual_words,
        words_validity,
        full_words: new_words,
        letters: free_letters_on_board,
        main_word_index,
        word_scores,
        total_score,
        last_letter_index
    }

}


const createBag = () => {
    const bag_letters = Object.keys(LETTERS).map(e=>e.repeat(LETTERS[e].n).split("")).flat()
    // const bag_letters = ["I", "U", "G", "O", "A", "_", "_"]
    // const bag_letters = ["I", "U", "G", "O", "A", "V", "E"]
    // const bag_letters = ["R", "I", "Y", "Y", "S", "T", "X"]
    // const bag_letters = ["R", "F", "E", "V", "R", "E", "S"]
    bag = bag_letters.map(e=>{
        return {
            id: Math.random().toString().slice(2),
            letter: e,
            joker: ""
        }
    })
    bag = U.shuffle(bag)
    bag = bag.slice(50)
    return bag
}

// FIXME: draw letters untile at least two consonants and two vowels
//        or one consonant and one vowel, or something like this
const drawLetters = (bag, remaining_letters, round) => {
    const draw = () => {
        return bag.slice(0, n)
    }
    const n = 7 - remaining_letters.length
    let letters = draw()
    let m = round < 15 ? 2 : 1
    let n_vowel = remaining_letters.filter(e=>LETTERS[e.letter].vowel).length
    let n_consonant = remaining_letters.filter(e=>LETTERS[e.letter].consonant).length
    let n_v = letters.filter(e=>LETTERS[e.letter].vowel).length
    let n_c = letters.filter(e=>LETTERS[e.letter].consonant).length
    let invalid = ((n_vowel + n_v) < m) || ((n_consonant + n_c) < m)
    let k = 0;
    // console.log(letters)
    // console.log(m)
    // console.log(invalid)
    // console.log(n_vowel + n_v)
    // console.log(n_consonant + n_c)
    // console.log((n_vowel + n_v) < m)
    // console.log((n_consonant + n_c) < m)
    // console.log(((n_vowel + n_v) < m) || ((n_consonant + n_c) < m))
    while (invalid && k < 10) {
        bag = U.shuffle(bag)
        letters = draw()
        n_v = letters.filter(e=>LETTERS[e.letter].vowel).length
        n_c = letters.filter(e=>LETTERS[e.letter].consonant).length
        invalid =  ((n_vowel + n_v) < m) || ((n_consonant + n_c) < m)
        // console.log(letters)
        
        console.log(k)
        // console.log(invalid)
        // console.log(n_vowel + n_v)
        // console.log(n_consonant + n_c)
        
        // console.log((n_vowel + n_v) < m)
        // console.log((n_consonant + n_c) < m)
        // console.log(((n_vowel + n_v) < m) || ((n_consonant + n_c) < m))
        k++
    }
    return {letters, bag: bag.slice(n)}
}

const findWords = (letters) => {
    // const letters_per_col = U.buildBoardIndexArray(letters)
    // const letters_per_row = U.transposeBoardIndexArray(letters_per_col)
    const letters_per_col = U.buildRowColArray(letters, false)
    const letters_per_row = U.buildRowColArray(letters, true)
    console.log("letters_per_col", letters_per_col)
    console.log("letters_per_row", letters_per_row)

    const h_words = letters_per_row.map(e=>U.consecutiveNonNullItems(e).filter(e=>e.length>1).map(e=>{return{vertical: false, word: e}})).flat()
    const v_words = letters_per_col.map(e=>U.consecutiveNonNullItems(e).filter(e=>e.length>1).map(e=>{return{vertical: true, word: e}})).flat()
    console.log("h_words", h_words)
    console.log("v_words", v_words)

    return [...h_words, ...v_words]
    // const v_words = letters_per_col.map(e=>{
    //     return U.consecutiveNonNullItems(
    //         letters_per_row
    //     ).filter(e=>e.length>1).map(e=>{return{vertical: false, word: e}})
    // })
    // return [
    //     ...U.consecutiveNonNullItems(letters_per_row).filter(e=>e.length>1).map(e=>{return{vertical: false, word: e}}),
    //     ...U.consecutiveNonNullItems(letters_per_col).filter(e=>e.length>1).map(e=>{return{vertical: true, word: e}}),
    // ]
}

const buildWord = (letters) => {
    return letters.map(e=>{
        let l = e.letter === "_" ? e.joker : e.letter
        return l
    }).reduce((p, c)=>p+c)
}

