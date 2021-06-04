<script>
    import {LETTERS} from "../logic/constants"
    import LetterLook from "./LetterLook.svelte"

    export let cancel
    export let validate

    const letters = Object.keys(LETTERS).filter(e=>e!=="_")

    let self

    let styles = ""
    let classes = "joker"

    $: selected = Array(letters.length).fill(false)

    const selectLetter = (i) => {
        selected = Array(letters.length).fill(false)
        selected[i] = true
    }
</script>

<div class="overlay">

</div>
<div class="container">
    <div class="description">
        Selectionne la lettre que tu souhaites attribuer à ton joker:
    </div>
    <div class="letters">
        {#each letters as letter, i}
            <LetterLook
            letter={letter}
            value={""}
            id={i}
            classes={selected[i] ? "joker selected" : "joker"}
            on_click={()=>selectLetter(i)}
        />
        {/each}
    </div>
    <div class="actions">
        <button on:click={cancel}>
            Annuler
        </button>
        <button on:click={()=>validate(letters[selected.indexOf(true)])} disabled={selected.indexOf(true)===-1}>
            Valider
        </button>
    </div>

</div>

<style>
    .overlay {
        background-color: rgba(0, 0, 0, 0.25);
        box-shadow: 0 0 100em 100em rgba(0, 0, 0, 0.25);
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10;
    }

    .container {
        position: absolute;
        top: 50%;
        /* bottom: 35%; */
        left: 50%;
        width: 95%;
        /* right: 5%; */
        transform: translate(-50%, -50%);
        z-index: 11;
        background-color: rgb(255, 243, 232);

        border-radius: 0.5em;
        padding: 1em;
/* 
        display: flex;
        flex-direction: column; */

    }

    .description {
        font-size: 1.5em;
        text-align: center;
    }


    .letters {
        /* outline: 1px solid red; */

        padding-top: 1em;
        padding-bottom: 1em;
        display: flex;
        justify-content:center;
        flex-wrap: wrap;
        gap: 0.5em;
    }
    .actions {
        display: flex;
        justify-content: space-evenly;
        gap: 0.5em;

    }
    button {
        height: 4em;
        width: 100%;
    }

</style>