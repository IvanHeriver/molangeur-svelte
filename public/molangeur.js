// console.log = () => {}
// const consoleLog = console.log
// console.log = (msg) => {consoleLog("WORKER>>>", msg)}

// let N = 0
// let cancel_work = false

// console.log("onmessage", N)
// throw "error"
onmessage = (e) => {
    const msg = e.data
    console.log(`message received: ${msg.code} (${msg.id})`);
    console.log(msg)

    if (msg.code === "init") init(msg.content, msg.id)
    if (msg.code === "molangeur") molangeur(msg.content, msg.id)
    // if (msg.code === "reset") cancelWork(msg.id)
    // if (msg.code === "get-dictionnary") getDictionnary(msg.id)
}

let LETTERS, LTRS, POINTS, MAPPING, WORD_POSITIONS, DICO
const init = (constants, id) => {
    LETTERS = constants.LETTERS
    LTRS = constants.LTRS
    POINTS = constants.POINTS
    MAPPING = constants.MAPPING
    WORD_POSITIONS = constants.WORD_POSITIONS
    DICO = constants.DICO
    postMessage({id: id, content: true})
}

const molangeur = (letters, id) => {
    masterMolangeur(letters, (words, all_words) => {
        postMessage({id: id, content: words, all_words})
    })
    
}
// const cancelWork = (id) => {
//     cancel_work = true
//     postMessage({id: id})
// }

// N = 1
// =============================================================== //
// =============================================================== //
//                                                                 //
//                        Master MoLangeur                         //
//                                                                 //
// =============================================================== //
// =============================================================== //


const masterMolangeur = (letters, callback) => {
    const configuration = initMasterMolangeur(letters)
    const on_done = (words, all_words) => {
        console.timeEnd("molangeur")
        callback(words, all_words)
    }
    console.time("molangeur")
    launchMasterMolangeur(configuration, on_done)
}


const initMasterMolangeur = (letters) => {
    
    const fixed_letters = letters.filter(e=>e.board && !e.free)
    const arr_fixed_letters = buildBoardIndexArray(fixed_letters)

    const free_letters = letters.filter(e=>e.free)

    const valid_cells = findValidCellsAndOrthogonalWords(fixed_letters, arr_fixed_letters)
    const free_constraints = computeFreeConstrainsOfValidCells(valid_cells, free_letters)
    const arr_free_constraints = buildBoardIndexArray(free_constraints)

    const words_positions = computeWordPositions(arr_fixed_letters, valid_cells, free_letters.length)
    
    console.log("valid_cells", valid_cells)
    console.log("free_constraints", free_constraints)
    console.log("words_positions", words_positions)
    console.log("arr_fixed_letters", arr_fixed_letters)
    console.log("arr_free_constraints", arr_free_constraints)

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
    // if (!cancel_work) {
        if (index >= configuration.words_positions.length) {
            let words = results.flat().sort((a, b) => {
                if (a.dir === "V" && b.dir === "H") return 1
                if (a.dir === "V" && b.dir === "V") return 0
                if (a.dir === "H" && b.dir === "V") return -1
                return 0
            }).sort((a, b) => b.pts - a.pts)
            // duplicates are due to letters that are in double in the player's rack
            const no_duplicated_words = removeDuplicatedWords(words)
            // console.log("############################")
            // console.log(words)
            // console.log(no_duplicated_words)
            callback(no_duplicated_words, words)
        } else {
            // console.log(`iteration ${index + 1} out of ${configuration.words_positions.length}`)
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
            // setTimeout(()=>{
                iteratorMasterMolangeur(index+1, configuration, results, callback)
            // }, 0)
        }
    // } else {
    //     console.log("work cancelled")
    //     console.timeEnd("molangeur")
    //     cancel_work = false
    // }
}

const removeDuplicatedWords = (arr) => {
    let ids = arr.map(e=>e.word+e.index+e.dir+e.pts+e.joker.reduce((a, b)=>''+a+b, ''))
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

const findWords = (letters, min_length, max_length, fixed_constraints, free_constraints, print=false) => {
    const found = [];
    // let N = 0
    const getWords = (letters, k=0, dico=DICO, free_letters_used=0, joker_positions=[], L=null) => {
        // N++
        // if (print && k >= 7) {
        //     console.log("+++++++++++++++")
        //     console.log("N", N)
        //     console.log("k", k)
        //     console.log("letters", letters)
        //     console.log("dico", dico)
        //     console.log("free_letters_used", free_letters_used)
        //     console.log("joker_positions", joker_positions)
        //     console.log("found", found)
        //     console.log("L", L)
        //     console.log("min_length", max_length)
        //     console.log("max_length", min_length)
        //     console.log("fixed_constraints[k]", fixed_constraints[k])
        //     console.log("free_constraints[k]", free_constraints[k])
        //     console.log("dico[\"$\"]", dico["$"])
        // }
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
                    // if (N === 197) {
                    //     console.log(" > letters[i]", letters[i])
                    //     console.log(" > dico[letters[i]]", dico[letters[i]])
                    //     console.log(" > dico[letters[i]]", dico[letters[i]])
                    // }
                    
                    if (letters[i] === "_") {
                        for (let j = 0; j < LTRS.length; j++) {
                            if (dico[LTRS[j]]) {
                                if (free_constraints[k] && free_constraints[k].indexOf(LTRS[j])===-1) continue
                                let remaining_letters = [...letters.slice(0, i), ...letters.slice(i+1)]
                                getWords(remaining_letters, k+1, dico[LTRS[j]], free_letters_used,  [...joker_positions, k], LTRS[j])
                            }
                        }
                    } else if (dico[letters[i]]) { // if there are valid word with this letter at this location
                        if (free_constraints[k] && free_constraints[k].indexOf(letters[i])===-1) continue
                        let remaining_letters = [...letters.slice(0, i), ...letters.slice(i+1)]
                        getWords(remaining_letters, k+1,  dico[letters[i]], free_letters_used, joker_positions)
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

    const letters = free_letters.map(e=>e.letter) // FIXME: this could be done only once?

    let free_c
    if (vertical) {
        free_c = position_group.indices.map(e=>arr_free_constraints[e] ? arr_free_constraints[e].h : null)
    } else {
        free_c = position_group.indices.map(e=>arr_free_constraints[e] ? arr_free_constraints[e].v : null)
    }
    let fixed_c_pts = []
    let fixed_c = position_group.indices.map(e=> {
        if (arr_fixed_letters[e]) {
            if (arr_fixed_letters[e].letter==="_") {
                fixed_c_pts.push(0)
                return arr_fixed_letters[e].joker
            } else {
                fixed_c_pts.push(LETTERS[arr_fixed_letters[e].letter].pts)
                return arr_fixed_letters[e].letter
            }
        }
        // arr_fixed_letters[e] ? arr_fixed_letters[e].letter : null
        fixed_c_pts.push(null)
        return null
    })

    // const found_words = U.unique(findWords(letters, position_group.dim.min, position_group.dim.max, fixed_c, free_c).map(e=>e.word))
    const raw_found_words = findWords(letters, position_group.dim.min, position_group.dim.max, fixed_c, free_c, vertical && position_group.indices[0]===105)
    const found_words = raw_found_words.map(e=>e.word)
    const n_letter_used = raw_found_words.map(e=>e.n)
    const joker_positions = raw_found_words.map(e=>e.joker)

    // if (position_group.indices[0] === 38) {
    //     console.log("................................")
    //     console.log("position_group", position_group)
    //     console.log("free_letters", free_letters)
    //     console.log("arr_fixed_letters", arr_fixed_letters)
    //     console.log("arr_free_constraints", arr_free_constraints)
    //     console.log("vertical", vertical)
    //     console.log("..............")
    //     console.log("free_c", free_c)
    //     console.log("fixed_c", fixed_c)
    //     console.log("fixed_c_pts", fixed_c_pts)
    // }
    let pos_multiplier = position_group.indices.map(e=>POINTS[e])


    let adjacent_point
    if (vertical) {
        adjacent_point = position_group.indices.map((e, j)=> {
            if (arr_free_constraints[e]===null || arr_free_constraints[e].h===null) return null
            let obj = {}
            arr_free_constraints[e].h.map((l, i)=> {
                // if (obj[l] !== undefined) {
                //     if (arr_free_constraints[e].p_h[i] > obj[l]) {
                //         obj[l]
                //     }
                // }
                obj[l+(arr_free_constraints[e].l_j_h[i]?"1":"0")] = arr_free_constraints[e].p_h[i]
            })
            return obj
        })
    } else {
        adjacent_point = position_group.indices.map(e=> {
            if (arr_free_constraints[e]===null || arr_free_constraints[e].v===null) return null
            let obj = {}
            // arr_free_constraints[e].v.map((l, i)=>obj[l] = arr_free_constraints[e].p_v[i])
            arr_free_constraints[e].v.map((l, i)=> {
                obj[l+(arr_free_constraints[e].l_j_v[i]?"1":"0")] = arr_free_constraints[e].p_v[i]
            })
            return obj
        })
    }

    const word_letter_points = found_words.map((w, i)=>{

        let adj_points = 0
        let multi_word = 1
        let total_points = 0
        // let's loop over all the letters of the word
        for (let k = 0; k<w.length; k++) {
            // if ((position_group.indices[0]===38 && w === "PELLE")) {
            //     console.log("***")
            //     console.log(k)
            //     console.log(w[k])
            //     console.log(joker_positions[i])
            //     console.log(pos_multiplier[k])
            // }
            let joker = joker_positions[i].indexOf(k) !== -1
            let p = (joker ? 0 : LETTERS[w[k]].pts)
            if (fixed_c_pts[k] !== null) p = fixed_c_pts[k] 
            if (fixed_c[k]===null) {
                p *= pos_multiplier[k].letter_mutliplier
                multi_word *= pos_multiplier[k].word_multiplier
            } 
            if (adjacent_point[k]) {
                if (adjacent_point[k][w[k]+(joker?"1":"0")] === undefined) console.warn("undefined")
                adj_points = adj_points + adjacent_point[k][w[k]+(joker?"1":"0")]
                // let d = (joker_positions[i].indexOf(k) !== -1) ? LETTERS[w[k]].pts : 0
                // a -= d
            }
            total_points += p
        }
        total_points *=  multi_word 
        // if (!vertical && position_group.indices[0]===111 && i === 203) {
        //     console.log("XXXX")
        //     console.log("raw_found_words[i]", raw_found_words[i])
        //     console.log("adjacent_point", adjacent_point)
        //     console.log("adj_points", adj_points)
        //     console.log("multi_word", multi_word)
        //     console.log("total_points", total_points)
        // }

        return total_points + adj_points + (n_letter_used[i] === 7 ? 50 : 0)
    })
    // if (!vertical && position_group.indices[0]===111) {
    //     console.log("................................")
    //     console.log("vertical", vertical)
    //     console.log("k=", position_group.indices[0])
    //     console.log("fixed_c", fixed_c)
    //     console.log("fixed_c_pts", fixed_c_pts)
    //     console.log("free_c", free_c)
    //     console.log("position_group", position_group)
    //     console.log("pos_multiplier", pos_multiplier)
    //     console.log("arr_free_constraints", arr_free_constraints)
    //     console.log("joker_positions", joker_positions)
    //     console.log("adjacent_point", adjacent_point)
    //     console.log("raw_found_words", raw_found_words)
    //     console.log("found_words", found_words)
    //     console.log("word_letter_points", word_letter_points)
    //     console.log("................................")
    // }

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



const findValidCellsAndOrthogonalWords = (fixed_letters, arr_fixed_letters) => {
    if (arr_fixed_letters[112] === null) return [{index: 112, vertical: null, horizontal: null}]
    const cells = unique(fixed_letters.map(e=>Object.values(MAPPING.NEIGHBORS[e.index])).flat().sort((a, b)=>a>b))
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
        // console.log("======================")
        // console.log("cell", cell)
        // console.log("ltrs", ltrs)
        let p = POINTS[cell.index]
        let n_h, w_h, l_h, lp_h, p_h, l_j_h
        if (cell.horizontal) {
            n_h = cell.horizontal.length
            w_h = findWords(ltrs, n_h, n_h, cell.horizontal, Array(n_h).fill(null))
            l_h = w_h.map(e=>e.word.slice(cell.null_index.h, cell.null_index.h+1))
            l_j_h = w_h.map(e=>e.joker.indexOf(cell.null_index.h) !== -1)
            lp_h = w_h.map((e, i)=>l_j_h[i] ? 0 : LETTERS[l_h[i]].pts )
            // lp_h = w_h.map((e, i)=>e.joker.indexOf(cell.null_index.h) === -1 ? LETTERS[l_h[i]].pts : 0)
            p_h = lp_h.map(e=>(e * p.letter_mutliplier + cell.horizontal_fixed_points) * p.word_multiplier)
        }
        let n_v, w_v, l_v, lp_v, p_v, l_j_v
        if (cell.vertical) {
            n_v = cell.vertical.length
            w_v = findWords(ltrs, n_v, n_v, cell.vertical, Array(n_v).fill(null))
            l_v = w_v.map(e=>e.word.slice(cell.null_index.v, cell.null_index.v+1))
            l_j_v = w_v.map(e=>e.joker.indexOf(cell.null_index.v) !== -1)
            lp_v = w_v.map((e, i)=>l_j_v[i] ? 0 : LETTERS[l_v[i]].pts )
            p_v = lp_v.map(e=>(e * p.letter_mutliplier + cell.vertical_fixed_points) * p.word_multiplier)
            // if (cell.index === 111) {
            //     console.log(w_v)
            //     console.log(l_v)
            //     console.log(lp_v)
            //     console.log(p_v)
            // }
        }
        return {
            index: cell.index,
            v: l_v !==undefined ? l_v : null,
            h: l_h !==undefined ? l_h : null,
            p,
            p_v,
            p_h,
            l_j_h,
            l_j_v,
        }
    })
}


const buildWordsFromFreeCell = (index, arr_fixed_letters) => {
    const getLtrs = (index, ltr=[], pts=[], dir="left") => {
        let n = MAPPING.NEIGHBORS[index][dir]
        if (n !== null) {
            if (arr_fixed_letters[n] !== null) {
                ltr.push(arr_fixed_letters[n].letter === "_" ? arr_fixed_letters[n].joker : arr_fixed_letters[n].letter)
                pts.push(arr_fixed_letters[n].letter === "_" ? 0: LETTERS[arr_fixed_letters[n].letter].pts)
                getLtrs(n, ltr, pts, dir)
            } 
        }
        return {ltr, pts}
    }
    const h_left = getLtrs(index, [], [], "left")
    const h_right = getLtrs(index, [], [], "right")
    const horizontal = [
        ...h_left.ltr.reverse(), 
        null,
        ...h_right.ltr
    ]
    const v_top = getLtrs(index, [], [], "top")
    const v_bottom = getLtrs(index, [], [], "bottom")
    const vertical = [
        ...v_top.ltr.reverse(), 
        null,
        ...v_bottom.ltr
    ]
    //REFACTOR
    return {
        horizontal: horizontal.length === 1 ? null : horizontal,
        vertical: vertical.length === 1 ? null : vertical,
        null_index: {v: v_top.ltr.length, h: h_left.ltr.length},
        vertical_fixed_points: vertical.length === 1 ? null : [...v_top.pts, ...v_bottom.pts].reduce((p, c)=>p+c),
        horizontal_fixed_points: horizontal.length === 1 ? null : [...h_left.pts, ...h_right.pts].reduce((p, c)=>p+c),
    }
}

const unique = (arr) => {
    const u = new Set(arr)
    return [...u]
}

const buildBoardIndexArray = (letters) => {
    let arr = Array(15 * 15).fill(null)
    letters.map(e=>arr[e.index] = e)
    return arr
}