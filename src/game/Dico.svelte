<script>
    import {checkWord} from "../logic/molangeur"

    // let DICO = getDictionnary()
    // getDictionnary((d)=> {
    //     console.log(d)
    //     DICO = d
    // })

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
</script>

<div class="container">
    <input type="text" placeholder="Dictionnaire" bind:value={word_to_check} on:keyup={checkWordValidity} onkeypress="return (event.key.length === 1 && /[A-Za-zéèëêîïûôâàç]/.test(event.key))">
    {#if dictionnary_valid_word === null }
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

<style>
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