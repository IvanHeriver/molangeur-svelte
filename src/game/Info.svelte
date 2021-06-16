<script>
    import {GameStateStore} from './GameStore'
    import {LETTERS} from "../logic/constants"
    import {getRowColIndex} from "../logic/utils" // FIXME: I should import all helper function: getNiceWordCoord() down below is a duplicate of what is defined in MasterMolangeur.svelte

    let judgments = [
        "Le meilleur score possible! Chapeau bas!",
        "Le meilleur score possible! Chapeau bas!",
        "Le meilleur score possible! Chapeau bas!",
        "Le meilleur score possible! Félicitation!",
        "Le meilleur score possible! Félicitation!",
        "Le meilleur score possible! Bravo!",
        "Le meilleur score possible! Bravo!",
        "Le meilleur score possible! Bravo!",
        "Le meilleur score possible! Excellent!",
        "Le meilleur score possible! Parfait!",
        "Le meilleur score possible! Nickel!",
        "Le meilleur score possible! Bien joué!",
        "Le meilleur score possible! Bien joué!",
        "Le meilleur score possible! Bien joué!",
        "Le meilleur score possible! Impressionnant!",
        "Le meilleur score possible! Impressionnant!",
    ]
    const getNiceWordCoord = (index) => {
        const row_names = Array(15).fill(0).map((e, i)=>i+1)
        const col_names = Object.keys(LETTERS).filter(e=>e!=="_").filter((e, i)=>i<15)
        const coord = getRowColIndex(index)
        return row_names[coord.row] + col_names[coord.col]
    }
    const getRankNiceText = (rank) => {
        if (rank === 1) return "re"
        if (rank > 1) return "ème"
    }

    $: last_coord = null;
    $: last_word = null;
    $: last_score = null;
    $: last_molangeur = null;
    $: n_better_words = null;
    $: last_rank = null;
    $: id = null
    $: score = 0
    $: molangeur_score = 0
    // $: difference = 0
    $: molangeur_best = null
    $: n_remaining_letters = 0
    $: average_rank = null
    
    $: word = ""
    $: judgment = ""
    $: action = ""
    $: game_over = false
    $: {
        if ($GameStateStore) {
            id = $GameStateStore.player_id
            let player = $GameStateStore.players.filter(e=>e.id === id)[0]
            let molangeur = $GameStateStore.molangeur
            score = player ? player.score : 0
            molangeur_score = player ? player.molangeur : 0
            molangeur_best = molangeur ? (molangeur.next_score ? molangeur.next_score : null) : null
            n_remaining_letters = $GameStateStore.letters_left
            if ($GameStateStore.history && $GameStateStore.history.length>0) {
                let ranks = $GameStateStore.history.map(e=>e.rank)
                average_rank = ranks.reduce((a, b)=>a+b)/ranks.length
                let last_game = $GameStateStore.history.slice(-1)[0]
                last_rank = last_game.rank
                last_score = last_game.evaluation.score
                last_word = last_game.evaluation.words[0]
                last_molangeur = last_game.molangeur
                n_better_words = last_game.n_better_words !== undefined ? last_game.n_better_words : null
                last_coord = getNiceWordCoord(last_game.evaluation.all_words[0][0].index)
            }
            judgment = ""
            word = ""
            game_over = $GameStateStore.game_over
            if (game_over) {
                action = "Partie terminée"
            } else if ($GameStateStore.letters.filter(e=>e.board && e.free).length===0) {
                action = "Pose des lettres sur la grille pour former un mot valide."
            } else {
                if (!$GameStateStore.evaluation) {
                    action = ""
                    word = "Le positionnement des lettres sur la grille n'est pas valide."
                } else if (!$GameStateStore.evaluation.validity) {
                    let invalid_words = $GameStateStore.evaluation.words.filter((e, i) => !$GameStateStore.evaluation.validities[i])
                    if (invalid_words.length === 1) {
                        word = `Le mot ${invalid_words[0]} n'est pas valide.`
                    } else {
                        word = `Les mots ${invalid_words.slice(0, - 1).reduce((a, b)=>a+", "+b)} et ${invalid_words.slice(-1)} ne sont pas valides.`
                    }
                    action = ""
                } else if ($GameStateStore.evaluation.validity) {
                    if (molangeur_best!==null && molangeur_best === $GameStateStore.evaluation.score) {
                        judgment = judgments[Math.floor(Math.random() * judgments.length)]
                    }
                    word = `Le mot ${$GameStateStore.evaluation.words[0]} te rapporterai ${$GameStateStore.evaluation.score} points.`
                    action = "Clique sur \"Soumettre\" pour le jouer"
                }
            }
        }
    }

</script>
<div class="container">
    <div class="score">
        <div class="summary-games">
            {#if molangeur_score > 0}
        <div>
            Score: <span class="value">{score}</span> / <span class="value">{molangeur_score}</span> (<span class="value">{(score/molangeur_score*100).toFixed(1)+"%"}</span>)
        </div>
        {/if}
        {#if average_rank}
        <div>
            Classement moyen: <span class="value">{average_rank.toFixed(1)}</span>
        </div>
        {/if}
        </div>
        {#if last_score!=null && last_rank!==null && n_better_words !== null}
             <div class="last-game">
                Précédement, tu as joué <span class="value">{last_word}</span> en position <span class="value">{last_coord}</span> pour un score de <span class="value">{last_score}</span>, 
                {#if last_rank===1}
                le meilleur score possible.
                {:else}
                le <span class="value">{last_rank}<sup>{getRankNiceText(last_rank)}</sup></span> meilleur score 
                {#if n_better_words === 1}
                (seul <span class="value">{n_better_words}</span> mot était meilleur)
                {:else}
                (<span class="value">{n_better_words}</span> mots étaient meilleurs)
                {/if}
                {/if}
                
             </div>
        {/if}
        <!-- <div>
            Score de maître MoLangeur: <span class="value">{molangeur_score}</span>
        </div> -->
        </div>
    <div class="state">
        {#if !game_over}
        <div>
            {#if molangeur_best}
                Score max au prochain coup: <span class="value">{molangeur_best}</span>
            {/if}
            
        </div>
        <!-- <div style='font-size: 0.8em;'>
            {`${screen_res.x} x ${screen_res.y}`}
        </div> -->
        <div>
            Lettres restantes: <span class="value">{n_remaining_letters}</span>
        </div>
        {:else}
        <div style="visibility: hidden;">
            ...
        </div>
        {/if}
    </div>
    <div class="communication">
        
        <div class="word">
            {word + " " + judgment}
        </div>
        <!-- <div class="judgment">
            {judgment}
        </div> -->
        <div class="action">
            {action}
        </div>

    </div>
</div>
<style>
    .container {
        font-size: 1em;
        /* background-color: rgb(255, 191, 191); */
        width: 100%;
    }
    .score {
        border: 1px solid grey;
        border-radius: 0.25em;
        background-color: var(--xlight-col);
        padding: 0.125em 0.25em;
    }
    .summary-games {
        
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .last-game {
        border-top: 1px solid grey;
        text-align: center;
        line-height: 1.2;
    }
    .value {
        font-weight: bold;
        color: var(--xstrong-col);
        
    }
    .state {
        /* font-size: 0.95em; */
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 1em;
        font-size: 0.9em;
        line-height: 1.2;
        padding: 0.125em 0.125em;
        /* background-color: rgb(191, 245, 255); */
    }
    .communication {
        /* font-size: 0.95em; */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border-top: 1px solid grey;
        
        /* border-bottom: 1px solid grey; */
        /* background-color: rgb(203, 191, 255); */
        /* min-height: 7ch; */
    }
    .communication > div {
        color: hsl(0, 48%, 40%);
        /* font-size: 1.05em; */
        text-align: center;
    }
</style>