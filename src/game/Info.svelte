<script>
    import {GameStateStore} from './GameStore'

    let id = $GameStateStore.id
    $: score = 0
    $: molangeur_score = 0
    $: difference = 0
    $: molangeur_best = 0
    $: {
        let player = $GameStateStore.players.filter(e=>e.id === id)[0]
        let molangeur = $GameStateStore.molangeur
        score = player ? player.score : 0
        molangeur_score = molangeur.score
        molangeur_best = molangeur.next_score
        difference = molangeur_score - score
    }
</script>

<div class="score">
<div>
    Score: <span class="value">{score}</span>
</div>
<div>
    Score de maître MoLangeur: <span class="value">{molangeur_score}</span>
</div>
<div>
    Différence avec maître MoLangeur: <span class="value">{difference}</span>
</div>
<div>
    Meilleur score possible: <span class="value">{molangeur_best}</span>
</div>
</div>

<style>
    .score {
        font-size: 1em;
    }
    .value {
        font-weight: bold;
        color: rgb(61, 0, 0);
    }
</style>