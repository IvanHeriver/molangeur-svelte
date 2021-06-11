import {LETTERS, LTRS, POINTS, MAPPING, WORD_POSITIONS} from "./constants"
let WORKER 
if (window.Worker) {
    WORKER = new Worker('molangeur.js')
} else {
    alert(`Ce site necessite la technologie "Worker" que votre navigateur ne possède pas.
    Certaines fonctionnalités importantes ne fonctionneront.
    Cela inclue le maître MoLangeur, l'algorithme permettant de trouver le meilleur mot dans une situation donnée.`)
    WORKER = {addEventListener: () => {}, postMessage: () => {}}
}

const makeID = () => Math.random().toString().slice(2)
const callbacks = {}
WORKER.addEventListener("message", (e)=>{
    const msg = e.data
    console.log(`message received: ${msg.id}`);
    console.log(msg)
    if (msg.id && callbacks[msg.id]) {
        callbacks[msg.id](msg.content)
        delete callbacks[msg.id]
    }
})

let DICO
export const initMolangeur = (callback) => {
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
    // const submitted_letters = letters.filter(e=>e.board && e.free)
    // const existing_letters = letters.filter(e=>e.board && !e.free)
    // const existing_letters_arr = buildBoardIndexArray(existing_letters)

    // // for each submitted letter, see if it is on center cell or has a neighor
    // const row_col = submitted_letters.sort((a, b)=>a.index - b.index).map(e=> MAPPING.FROM_INDEX[e.index])
    // // const n_row_col = {row: unique(row_col.map(e=>e.row)).length, col: unique(row_col.map(e=>e.col)).length}
    // // const is_word_horizontal = n_row_col.row === 1
    // const is_word_horizontal = unique(submitted_letters.sort((a, b)=>a.index - b.index)
    //     .map(e=> MAPPING.FROM_INDEX[e.index].row)).length === 1
    // console.log("***********************************")
    // console.log(submitted_letters)
    // console.log(existing_letters)
    // console.log(is_word_horizontal)
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