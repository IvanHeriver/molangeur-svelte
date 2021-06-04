console.log(" ############################# CONSTANTS")
export const LETTERS = {
    _: [0, 2],
    // _: [0, 10],
    A: [1, 9],
    B: [3, 2],
    C: [3, 2],
    D: [2, 3],
    E: [1, 15],
    F: [4, 2],
    G: [2, 2],
    H: [4, 2],
    I: [1, 8],
    J: [8, 1],
    K: [10, 1],
    L: [1, 5],
    M: [2, 3],
    N: [1, 6],
    O: [1, 6],
    P: [3, 2],
    Q: [8, 1],
    R: [1, 6],
    S: [1, 6],
    T: [1, 6],
    U: [1, 6],
    V: [4, 2],
    W: [10, 1],
    X: [10, 1],
    Y: [10, 1],
    Z: [10, 1]
}
let ltrs = Object.keys(LETTERS).filter(e=>e!=="_")
export const LTRS = ltrs

export const CELLS = {
    letter_double: [3, 11, 36, 38, 45, 52, 59, 92, 96, 98, 102, 108,
         116, 122, 126, 128, 132, 165, 172, 179, 186, 188, 213, 221],
    letter_triple: [20, 24, 76, 80, 84, 88, 136, 140, 144, 148, 200, 204],
    word_double: [16, 28, 32, 42, 48, 56, 64, 70, 112, 154, 160, 168, 176, 182, 192, 196, 208],
    word_triple: [0, 7, 14, 105, 119, 210, 217, 224]
}

export const POINTS = Array(15 * 15).fill(0).map((e, i) => {
    const ld = CELLS.letter_double.indexOf(i)===-1 ? 1 : 2
    const lt = CELLS.letter_triple.indexOf(i)===-1 ? 1 : 3
    const wd = CELLS.word_double.indexOf(i)===-1 ? 1 : 2
    const wt = CELLS.word_triple.indexOf(i)===-1 ? 1 : 3
    return {
        letter_mutliplier: ld * lt,
        word_multiplier: wd * wt
    }
})
console.log(POINTS)


let COLS_ARRAY = Array(15).fill(0).map((e, i)=>Array(15).fill(0).map((e, j)=>j + (i * 15)))
export const COLS = COLS_ARRAY
let ROWS_ARRAY = Array(15).fill(0).map((e, i)=>Array(15).fill(0).map((e, j)=>(j * 15) + i))
export const ROWS = ROWS_ARRAY

const computeAllPossibleWordPositions = () => {
    const positions = {V: Array(225), H: Array(225)}
    COLS.map(C => {
        for (let k = 0; k < 15; k++) {
            // for (let l = 1; l <= Math.min(7, (15 - k)); l++) {
                // console.log(C[k])
                positions.V[C[k]] = []
            for (let l = 1; l <= (15 - k); l++) {
                positions.V[C[k]].push(C.slice(k, k+l))

            }
        }
    })
    ROWS.map(R => {
        for (let k = 0; k < 15; k++) {
            // for (let l = 1; l <= Math.min(7, (15 - k)); l++) {
            positions.H[R[k]] = []
            for (let l = 1; l <= (15 - k); l++) {
                positions.H[R[k]].push(R.slice(k, k+l))
            }
        }
    })
    return positions
}
let AP = computeAllPossibleWordPositions()
export const WORD_POSITIONS = AP


const computeIndexRowColMapping = () => {
    const index_from_row_col = Array(15).fill(0).map(e=>Array(15).fill(0))
    const row_col_from_index = Array(15*15).fill(0)
    const neighbors_from_index = Array(15*15).fill(0)
    const getIndexFromRowCol = (row, col) => col * 15 + row
    let k = 0
    for (let col = 0; col<15; col++) {
        for (let row = 0; row<15; row++) {
            index_from_row_col[row][col] = k
            row_col_from_index[k] = {row, col}
            neighbors_from_index[k] = {
                top: row > 0 ? getIndexFromRowCol(row-1, col) : null,
                bottom: row < 14 ? getIndexFromRowCol(row+1, col) : null,
                left: col > 0 ? getIndexFromRowCol(row, col-1) : null,
                right: col < 14 ? getIndexFromRowCol(row, col+1) : null,
            }
            k++
        }
    }
    return {
        FROM_INDEX: row_col_from_index,
        TO_INDEX: index_from_row_col, 
        NEIGHBORS: neighbors_from_index
    }
}
export const MAPPING = computeIndexRowColMapping()
// export const INDEX_FROM_ROW_COL = mapping.
// export const ROW_COL_FROM_INDEX = mapping.row_col_from_index
// export const NEIGHBORS_FROM_INDEX = mapping.neighbors_from_index

console.log("COLS", COLS)
console.log("ROWS", ROWS)
console.log("MAPPING", MAPPING)
console.log("WORD_POSITIONS", WORD_POSITIONS)
// console.log("ROW_COL_FROM_INDEX", ROW_COL_FROM_INDEX)
// console.log("NEIGHBORS_FROM_INDEX", NEIGHBORS_FROM_INDEX)


console.log(" ############################# END CONSTANTS")