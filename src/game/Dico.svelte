<script>
    import {checkWord} from "../logic/molangeur"


    let dictionnary_valid_word = null
    let word_to_check = ""
    const checkWordValidity = () => {
        // if (DICO) {
            let w
            if (word_to_check.length > 1) {
                // source: https://stackoverflow.com/a/37511463
                w = word_to_check.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase()
                // dictionnary_valid_word = checkWordValidity(w)
                dictionnary_valid_word = checkWord(w)
            } else {
                dictionnary_valid_word = null
            }
        // } else {
        //     dictionnary_valid_word = undefined
        // }
    }

    let classes = ""
    $: {
        if (dictionnary_valid_word !== null && !dictionnary_valid_word) {
            classes = "invalid"
        } else if (dictionnary_valid_word) {
            classes = "valid"
        } else {
            classes = ""
        }
        console.log(dictionnary_valid_word)
        console.log(classes)
    }

</script>

<div class="container">
    <div class="input-div">
        <input type="text" class={classes} placeholder="Dictionnaire" bind:value={word_to_check} on:keyup={checkWordValidity} onkeypress="return (event.key.length === 1 && /[A-Za-zéèëêîïûôâàç]/.test(event.key))">
        <button class="reset-input" on:click={()=>{{
            word_to_check=""
            dictionnary_valid_word=null
            }}}>x</button>
    </div>
    
    <!-- {#if dictionnary_valid_word === null }
        {""}
    {:else if dictionnary_valid_word}
        <div class="result valid">
            Mot valide
        </div>
    {:else}
        <div class="result invalid">
            Mot non valide
        </div>
    {/if} -->
    
</div>

<style>
    .container {
        width: 100%;
    }
    .input-div {
        display: flex;
        justify-content: center;
        /* align-items: stretch; */
        height: 50%;
    }
    input {
        width: 100%;
        height: 50%;
        font-size: 1em;
        background-color: white;
    }
    .result {
        text-align: center;
        font-size: 1em;
        padding-top: 0.25em;
    }

    /* .valid {
        color: green;
    }
    .invalid {
        color: rgb(168, 0, 0)
    } */

    .valid {
        background-color: rgba(0, 128, 0, 0.25);
    }
    .invalid {
        background-color: rgba(168, 0, 0, 0.25)
    }

    
    input {
        height: 4ch;
        border-right: none;
    }
    button.reset-input {
        width: 100%;
        height: 4ch;
        border-left: none;
        width: 6ch;
        /* margin: 0; */
        /* flex-grow: 1; */
    }
</style>