import {LETTERS, LTRS, POINTS, MAPPING, WORD_POSITIONS} from "./constants"
let WORKER 


const makeID = () => Math.random().toString().slice(2)
const callbacks = {}


let DICO
export const initMolangeur = (callback) => {
    if (window.Worker) {
        WORKER = new Worker('molangeur.js')
        
    } else {
        alert(`Ce site necessite la technologie "Worker" que votre navigateur ne possède pas.
        Certaines fonctionnalités importantes ne fonctionneront.
        Cela inclue le maître MoLangeur, l'algorithme permettant de trouver le meilleur mot dans une situation donnée.`)
        WORKER = {addEventListener: () => {}, postMessage: () => {}}
    }
    WORKER.addEventListener("message", (e)=>{
        const msg = e.data
        if (msg.id && callbacks[msg.id]) {
            callbacks[msg.id](msg.content)
            if (msg.all_words) console.warn(msg.all_words)
            delete callbacks[msg.id]
        }
    })


    let id = makeID()
    callbacks[id] = callback
    fetch("./ALL_WORDS.txt").then(e=>e.text()).then(e=>{
        let words = e.split("\r\n")
        DICO = {}
        const addWordToDico = (w, D, k=0) => {
            if ( w[k]) {
                if (D[w[k]] === undefined) D[w[k]] = {}
                D[w[k]] = addWordToDico(w, D[w[k]], k+1)
            } else {
                D["$"] = w
                
            }
            return D
        }
        words.map(w=>{
            DICO = addWordToDico(w, DICO)
        })
        WORKER.postMessage({code: "init", id: id, content: {
            LETTERS, LTRS, POINTS, MAPPING, WORD_POSITIONS, DICO
        }})
    })

}

export const resetMolangeur = (callback) => {
    Object.keys(callbacks).map(e=>delete callbacks[e])
    WORKER.terminate()
    // let id = makeID()
    initMolangeur(callback)
    // callbacks = {}
    // callbacks[id] = callback
    // WORKER.postMessage({code: "reset", id: id})
}
// this is the only non-worker function
export const checkWord = (word) => {
    const check = (word, k=0, D=DICO) => {
        if (word[k] === undefined) return D["$"] !== undefined
        if(D[word[k]] === undefined) return false 
        return check(word, k+1, D[word[k]])
    }
    return check(word)
}

export const getDictionnary = (callback) => {
    let id = makeID()
    callbacks[id] = callback
    WORKER.postMessage({code: "get-dictionnary", id: id})
}

export const molangeur = (letters, callback) => {
    let id = makeID()
    callbacks[id] = callback
    WORKER.postMessage({code: "molangeur", id: id, content: letters})
}

export const checkBoard = (letters) => {
    const submitted_letters = letters.filter(e=>e.board && e.free)
    if(submitted_letters.length===0) return false
    console.log("check 0")
    
    // check basic positioning: all free letters and same row or same column
    const row_col = submitted_letters.map(e=>MAPPING.FROM_INDEX[e.index])
    const rows = unique(row_col.map(e=>e.row))
    const cols = unique(row_col.map(e=>e.col))
    // const is_horizontal = rows.length === 1
    if (cols.length != 1 && rows.length != 1) return false // no same row / same col
    console.log("check 1")

    // sort submitted letters and get words from the first letters
    submitted_letters.sort((a, b) => a.index - b.index)
    const letters_arr = buildBoardIndexArray(letters)
    const words_from_first_letter = [
        findVerticalAndHorizontalWordsFromIndex(letters_arr, submitted_letters[0], "h"), 
        findVerticalAndHorizontalWordsFromIndex(letters_arr, submitted_letters[0], "v"), 
    ]
    if (words_from_first_letter.length === 0) return false // only one letter words
    if (words_from_first_letter.filter(w=>w.filter(l=>l.letter==="").length>0).length>0) return false
    console.log("check 2")

    // find out the directon of the main words: if there is only one free letter, its the longest word
    // otherwise its the word containing the most free letters
    const words_length = words_from_first_letter.map(w=>w.length)
    const words_n_free_letters = words_from_first_letter.map(w=>w.filter(l=>l.free).length)
    const is_horizontal = (submitted_letters.length === 1 ?
         (words_length.indexOf(Math.max(...words_length)) === 0) : 
         (words_n_free_letters.indexOf(Math.max(...words_n_free_letters)) === 0)
    )

    // retrieve number of free letters in main words, it must match the number of submitted letters
    // const n_fixed_letters = words_from_first_letter.map(e=>e.filter(l=>!l.free).length).reduce((a, b)=>a+b)
    const n_free_letters = words_from_first_letter[is_horizontal ? 0 : 1].filter(e=>e.free).length
    if (n_free_letters !== submitted_letters.length) return false // there are holes between the free letters
    console.log("check 3")

    // get the adjaccent words for all the other letters
    const next_letters = submitted_letters.slice(1)
    const other_words = next_letters.map(l=>findVerticalAndHorizontalWordsFromIndex(letters_arr, l, is_horizontal ? "v" : "h"))
    const all_words = [
        words_from_first_letter[is_horizontal ? 0 : 1],
        words_from_first_letter[is_horizontal ? 1 : 0],
         ...other_words
        ].filter(e=>e.length>0)

    const n_fixed_letters = all_words.map(w=>w.filter(l=>!l.free).length).reduce((a, b)=>a+b)
    if (n_fixed_letters === 0) {
        // there are no connexion with other letter and none of the 
        // free letter is on the center cell
        if (submitted_letters.filter(e=>e.index === 112).length === 0) return false 
    }
    console.log("check 4")
    // check the words validity
    const words = all_words.map(e=>e.map(l=>l.letter).reduce((a, b)=>a+b))
    const validities = words.map(e=>checkWord(e))
    const validity = validities.filter(e=>!e).length===0
    if (!validity) {
        // one the word is not validity
        return {
            is_horizontal, all_words, words,validities, validity
        }
    }
    console.log("check 5")

    // compute score
    const scores = all_words.map(w=>{
        let p = w.map(l=>l.points * l.multi_L).reduce((a, b)=>a+b)
        let m = w.map(l=>l.multi_W).reduce((a, b)=>a*b)
        return p*m
    })
    const score = scores.reduce((a, b) => a+b) + (n_free_letters === 7 ? 50 : 0)

    // last letter index
    // const last_letter_index = words_from_first_letter[is_horizontal ? 0 : 1].slice(-1)[0].index
    
    console.log("#########################")
    console.log("##  BOARD CHECK VALID  ##")
    console.log("is_horizontal", is_horizontal)
    console.log("all_words", all_words)
    console.log("words", words)
    console.log("validities", validities)
    console.log("scores", scores)
    console.log("score", score)
    console.log("#########################")
    return {
        is_horizontal,all_words,words,validities,validity,scores,score
    }

}

const unique = (arr) => {
    let s = new Set(arr)
    return [...s]
}
const buildBoardIndexArray = (letters) => {
    let arr = Array(15 * 15).fill(null)
    letters.map(e=>arr[e.index] = e)
    return arr
}


const findVerticalAndHorizontalWordsFromIndex = (all_letters_arr, letter, direction="h") => {
    // const getLtrs = (index, ltr=[], pts=[], mult_ltr=[], mult_word=[], dir="left") => {
    const getLetterConfig = (letter) => {
        let ltr, pts, ml, mw
        // if letter is not free
        if (!letter.free) {
            ml = 1
            mw = 1
        } else {
            ml = POINTS[letter.index].letter_mutliplier
            mw = POINTS[letter.index].word_multiplier
        }
        // if letter is not a joker
        if (letter.letter!== "_") {
            ltr = letter.letter
            pts = LETTERS[letter.letter].pts
        } else {
            ltr = letter.joker
            pts = 0
        }
        return {letter: ltr, points: pts, multi_L: ml, multi_W: mw, free: letter.free, index: letter.index}
    }
    const getLtrs = (index, result=[], dir="left") => {
        let n = MAPPING.NEIGHBORS[index][dir]
        if (n !== null && all_letters_arr[n] !== null) {
            result.push(getLetterConfig(all_letters_arr[n]))
            getLtrs(n, result, dir)
        }
        return result
    }
    const center = getLetterConfig(letter)
    let dirs = ["left", "right"]
    if (direction !== "h") dirs = ["top", "bottom"]    
    const before   = getLtrs(letter.index, [], dirs[0])
    const after  = getLtrs(letter.index, [], dirs[1])
    const word = [
        ...before.reverse(), 
        center,
        ...after
    ]
    return word.length === 1 ? [] : word
}


// ==================================================================
// ==================================================================
// ==================================================================
// FIXME: to delete!!!
// obsolete, I should use the POINTS constant instead
export const computeWordScore = (letters) => {
    const values = letters.map(e=>{
        let letter_value = LETTERS[e.letter].pts
        let word_multiplier = 1
        if (e.free) {
            if (isInArray(CELLS.letter_double, e.index)) letter_value *= 2
            if (isInArray(CELLS.letter_triple, e.index)) letter_value *= 3
            if (isInArray(CELLS.word_double, e.index)) word_multiplier = 2
            if (isInArray(CELLS.word_triple, e.index)) word_multiplier = 3
        }
        return {letter_value, word_multiplier}
    })
    let word_value = values.reduce((p, c)=>p+c.letter_value, 0)
    let word_multiplier = values.reduce((p, c)=>p*c.word_multiplier, 1)
    let free_letter_count = letters.reduce((t, c)=>c.free ? t+1 : t, 0)
    return word_value * word_multiplier + (free_letter_count===7 ? 50 : 0)
}
const isInArray = (array, value) => {
    return array.indexOf(value) !== -1
}
const CELLS = {
    letter_double: [3, 11, 36, 38, 45, 52, 59, 92, 96, 98, 102, 108,
         116, 122, 126, 128, 132, 165, 172, 179, 186, 188, 213, 221],
    letter_triple: [20, 24, 76, 80, 84, 88, 136, 140, 144, 148, 200, 204],
    word_double: [16, 28, 32, 42, 48, 56, 64, 70, 112, 154, 160, 168, 176, 182, 192, 196, 208],
    word_triple: [0, 7, 14, 105, 119, 210, 217, 224]
}