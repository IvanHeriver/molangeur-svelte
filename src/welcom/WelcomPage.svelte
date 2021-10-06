<script>
    import Game from "./Game.svelte"
    import {getAllGames, deleteGame, addGame} from "../logic/DB"
    // import {getGameList} from "../logic/game"

    export let launchGame;
    // export let deleteGame;

    const onDeleteGame = (id) => {
        deleteGame(id, ()=>{
            getGameList()
        })
    }
    const getGameList = () => {
        getAllGames((list) => {
            game_list = [...list.sort((a,b)=>b.update_date - a.update_date)]
        })
    }
    const importGame = () => {
        const i = document.createElement("input");
        i.type = "file";
        i.accept = ".molangeur";
        i.multiple = false;
        i.addEventListener("change", function() {
            const f = this.files[0]
            const reader = new FileReader()
            reader.readAsText(f)
            reader.onload = () => {
                const str = reader.result
                const game = JSON.parse(str)
                console.log(game)
                // change the id to prevent conflict
                game.id = Math.random().toString().slice(2) 
                addGame(game, ()=>{
                    getGameList()
                })
            }
            reader.onerror = () => {
                console.error("An error occured while reading the file...")
            }
        });
        i.click()
    }
    $: game_list = []
    getGameList()
    
</script>

<div class="container">
    <div class="intro">
        <p class="bold">
            Bienvenue dans MoLangeur!
        </p>
        <p>
            Commence une nouvelle partie ou continue une partie déjà commencée (s'il y en a).
            Tu peux à tout moment revenir à ce menu en cliquant sur le logo MoLangeur en haut à gauche de l'écran.
            Bon jeu!
        </p>
    </div>
    <div class="new-games">
        <button on:click={launchGame(null)}>
            Nouvelle Partie
        </button>
        <button on:click={importGame}>
            Importer une partie
        </button>
    </div>
    <div class="game-list-header">
        Parties existantes (clique sur un partie pour continuer à jouer): 
    </div>
    <div class="game-list">
        
    {#each game_list as game}
         <Game game={game} onclick={launchGame} ondelete={onDeleteGame}/>
    {:else}
         <span class="nogame">
            Aucune partie... Crée une partie ci-dessus pour commencer à jouer.
         </span>
    {/each}
    </div>
</div>


<style>
    .container {
        padding: 0.5em;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .intro {
        text-align: center;
        padding: 2em;
        padding-top: 0;
    }
    .new-games {
        display: flex;
        justify-content: center;
        padding: 2em;
        padding-top: 0;
    }
    button {
        padding: 1em;
        margin: 0.25em;
    }
    .nogame {
        font-style: italic;
        font-size: 0.8em;
    }
    .game-list-header {
        margin-bottom: 0.5em;
    }
    .bold {
        font-weight: bold;
    }
    .game-list {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        width: 100%;
        gap: 0.25em;
    }
    
</style>