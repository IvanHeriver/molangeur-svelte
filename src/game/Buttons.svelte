<script>
    import {GameStateStore} from "./GameStore"
    // import {checkWordValidity} from "../logic/dico"
    import Dico from "./Dico.svelte"
    import {moveAllFreeLettersToRack, askForWordSubmission, askForNewGame} from "./GameStateInterface"


    let word_submission_possible = false

    $: {
        if ($GameStateStore) {
            word_submission_possible = ($GameStateStore.evaluation && $GameStateStore.evaluation.validity)
            // if (
            //     $GameStateStore.evaluation 
            // ) {
            //     word_submission_possible = true
            // } else {
            //     word_submission_possible = false
            // }
        }
    }
    
    const play = () => {
        askForWordSubmission($GameStateStore.id, $GameStateStore.player_id)
    }

</script>

<div class="action" >
    <Dico />
    <button on:click={moveAllFreeLettersToRack}>Ramener les lettres</button>
    {#if word_submission_possible}
        <button on:click={play}>Soumettre</button>
    {:else}
        <button on:click={play} disabled>Soumettre</button>
    {/if}
    
</div>


<style>
    .action {
        display: flex;
        justify-content: flex-end;
        gap: 0.25em;
        height: 4em;
    }

    button {
        width: 5em;
        font-size: 1em;
        padding: 0.125em;
    }

    
</style>