<script>
    import {GameStateStore} from "./GameStore"
    import {checkWordValidity} from "../logic/dico"
    import {moveAllFreeLettersToRack, askForWordSubmission, askForNewGame} from "./GameStateInterface"

    let dictionnary_valid_word = null
    let word_submission_possible = false

    $: {
        if (
            $GameStateStore.evaluation &&
            $GameStateStore.evaluation.is_position_valid && 
            $GameStateStore.evaluation.is_word_valid
        ) {
            word_submission_possible = true
        } else {
            word_submission_possible = false
        }

    }
    
    let word_to_check
    const checkWord = () => {
        let w
        if (word_to_check.length > 1) {
            // source: https://stackoverflow.com/a/37511463
            w = word_to_check.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase()
            dictionnary_valid_word = checkWordValidity(w)
        } else {
            dictionnary_valid_word = null
        }
        console.log(w)
        console.log(dictionnary_valid_word)
    }


    const play = () => {
        console.log($GameStateStore.letters)
        askForWordSubmission($GameStateStore.id)
    }

</script>

<div class="action" >
    <div class="dico">
        <input type="text" placeholder="Dictionnaire" bind:value={word_to_check} on:keyup={checkWord} onkeypress="return (event.key.length === 1 && /[A-Za-zéèëêîïûôâàç]/.test(event.key))">
        {#if dictionnary_valid_word===null }
            {""}
        {:else if dictionnary_valid_word}
            <div class="result valid">
                Mot valide
            </div>
        {:else}
            <div class="result invalid">
                Mot non valide
            </div>
        {/if}
        
    </div>
    
    <button on:click={askForNewGame}>Nouvelle partie</button>
    <button on:click={moveAllFreeLettersToRack}>Ramener les lettres</button>
    {#if word_submission_possible}
        <button on:click={play}>Jouer</button>
    {:else}
        <button on:click={play} disabled>Jouer</button>
    {/if}
    
</div>


<style>
    .action {
        /* background-color: blue; */
        display: flex;
        justify-content: flex-end;
        gap: 0.25em;
        height: 4em;
    }

    /* button {
        font-size: 1em;
        padding: 0.5em;
    } */
    button {
        width: 5em;
        font-size: 1em;
        padding: 0.125em;
        /* margin: 0; */
    }

    input {
        width: 8em;
        height: 50%;
        font-size: 1em;
    }
    .result {
        text-align: center;
        font-size: 1em;
        padding-top: 0.25em;
    }

    .valid {
        color: green;
    }
    .invalid {
        color: rgb(133, 0, 0)
    }
</style>