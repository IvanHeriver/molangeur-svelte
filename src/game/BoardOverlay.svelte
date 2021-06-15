<script>
    import {LETTERS} from "../logic/constants" // FIXME: should be LTRS?
    import {GameStateStore, GameGimmickStore} from "./GameStore"
    import Joker from "./Joker.svelte"
    // import {askBoardEvaluation} from "./GameStateInterface"
    import {checkBoard} from "../logic/molangeur"
    import LetterLook from "./LetterLook.svelte"
    export let game;
    
    
    const score_info_default = {
        valid: false,
        score: 0,
        score_location: {x:-1, y:-1},
        vertical: false,
    }
    $: score_info = {...score_info_default}
    $: temp_letters =  []
    $: hover_location =  []
    $: game_over = false
    $: joker_picker = false
    $: evaluation = null
    $: {
        if ($GameStateStore) {
            // dealing with score
            evaluation = checkBoard($GameStateStore.letters)
            GameStateStore.setEvaluation(evaluation)
            if (evaluation && evaluation.validity) {
                score_info = {
                    valid: evaluation.validity, 
                    score: evaluation.score,
                    score_location: game.getBoardXY(evaluation.all_words[0].slice(-1)[0].index), 
                    vertical: !evaluation.is_horizontal
                }
            } else {
                score_info = {...score_info_default}
            }
            // dealing with joker picker
            joker_picker = $GameStateStore.jocker_picker
            // dealing with game over
            game_over = $GameStateStore.game_over
        }
    }
    $: {
        if ($GameGimmickStore) {
            // dealing with temporary letters
            temp_letters = $GameGimmickStore.temp_letters
            // dealing with hover highlight
            hover_location = $GameGimmickStore.hover_location
        }
    }

    // dealing with joker picker
    // $: joker_picker = $GameStateStore.jocker_picker
    const cancelJoker = () => {
        let letter = $GameStateStore.jocker_picker_letter
        GameStateStore.moveLetter(letter.id, letter.board, letter.index)
        GameStateStore.setJokerPicker({}, false)
        // askBoardEvaluation()
    }
    const validateJoker = (ltr) => {
        let letter = $GameStateStore.jocker_picker_letter
        GameStateStore.setJoker(letter.id, ltr)
        GameStateStore.setJokerPicker({}, false)
        // askBoardEvaluation()
    }

    // dealing with row and column names
    const row_names = Array(15).fill(0).map((e, i)=>i+1)
    const col_names = Object.keys(LETTERS).filter(e=>e!=="_").filter((e, i)=>i<15)

</script>

<div class="overlay" >
    {#if score_info.valid}
        <div class={score_info.vertical ? "score vertical" : "score"} style={`--x:${score_info.score_location.x}; --y:${score_info.score_location.y}`}>
            <span>
                {score_info.score}
            </span>
        </div>
    {/if}
    {#if game_over}
        <div class="gameover">
            Partie terminée!
        </div>
    {/if}
</div>

{#if hover_location && hover_location.board && hover_location.index !== undefined}
     <div class="highlight-row" style={`--x:${game.getBoardXY(hover_location.index).x}; --y:${game.getBoardXY(hover_location.index).y};`}>
     </div>
     <div class="highlight-col" style={`--x:${game.getBoardXY(hover_location.index).x}; --y:${game.getBoardXY(hover_location.index).y};`}>
     </div>
{/if}
{#if joker_picker}
    <Joker cancel={cancelJoker} validate={validateJoker}/>
{/if}

{#each temp_letters as ltr, i}
     <LetterLook 
        letter={ltr.letter}
        value={""}
        id={i}
        classes={"board temp"}
        styles={`--x:${game.getBoardXY(ltr.index).x}; --y:${game.getBoardXY(ltr.index).y};`}
     />
{/each}

{#each row_names as rn, i}
     <div class="row-col-name" style={`--x:${-1.125}; --y:${i+0.25};text-align: right;`}>
         {rn}
     </div>
{/each}
{#each col_names as cn, i}
     <div class="row-col-name" style={`--x:${i}; --y:${-0.5};text-align: center;`}>
         {cn}
     </div>
{/each}

<style>
    .overlay {
        /* background-color: rgba(0, 0, 255, 0.01); */
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10;
        pointer-events: none;
    }
    .row-col-name {
        font-weight: bold;
        position: absolute;
        width: var(--S);
        height: var(--S);
        top: calc(var(--S) * var(--y));
        left: calc(var(--S) * var(--x));
    }
    .score {
        background-color: rgb(27, 231, 0);
        border: 1px solid black;
        position: absolute;

        width: 2em;
        height: 2em;
        border-radius: 1em;
        display: flex;
        justify-content:center;
        align-items:center;
        /* padding: 0.1em; */
        /* font-size: 2em; */

        top: calc(var(--S) * var(--y) + var(--S)/2);
        left: calc(var(--S) * var(--x) + var(--S));
        transform: translate(-40%, -50%);
    }

    .vertical {
        top: calc(var(--S) * var(--y) + var(--S));
        left: calc(var(--S) * var(--x) + var(--S)/2);
        transform: translate(-50%, -40%);
    }

    .gameover {
        position: absolute;
        top: 15%;
        /* bottom: 0; */
        left: 0;
        right: 0;
        text-align: center;
        /* transform: translateY(-50%); */
        font-size: calc(var(--S) * 3.15);
        font-weight: bold;
        z-index: 10000;
        opacity: 0.75;
        user-select: none;
        pointer-events: none;
    }

    .highlight-row {
        background-color: rgba(255, 0, 0, 0.25);
        position: absolute;

        left: calc(var(--S) * -0.55);
        top: calc(var(--S) * var(--y) + var(--S) * 0.5);
        height: calc(var(--S) * 0.75);
        width: calc(var(--S) * 0.5 + var(--S) * (var(--x) + 1));;

        transform: translateY(-50%);
        border-radius: var(--S);
    }
    .highlight-col {
        background-color: rgba(255, 0, 0, 0.25);
        position: absolute;

        top: calc(var(--S) * -0.55);
        left: calc(var(--S) * var(--x) + var(--S) * 0.5);
        width: calc(var(--S) * 0.75);
        height: calc(var(--S) * 0.5 + var(--S) * (var(--y) + 1));;

        transform: translateX(-50%);
        border-radius: var(--S);
    }

</style>