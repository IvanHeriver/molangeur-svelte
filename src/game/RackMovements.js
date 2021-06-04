let rack = Array(7).fill(null)
let rack_tmp
let current

const reset = () => {
    rack_tmp = [...rack]
    computeTranslate()
}
const get = () => {
    return rack_tmp.map((e, i)=>{return e ? {id: e.id, index: i} : undefined}).filter(e=>e)
}
const init = (rack_letters, grab_letter) => {
    const rack_container = document.querySelector(".rack-letters")
    const game_container = document.querySelector(".game")
    current = {...grab_letter} // makes a deep copy
    current.dom = game_container.querySelector(`div[cui=\"${grab_letter.id}\"]`)
    rack = Array(7).fill(null)
    rack_letters.filter(e=>e.id!==grab_letter.id).map(e=>{
        let l = {...e} // makes a deep copy
        l.dom = rack_container.querySelector(`div[cui=\"${l.id}\"]`)
        rack[l.index] = l
        return e
    })
    rack_tmp = [...rack]

    // console.log(rack)
    // console.log(rack_tmp)
    // console.log(current)
}

const update  = (index) => {
    if (index !== undefined) {
        moveLetters(index, whereShouldItMove(index))
        computeTranslate()
    }
}

const whereShouldItMove = (index) => {
    if (rack_tmp[index]) {
        let k = 1
        while ((index - k) >= 0 || (index + k) < 7) {
            // look left
            if ((index - k) >= 0) {
                if (rack_tmp[index - k] === null) {
                    return {left: true, k: k}
                }
            }
            // look right
            if ((index + k) < 7) {
                if (rack_tmp[index + k] === null) {
                    return {left: false, k: k}
                }
            }
            if (k > 100) {
                console.log("inifinit loop")
                return null
            }
            k += 1
        }
        return null
    }
    return {left: true, k: 0}
}

const moveLetters = (from, movement) => {
    let start, end
    if (movement.left) {
        start = from - movement.k + 1
        end = from + 1
        const tmp = rack_tmp.slice(start, end)
        rack_tmp = [...rack_tmp.slice(0, start -1), ...tmp, ...rack_tmp.slice(start - 1, start),...rack_tmp.slice(end, 7)].flat()
    } else {
        start = from
        end = from + movement.k 
        const tmp = rack_tmp.slice(start, end)
        rack_tmp = [...rack_tmp.slice(0, start), ...rack_tmp.slice(end, end + 1), ...tmp, ,...rack_tmp.slice(end + 1, 7)].flat()
    }
}

const computeTranslate = () => {
    const d = rack.map((e, i)=>{
        for (let k = 0; k < 7; k++) {
            if (e===rack_tmp[i-k]) return -k
            if (e===rack_tmp[i+k]) return k
        }
    })
    d.map((e, i)=>{
        if (rack[i]) {
            rack[i].dom.style.transform = `translateX(${e * 105.5}%)`
        }
    })
}

export default {init, update, reset, get}