import * as U from "./utils"
import {LETTERS, LTRS, POINTS, MAPPING, WORD_POSITIONS, CELLS} from "./constants"
let DICO

export const initDictionnary = (callback) => {
    makeDictionnary(callback)
}
const makeDictionnary = (callback) => {
    fetch("./ALL_WORDS.txt").then(e=>e.text()).then(e=>{
        const dico = buildDictionnaryObject(e.split("\r\n"))
        DICO = dico
        callback()
    })
}
const buildDictionnaryObject = (words) => {
    let dico = {};
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
        dico = addWordToDico(w, dico)
    })
    return dico
}

export const checkWordValidity = (word, k=0, D=DICO) => {
    if (word[k] === undefined) return D["$"] !== undefined
    if(D[word[k]] === undefined) return false 
    return checkWordValidity(word, k+1, D[word[k]])
}

// obsolete, I should use the POINTS constant instead
export const computeWordScore = (letters) => {
    const values = letters.map(e=>{
        let letter_value = LETTERS[e.letter].pts
        let word_multiplier = 1
        if (e.free) {
            if (U.isInArray(CELLS.letter_double, e.index)) letter_value *= 2
            if (U.isInArray(CELLS.letter_triple, e.index)) letter_value *= 3
            if (U.isInArray(CELLS.word_double, e.index)) word_multiplier = 2
            if (U.isInArray(CELLS.word_triple, e.index)) word_multiplier = 3
        }
        return {letter_value, word_multiplier}
    })
    let word_value = values.reduce((p, c)=>p+c.letter_value, 0)
    let word_multiplier = values.reduce((p, c)=>p*c.word_multiplier, 1)
    let free_letter_count = letters.reduce((t, c)=>c.free ? t+1 : t, 0)
    return word_value * word_multiplier + (free_letter_count===7 ? 50 : 0)
}

const buildWordsFromFreeCell = (index, arr_fixed_letters) => {
    const getLtrs = (index, full=[], dir="left") => {
        let n = MAPPING.NEIGHBORS[index][dir]
        if (n !== null) {
            if (arr_fixed_letters[n] !== null) {
                full.push(arr_fixed_letters[n].letter)
                getLtrs(n, full, dir)
            } 
        }
        return full
    }
    const h_left = getLtrs(index, [], "left").reverse()
    const horizontal = [
        ...h_left, 
        null,
        ...getLtrs(index, [], "right")
    ]
    const v_top = getLtrs(index, [], "top").reverse()
    const vertical = [
        ...v_top, 
        null,
        ...getLtrs(index, [], "bottom")
    ]
    //REFACTOR
    return {
        horizontal: horizontal.length === 1 ? null : horizontal,
        vertical: vertical.length === 1 ? null : vertical,
        null_index: {v: v_top.length, h: h_left.length},
        vertical_fixed_points: vertical.length === 1 ? null : vertical.filter(e=>e!==null).map(e=>LETTERS[e].pts).reduce((p, c)=>p+c),
        horizontal_fixed_points: horizontal.length === 1 ? null : horizontal.filter(e=>e!==null).map(e=>LETTERS[e].pts).reduce((p, c)=>p+c),
    }
}

const findValidCellsAndOrthogonalWords = (fixed_letters, arr_fixed_letters) => {
    if (arr_fixed_letters[112] === null) return [{index: 112, vertical: null, horizontal: null}]
    const cells = U.unique(fixed_letters.map(e=>Object.values(MAPPING.NEIGHBORS[e.index])).flat().sort((a, b)=>a>b))
    return cells.filter(e=>arr_fixed_letters[e]===null).map(e=>{
        return {
            index: e,
            ...buildWordsFromFreeCell(e, arr_fixed_letters),
        }
    })
}
const computeFreeConstrainsOfValidCells = (valid_cells, free_letters) => {
    const ltrs = free_letters.map(e=>e.letter)
    return valid_cells.map(cell=>{
        let p = POINTS[cell.index]
        let n_h, w_h, l_h, p_h
        if (cell.horizontal) {
            n_h = cell.horizontal.length
            w_h = findWords(ltrs, n_h, n_h, cell.horizontal, Array(n_h).fill(null)).map(e=>e.word)
            l_h = w_h.map(e=>e.slice(cell.null_index.h, cell.null_index.h+1))

            p_h = l_h.map(e=>(LETTERS[e].pts * p.letter_mutliplier + cell.horizontal_fixed_points) * p.word_multiplier)
        }
        let n_v, w_v, l_v, p_v
        if (cell.vertical) {
            n_v = cell.vertical.length
            w_v = findWords(ltrs, n_v, n_v, cell.vertical, Array(n_v).fill(null)).map(e=>e.word)
            l_v = w_v.map(e=>e.slice(cell.null_index.v, cell.null_index.v+1))
            p_v = l_v.map(e=>(LETTERS[e].pts * p.letter_mutliplier + cell.vertical_fixed_points) * p.word_multiplier)
        }
        return {
            index: cell.index,
            v: l_v ? U.unique(l_v) : null,
            h: l_h ? U.unique(l_h) : null,
            p,
            p_v,
            p_h,
        }
    })
}

export const masterMolangeur = (letters, callback) => {
    const configuration = initMasterMolangeur(letters)
    const on_done = (words) => {
        console.timeEnd("molangeur")
        callback(words)
    }
    console.time("molangeur")
    launchMasterMolangeur(configuration, on_done)
}


const initMasterMolangeur = (letters) => {
    
    const fixed_letters = letters.filter(e=>e.board && !e.free)
    const arr_fixed_letters = U.buildBoardIndexArray(fixed_letters)

    const free_letters = letters.filter(e=>e.free)

    const valid_cells = findValidCellsAndOrthogonalWords(fixed_letters, arr_fixed_letters)
    const free_constraints = computeFreeConstrainsOfValidCells(valid_cells, free_letters)
    const arr_free_constraints = U.buildBoardIndexArray(free_constraints)

    const words_positions = computeWordPositions(arr_fixed_letters, valid_cells, free_letters.length)
    
    return {
        words_positions,
        free_letters,
        arr_fixed_letters,
        arr_free_constraints
    }
    
}

const launchMasterMolangeur = (configuration, callback) => {
    iteratorMasterMolangeur(0, configuration, [], callback)
}

const iteratorMasterMolangeur = (index, configuration, results, callback) => {
    if (index >= configuration.words_positions.length) {
        let words = results.flat().sort((a, b) => {
            if (a.dir === "V" && b.dir === "H") return 1
            if (a.dir === "V" && b.dir === "V") return 0
            if (a.dir === "H" && b.dir === "V") return -1
            return 0
        }).sort((a, b) => b.pts - a.pts)
        // duplicates are due to letters that are in double in the player's rack
        words = removeDuplicatedWords(words)
        callback(words)
    } else {
        results = [
            ...results,
            getPossibleWordsForOneGroup(
                configuration.words_positions[index],
                configuration.free_letters,
                configuration.arr_fixed_letters,
                configuration.arr_free_constraints,
                configuration.words_positions[index].dir === "V"
            )
        ]
        setTimeout(()=>{
            iteratorMasterMolangeur(index+1, configuration, results, callback)
        }, 0)
    }
}


const removeDuplicatedWords = (arr) => {
    let ids = arr.map(e=>e.word+e.index+e.dir)
    let unique = [...(new Set(ids))]
    return arr.filter((e, i) => {
        let u = unique.indexOf(ids[i])
        if (u === -1) {
            return false
        } else {
            unique.splice(u, 1)
            return true
        }
    })
}




const findWords = (letters, min_length, max_length, fixed_constraints, free_constraints) => {
    const found = [];
    const getWords = (letters, k=0, dico=DICO, free_letters_used=0, joker_positions=[]) => {
        if (k <= max_length) { // if too long, end search
            if (fixed_constraints[k]) { // if fixe letter at this location
                // if there are valid words with this letter at this location
                // continue search
                if (dico[fixed_constraints[k]]) { 
                    getWords(letters, k+1, dico[fixed_constraints[k]], free_letters_used, joker_positions)
                }
            } else {
                if (k>=min_length && dico["$"]) { // if existing long enough word, add it
                    found.push({word: dico["$"], n: free_letters_used, joker: joker_positions})
                }
                free_letters_used += 1
                // continue with the remaining letters
                for (let i = 0; i<letters.length; i++) {
                    if (free_constraints[k] && free_constraints[k].indexOf(letters[i])===-1) continue
                    if (dico[letters[i]]) { // if there are valid word with this letter at this location
                            let remaining_letters = [...letters.slice(0, i), ...letters.slice(i+1)]
                            getWords(remaining_letters, k+1,  dico[letters[i]], free_letters_used, joker_positions)
                    } else if (letters[i] === "_"){ // if it is a joker
                        // joker_positions = [...joker_positions, k]
                        for (let j = 0; j < LTRS.length; j++) {
                            if (dico[LTRS[j]]) {
                                let remaining_letters = [...letters.slice(0, i), ...letters.slice(i+1)]
                                getWords(remaining_letters, k+1, dico[LTRS[j]], free_letters_used,  [...joker_positions, k])
                            }
                        }
                    }
                    
                }
            }
        }
    }
    getWords(letters)
    return found
}

const computeWordPositions = (board, valid_cell, n_free_letters) => {
    // a position is valid if:
    // 1/ it contains a valid cell
    // 2/ the number of free spot doesn't exceed the number of free letters
    // 3/ it has an empty cell before and after
    const filteringFunction = (P) => {
        let step1 = P.filter(cell_index=>valid_cell.filter(vc=>vc.index===cell_index).length>0).length > 0
        let step2 = P.filter(cell_index=>board[cell_index]===null).length <= n_free_letters
        let b = MAPPING.NEIGHBORS[P[0]][before]
        let a = MAPPING.NEIGHBORS[P[P.length-1]][after]
        let step3 = (b === null || board[b] === null) && (a === null || board[a] === null)
        return step1 && step2 && step3
    }

    let before, after
    before="top"
    after="bottom"
    const V = WORD_POSITIONS.V.map(START_CELL=>{
        let selected = START_CELL.filter(filteringFunction)
        if (selected.length === 0) return null
        return {
            indices: selected[selected.length - 1],
            dim: {min: selected[0].length, max: selected[selected.length - 1].length},
            dir: "V",
        }
    }).filter(e=>e!==null)
    before="left"
    after="right"
    const H = WORD_POSITIONS.H.map(START_CELL=>{
        let selected = START_CELL.filter(filteringFunction)
        if (selected.length === 0) return null
        return {
            indices: selected[selected.length - 1],
            dim: {min: selected[0].length, max: selected[selected.length - 1].length},
            dir: "H"
        }
    }).filter(e=>e!==null)

    return [...V, ...H]
}


const getPossibleWordsForOneGroup = (position_group, free_letters, arr_fixed_letters, arr_free_constraints, vertical=true) => {

    const letters = free_letters.map(e=>e.letter)

    let free_c
    if (vertical) {
        free_c = position_group.indices.map(e=>arr_free_constraints[e] ? arr_free_constraints[e].h : null)
    } else {
        free_c = position_group.indices.map(e=>arr_free_constraints[e] ? arr_free_constraints[e].v : null)
    }
    let fixed_c = position_group.indices.map(e=>arr_fixed_letters[e] ? arr_fixed_letters[e].letter : null)

    // const found_words = U.unique(findWords(letters, position_group.dim.min, position_group.dim.max, fixed_c, free_c).map(e=>e.word))
    const raw_found_words = findWords(letters, position_group.dim.min, position_group.dim.max, fixed_c, free_c)
    const found_words = raw_found_words.map(e=>e.word)
    const n_letter_used = raw_found_words.map(e=>e.n)
    const joker_positions = raw_found_words.map(e=>e.joker)

    let pos_multiplier = position_group.indices.map(e=>POINTS[e])
    let adjacent_point
    if (vertical) {
        adjacent_point = position_group.indices.map(e=> {
            if (arr_free_constraints[e]===null || arr_free_constraints[e].h===null) return null
            let obj = {}
            arr_free_constraints[e].h.map((l, i)=>obj[l] = arr_free_constraints[e].p_h[i])
            return obj
        })
    } else {
        adjacent_point = position_group.indices.map(e=> {
            if (arr_free_constraints[e]===null || arr_free_constraints[e].v===null) return null
            let obj = {}
            arr_free_constraints[e].v.map((l, i)=>obj[l] = arr_free_constraints[e].p_v[i])
            return obj
        })
    }

    const word_letter_points = found_words.map((w, i)=>{
        let a = 0
        let w_m = 1
        let t = 0
        for (let k = 0; k<w.length; k++) {
            let p = (joker_positions[i].indexOf(k) === -1 ? LETTERS[w[k]].pts : 0)
            if (fixed_c[k]===null) {
                p *= pos_multiplier[k].letter_mutliplier
                w_m *= pos_multiplier[k].word_multiplier
            } 
            if (adjacent_point[k]) {
                a += adjacent_point[k][w[k]]
            }
            t += p
        }
        t *=  w_m 
        return t + a + (n_letter_used[i] === 7 ? 50 : 0)
    })


    const output = found_words.map((e, i) => {
        return {
            index: position_group.indices[0],
            word: e,
            pts: word_letter_points[i],
            dir: vertical ? "V" : "H",
            n: n_letter_used[i],
            joker: joker_positions[i]
        }
    })
    return output
}
