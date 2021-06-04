<script>

    import {GameStateStore} from "./GameStore"
    import {GameGimmickStore} from "./GameStore"
    import {LETTERS} from "../logic/constants"
    import {getIndexFromRowCol, getRowColIndex} from "../logic/utils"

    $: words_list = []
    $: {
        // words_list = $GameStateStore.molangeur.current_words
        words_list = $GameStateStore.molangeur.next_words
        // words_list.sort((a, b) => b.pts - a.pts)
        // console.log(words_list)
        console.log($GameStateStore.molangeur.next_words)
    }
    $: selected = -1

    const getNiceWordCoord = (index) => {
        const row_names = Array(15).fill(0).map((e, i)=>i+1)
        const col_names = Object.keys(LETTERS).filter(e=>e!=="_").filter((e, i)=>i<15)
        const coord = getRowColIndex(index)
        return row_names[coord.row] + col_names[coord.col]
    }
    const getWordIndices = (index, n, vertical=true) => {
        let coord = getRowColIndex(index)
        let add = {row: vertical ? 1: 0, col: vertical ? 0 : 1}
        return Array(n).fill(index).map((e, i)=> {
            return getIndexFromRowCol(
                coord.row + i * add.row,
                coord.col + i * add.col
                )
        })

    }
    const showWord = (i) => {
        const word = words_list[i]
        const letters = word.word.split("")
        const indices = getWordIndices(word.index, letters.length, word.dir === "V")
        console.log(word)
        console.log(letters)
        console.log(indices)
        GameGimmickStore.setTempLetters(letters.map((e, i) => {
            return {index: indices[i], letter: e}
        }))
        selected = i
    }
    const endShow = () => {
        GameGimmickStore.setTempLetters([])
        selected = -1
    }

</script>

<div class="container">
    <!-- {#if words_list.length > 0} -->
        <div class="title">
                {`Maître MoLangeur avait trouvé ${words_list.length} mots et positions valides: `}
        </div>
        <div class="best-words-list">
            {#each words_list as word, i}
                <div class="word"
                on:mouseover={()=>showWord(i)}
                on:mouseout={endShow}
                on:focus={()=>showWord(i)} 
                on:blur={endShow}
                tabindex="0"
                selected={i===selected ? "true" : "false"}>
                    
                    {#if word.dir==="V"}
                        <div class="pos-v"></div>
                    {:else}
                        <div class="pos-h"></div>
                    {/if}
                    <span class="crd">
                        {getNiceWordCoord(word.index)}
                    </span>
                    <span class="wrd">
                        {word.word}
                    </span>
                    <span class="pts">
                        {word.pts + " points"}
                    </span>
                    <!-- <span class="ltr">
                        {"Nombre de lettre(s): " + word.n + " / " + word.word.length}
                    </span> -->
                    <!-- <span class="jkr">
                        {word.joker.length}
                    </span> -->
                </div>
            {/each}
        </div>
    <!-- {/if} -->
</div>

<style>
    .container {
        padding: 5px;
        font-size: 1em;
        padding: calc(var(--S) * 0.35);
    }
    .best-words-list {
        border: 1px solid rgb(231, 231, 231);
        height: 600px;
        overflow: auto;
        flex-grow: 1;
    }

    .word {
        cursor: pointer;
        display: grid;
        grid-template-columns: 2em 2em 1fr auto;
    }
    .wrd {
        font-weight: bold;
        text-align: center;
    }
    .word[selected="true"] {
        background-color: orange;
    }
    .pts {
        padding-right: 0.5em;
    }
    .pos-h {
        background-image: url("../images/arrow_h.svg");
        background-size: 98% 98%;
        background-repeat: no-repeat;
        background-position-x:center;
        background-position-y:center;
        /* height: 1em; */
    }
    .pos-v {
        background-image: url("../images/arrow_v.svg");
        background-size: 98% 98%;
        background-repeat: no-repeat;
        background-position-x:center;
        background-position-y:center;
    }
</style>