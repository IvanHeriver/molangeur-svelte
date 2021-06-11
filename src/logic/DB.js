let DB
export const initDatabase = (callback) => {
    let DB_OPEN = indexedDB.open("db", 1)
    DB_OPEN.addEventListener("upgradeneeded", ()=>{
        DB = DB_OPEN.result
        if (!DB.objectStoreNames.contains("games")) {
            DB.createObjectStore("games", {keyPath: 'id'})
        }
    })
    DB_OPEN.addEventListener("error", ()=>{
        console.error("DB Error: ", DB_OPEN.error)
    })
    DB_OPEN.addEventListener("success", () => {
        console.log("DB opened")
        DB = DB_OPEN.result
        callback()
    })
}
export const addGame = (game) => {
    let transaction = DB.transaction("games", "readwrite")
    let games = transaction.objectStore("games")
    let request = games.add(game)
    request.addEventListener("success", () => {
        console.log("DB game added")
    })
    request.addEventListener("error", () => {
        console.error("DB Error: ", request.error)
    })
}
export const updateGame = (game) => {
    let transaction = DB.transaction("games", "readwrite")
    let games = transaction.objectStore("games")
    let request = games.put(game)
    request.addEventListener("success", () => {
        console.log("DB game updated")
    })
    request.addEventListener("error", () => {
        console.error("DB Error: ", request.error)
    })
}
export const getGame = (id, callback) => {
    let request = DB.transaction("games", "readonly").objectStore("games").get(id)    
    request.addEventListener("success", () => {
        console.log("DB game retrieved")
        callback(request.result)
    })
}
export const getAllGames = (callback) => {
    let request = DB.transaction("games", "readonly").objectStore("games").getAll()    
    request.addEventListener("success", () => {
        console.log("DB games retrieved")
        callback(request.result)
    })
}
export const deleteGame = (id, callback) => {
    let transaction = DB.transaction("games", "readwrite")
    let games = transaction.objectStore("games")
    let request = games.delete(id)
    request.addEventListener("success", () => {
        console.log("DB game deleted")
        callback()
    })
    request.addEventListener("error", () => {
        console.error("DB Error: ", request.error)
    })
}
export const close = () => {
    DB.close()
}