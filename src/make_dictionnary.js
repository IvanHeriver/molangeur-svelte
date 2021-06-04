const makeDictionnary = () => {
    fetch("./ALL_WORDS.txt").then(e=>e.text()).then(e=>{
        const dico = buildDictionnaryObject(e.split("\r\n"))
    })
}

const buildDictionnaryObject = (words) => {
    let dico = {};
    const addWordToDico = (w, D, k=0) => {
        let l = w.slice(k, k+1)
        if (l) {
            if (D[l] === undefined) D[l] = {}
            D[l] = addWordToDico(w, D[l], k+1)
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

export default makeDictionnary