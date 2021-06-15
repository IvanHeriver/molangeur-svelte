export const isInArray = (array, value) => {
    return array.indexOf(value) !== -1
}
export const unique = (arr) => {
    const u = new Set(arr)
    return [...u]
}
// export const arrHasObj = (arr, obj, keys) => {
//     if (!keys) keys = Object.keys(obj)
//     return arr.filter(e=>{
//         keys.filter(k=>e[k]!==obj[k]).length === 0
//     }).length > 0
// }
export const getRowColIndex = (index) => {
    let o = Math.floor(index / 15)
    return {
        row: index - o * 15, 
        col: o
    }
}
export const getColIndex = (index) => Math.floor(index / 15)
export const getRowIndex = (index) => index - Math.floor(index/15) * 15
export const getIndexFromRowCol = (row, col) => col * 15 + row

export  const shuffle = (arr) => {
    // source : https://stackoverflow.com/a/2450976
    let current_index = arr.length, tmp_value, random_index
    // While there remain elements to shuffle, shuffle
    while (0 !== current_index) {
        // Pick a random index from the remaining elements
        random_index = Math.floor(Math.random() * current_index)
        current_index -= 1
        // Swap the corresponding element with the current element
        tmp_value = arr[current_index]
        arr[current_index] = arr[random_index]
        arr[random_index] = tmp_value
    }
    return arr;
}

// export const getNeighborsIndex = (index) => {
//     const col = getColIndex(index)
//     const row = getRowIndex(index)
    
//     let neighbors = [
//         getIndexFromRowCol(row, col - 1),
//         getIndexFromRowCol(row, col + 1),
//         getIndexFromRowCol(row - 1, col),
//         getIndexFromRowCol(row + 1, col),
//     ]
//     if (row === 0) neighbors[2] = -1
//     if (row === 14) neighbors[3] = -1
//     if (col === 0) neighbors[0] = -1
//     if (col === 14) neighbors[1] = -1
//     return neighbors
//     // return neighbors.filter(e=>e>=0)
// }
export const getNeighborsIndex = (index) => {
    const col = getColIndex(index)
    const row = getRowIndex(index)
    return [
        getTopNeighbor(row, col),
        getBottomNeighbor(row, col),
        getLeftNeightbor(row, col),
        getRightNeightbor(row, col),
    ]
}
const getTopNeighbor = (row, col) => {
    if (row === 0) return -1
    return getIndexFromRowCol(row - 1, col)
}
const getBottomNeighbor = (row, col) => {
    if (row === 14) return -1
    return getIndexFromRowCol(row + 1, col)
}
const getLeftNeightbor = (row, col) => {
    if (col === 0) return -1
    return getIndexFromRowCol(row, col - 1)
}
const getRightNeightbor = (row, col) => {
    if (col === 14) return -1
    return getIndexFromRowCol(row, col + 1)
}

export const getIndexSeq = (start, end, row=true) => {
    // const getIndexFromCoord = (coord) => getIndexFromRowCol(coord.row, coord.col)
    let coord
    let seq = [start]
    let index = start
    if (row) {
        while (index != end) {
            coord = getRowColIndex(index)
            index = getRightNeightbor(coord.row, coord.col)
            if (index > 0) {
                seq.push(index)
            } else {
                break
            }
            if (index > 224) {
                throw "Not Supposed to happen: contact developer"
            }
        }
    } else {
        while (index != end) {
            coord = getRowColIndex(index)
            index = getBottomNeighbor(coord.row, coord.col)
            if (index > 0) {
                seq.push(index)
            } else {
                break
            }
            if (index > 224) {
                throw "Not Supposed to happen: contact developer"
            }
        }
    }
    return seq
}

// given an array of letter, build the board array
// with null where there is no letter and the letter otherwise
export const buildBoardIndexArray = (letters) => {
    let arr = Array(15 * 15).fill(null)
    letters.map(e=>arr[e.index] = e)
    return arr
}
// transpose a board array
export const transposeBoardIndexArray = (array) => {
    let arr = Array(15 * 15).fill(null)
    array.map(e=>{
        if (e) {
            let coord = getRowColIndex(e.index)
            arr[getIndexFromRowCol(coord.col, coord.row)] = e
        }
    })
    return arr
}

export const buildBoardIndexObject = (letters) => {
    let obj = {}
    Array(15 * 15).fill(null).map((e, i)=>obj[i] = null)
    letters.map(e=>obj[e.index] = e)
    return obj
}

export const consecutiveNonNullItems = (array) => {
    const output = [];
    let  current = null;
    array.map((e, i)=> {
        if (e !== null) {
            if (current !== null) {
                current.push(e)
            } else {
                current = [e]
            }
            if (i === array.length - 1) {
                output.push(current)
            }
        } else {
            if (current !== null) {
                output.push(current)
                current = null
            }
        }
        
    })
    return output
}

export const buildRowColArray = (letters, byrow=true) => {
    const arr = Array(15).fill(0).map(e=>Array(15).fill(null))
    letters.map(e=>{
        let coord = getRowColIndex(e.index)
        byrow ? arr[coord.row][coord.col] = e : arr[coord.col][coord.row] = e
    })
    return arr
}


export const removeDuplicatesInObjArray = (arr, keys) => {
    return arr.filter((I, i)=>{
        let res =  arr.slice(i+1, arr.length).filter((J, j) => {
                return keys.map(e=>I[e] === J[e]).reduce((p, c)=>p&&c)
        })
        return res.length === 0
    })
}
