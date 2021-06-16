export const LETTERS = {
    // _: {pts: 0, n: 10, vowel: true, consonant: true},
    _: {pts: 0, n: 2, vowel: true, consonant: true},
    A: {pts: 1, n: 9, vowel: true, consonant: false},
    B: {pts: 3, n: 2, vowel: false, consonant: true},
    C: {pts: 3, n: 2, vowel: false, consonant: true},
    D: {pts: 2, n: 3, vowel: false, consonant: true},
    E: {pts: 1, n: 15, vowel: true, consonant: false},
    F: {pts: 4, n: 2, vowel: false, consonant: true},
    G: {pts: 2, n: 2, vowel: false, consonant: true},
    H: {pts: 4, n: 2, vowel: false, consonant: true},
    I: {pts: 1, n: 8, vowel: true, consonant: false},
    J: {pts: 8, n: 1, vowel: false, consonant: true},
    K: {pts: 10, n: 1, vowel: false, consonant: true},
    L: {pts: 1, n: 5, vowel: false, consonant: true},
    M: {pts: 2, n: 3, vowel: false, consonant: true},
    N: {pts: 1, n: 6, vowel: false, consonant: true},
    O: {pts: 1, n: 6, vowel: true, consonant: false},
    P: {pts: 3, n: 2, vowel: false, consonant: true},
    Q: {pts: 8, n: 1, vowel: false, consonant: true},
    R: {pts: 1, n: 6, vowel: false, consonant: true},
    S: {pts: 1, n: 6, vowel: false, consonant: true},
    T: {pts: 1, n: 6, vowel: false, consonant: true},
    U: {pts: 1, n: 6, vowel: true, consonant: false},
    V: {pts: 4, n: 2, vowel: false, consonant: true},
    W: {pts: 10, n: 1, vowel: false, consonant: true},
    X: {pts: 10, n: 1, vowel: false, consonant: true},
    Y: {pts: 10, n: 1, vowel: true, consonant: false},
    Z: {pts: 10, n: 1, vowel: false, consonant: true},
}
// export const LETTERS = {
//     _: {pts: 0, n: 1, vowel: true, consonant: true},
//     A: {pts: 1, n: 0, vowel: true, consonant: false},
//     B: {pts: 3, n: 0, vowel: false, consonant: true},
//     C: {pts: 3, n: 0, vowel: false, consonant: true},
//     D: {pts: 2, n:0, vowel: false, consonant: true},
//     E: {pts: 1, n: 2, vowel: true, consonant: false},
//     F: {pts: 4, n: 0, vowel: false, consonant: true},
//     G: {pts: 2, n: 0, vowel: false, consonant: true},
//     H: {pts: 4, n: 0, vowel: false, consonant: true},
//     I: {pts: 1, n: 0, vowel: true, consonant: false},
//     J: {pts: 8, n: 0, vowel: false, consonant: true},
//     K: {pts: 10, n: 0, vowel: false, consonant: true},
//     L: {pts: 1, n: 2, vowel: false, consonant: true},
//     M: {pts: 2, n: 1, vowel: false, consonant: true},
//     N: {pts: 1, n: 0, vowel: false, consonant: true},
//     O: {pts: 1, n: 0, vowel: true, consonant: false},
//     P: {pts: 3, n: 1, vowel: false, consonant: true},
//     Q: {pts: 8, n:0, vowel: false, consonant: true},
//     R: {pts: 1, n: 0, vowel: false, consonant: true},
//     S: {pts: 1, n: 0, vowel: false, consonant: true},
//     T: {pts: 1, n: 0, vowel: false, consonant: true},
//     U: {pts: 1, n: 0, vowel: true, consonant: false},
//     V: {pts: 4, n: 0, vowel: false, consonant: true},
//     W: {pts: 10, n: 0, vowel: false, consonant: true},
//     X: {pts: 10, n:0, vowel: false, consonant: true},
//     Y: {pts: 10, n: 0, vowel: true, consonant: false},
//     Z: {pts: 10, n: 0, vowel: false, consonant: true},
// }
let ltrs = Object.keys(LETTERS).filter(e=>e!=="_")
export const LTRS = ltrs

export const CELLS = {
    letter_double: [3, 11, 36, 38, 45, 52, 59, 92, 96, 98, 102, 108,
         116, 122, 126, 128, 132, 165, 172, 179, 186, 188, 213, 221],
    letter_triple: [20, 24, 76, 80, 84, 88, 136, 140, 144, 148, 200, 204],
    word_double: [16, 28, 32, 42, 48, 56, 64, 70, 112, 154, 160, 168, 176, 182, 192, 196, 208],
    word_triple: [0, 7, 14, 105, 119, 210, 217, 224]
}
// export const CELLS = {
//     letter_double: [3, 11, 36, 38, 45, 52, 59, 92, 96, 98, 102, 108,
//          116, 122,  128, 132, 165, 172, 179, 186, 188, 213, 221],
//     letter_triple: [20, 24, 76, 80, 84, 88, 136, 140, 144, 148, 200, 204],
//     word_double: [16, 28, 32, 42, 48, 56, 64, 70, 112, 154, 160, 168, 176, 182, 192, 196, 208, 126],
//     word_triple: [0, 7, 14, 105, 119, 210, 217, 224]
// }

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

let COLS_ARRAY = Array(15).fill(0).map((e, i)=>Array(15).fill(0).map((e, j)=>j + (i * 15)))
export const COLS = COLS_ARRAY
let ROWS_ARRAY = Array(15).fill(0).map((e, i)=>Array(15).fill(0).map((e, j)=>(j * 15) + i))
export const ROWS = ROWS_ARRAY

const computeAllPossibleWordPositions = () => {
    const positions = {V: Array(225), H: Array(225)}
    COLS.map(C => {
        for (let k = 0; k < 15; k++) {
                positions.V[C[k]] = []
            for (let l = 1; l <= (15 - k); l++) {
                positions.V[C[k]].push(C.slice(k, k+l))

            }
        }
    })
    ROWS.map(R => {
        for (let k = 0; k < 15; k++) {
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