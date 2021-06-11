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
        return d.toLocaleTimeString()
    }
</script>

<div class="game" on:click={()=>onclick(game.id)}>
    <div class="title">
        <div class="main">Partie créée le <span class="date">{getDate(game.create_date)}</span>
           à <span class="date">{getTime(game.create_date)}</span></div>
        <div class="secondary">
           <!-- <span class="id">
               {`(id #${game.id})`}
           </span> -->
           <button class="simple" on:click={onDelete}>
               Supprimer
           </button>
        </div>
    </div>
    <div>Dernière modification le <span class="date">{getDate(game.update_date)}</span>
        à <span class="date">{getTime(game.update_date)}</span></div>
    <!-- <div class="content"> -->
    <!-- <img src={game.img} alt="" width="200px" height="200px"> -->
    <div class="img">
        <img src={game.img} alt="">
    </div>
    
           <!-- <div class="info">
               <div>Ton score: <span class="bold">{game.players[0].score}</span></div>
               <div>Score de Maître MoLangeur: <span class="bold">{game.players[0].molangeur}</span></div>
               <div>Différence de score: <span class="bold">{game.players[0].molangeur - game.players[0].score}</span></div>
               <div>Nombre de tours faits: <span class="bold">{game.round}</span></div>

           </div> -->
    <!-- </div> -->
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
        /* margin-bottom: 0.25em; */
        max-width: 400px;
    }
    .game:hover {
        background-color: rgb(223, 223, 223);
    }

    .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid grey;
    }
    .date {
        font-weight: bold;
    }
    /* .content {
        display: flex;
        justify-content: flex-start;
        font-size: 0.9em;
        padding-top: 0.5em;
    }

    .bold {
        font-weight: bold;
    } */
</style>