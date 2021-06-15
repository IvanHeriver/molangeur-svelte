<script>
    export let game
    export let onclick
    export let ondelete

    const onDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        ondelete(game.id)
    }
    const getDate = (x) => {
        let d = new Date(x)
        return d.toLocaleDateString()
    }
    const getTime = (x) => {
        let d = new Date(x)
        d = d.toLocaleTimeString().split(":")
        return d[0]+":"+d[1]
    }
</script>

<div class="game" on:click={()=>onclick(game.id)}>
    <div class="title">
        <div class="main">
            <div> Partie créée le <span class="bold">{getDate(game.create_date)}</span>
           à <span class="bold">{getTime(game.create_date)}</span>
            </div>
            <div>Dernière modification le <span class="bold">{getDate(game.update_date)}</span>
                à <span class="bold">{getTime(game.update_date)}</span></div>
        </div>
        <div class="secondary">
           <button class="simple" on:click={onDelete}>
               Supprimer
           </button>
        </div>
    </div>
    <!-- <div>Dernière modification le <span class="bold">{getDate(game.update_date)}</span>
        à <span class="bold">{getTime(game.update_date)}</span></div> -->
    <div>Score: <span class="bold">{game.players[0].score}</span></div>
    <div>Score de Maître MoLangeur: <span class="bold">{game.players[0].molangeur}</span></div>

    <div class="img">
        <img src={game.img} alt="">
    </div>
    
</div>

<style>
    .img {
        display: flex;
        justify-content: center;
        /* background-color: red; */
        margin: 1em;
        margin-bottom: 0;
    }
    img {
        object-fit: contain;
        width: 100%;
    }
    .game {
        border: 1px solid grey;
        padding: 0.5em;
        border-radius: 0.25em;
        cursor: pointer;
        max-width: 400px;
    }
    .game:hover {
        background-color: rgb(245, 245, 245);
    }

    .title {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid grey;
    }

    .bold {
        font-weight: bold;
    }
</style>