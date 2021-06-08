<script>
    import Game from "./Game.svelte"
    export let launchGame;

    let game_ids = []
    let games = JSON.parse(localStorage.getItem("games"))
    if (games) game_ids = Object.keys(games)
    let game_list = game_ids.map(e=>games[e]).sort((a, b) => b.update_date - a.update_date)
    console.log(game_list)

</script>

<div class="container">
    <div class="intro">
        Bienvenue dans MoLangeur!
    </div>
    <div class="new-games">
        <button on:click={launchGame(null)}>
            Nouvelle Partie Solo (Duplicate)
        </button>
        <button disabled>
            Nouvelle Partie Solo (Classique)
        </button>
    </div>

    <div class="game-list">
        <div class="game-list-header">
            Parties existantes (clique sur un partie pour continuer à jouer): 
        </div>
    {#each game_list as game}
         <Game game={game} onclick={launchGame}/>
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
    }
    .intro {
        text-align: center;
        padding: 2em;
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
    
</style>