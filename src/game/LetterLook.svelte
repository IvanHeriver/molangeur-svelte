<script>
    export let letter;
    export let value;
    export let id;
    export let classes;

    export let styles="";
    export let self=null;
    export let on_mousedown=null;
    export let on_click=null;
    
</script>
<!-- on:mousedown={on_mousedown} -->

<div class={"letter "+classes}
bind:this={self}
on:mousedown={on_mousedown}
on:touchstart={on_mousedown}
on:click={on_click}
style={styles}
cui={id}
>
    <span class="value">
        {letter}
    </span>
    <span class="score">
        {value === 0 ? "" : value}
    </span>
</div>

     

<style>
    .letter {
        --F: 1;
        /* border: 0.1rem solid black; */
        /* background-color: rgb(255, 239, 221); */

        background-image: url("../images/tile_xlight.png");
        background-size: 98% 98%;
        background-repeat: no-repeat;
        background-position-x:center;
        background-position-y:center;

        position: absolute;

        display: flex;
        justify-content: center;
        align-items: center;
        font-size: calc(1.9em * var(--F));

        font-family:'Times New Roman', Times, serif;

    }
    .letter * {
        user-select: none;
    }

    .free {
        /* background-color: rgb(255, 214, 167); */
        cursor: grab;

        background-image: url("../images/tile_medium.png");
    }
    .free:hover {
        /* background-color: rgb(255, 185, 106); */
        background-image: url("../images/tile_strong.png");
    }

    .board {
        --F: 1;
        width: var(--S);
        height: var(--S);

        top: calc(var(--S) * var(--y));
        left: calc(var(--S) * var(--x));

        background-position-x:left;
    }

    .rack {
        --F: 2;
        width: calc(var(--S) * 2);
        height: calc(var(--S) * 2);

        top: calc(var(--S) * 15.2);
        left: calc((var(--S) * 2.1) * var(--pos) + var(--S) * 0.2);
    }

    .grab {
        --F: 2;
        width: calc(var(--S) * 2);
        height: calc(var(--S) * 2);

        top: calc(var(--y));
        left: calc(var(--x));

        transform: translate(-50%, -50%);

        cursor: grabbing;
        z-index: 100;

    }

    /* .value {
        font-family:'Times New Roman', Times, serif;
    } */
    .score {
        position: absolute;
        font-size: 0.4em ;
        padding-right: 0.4em;
        padding-bottom: 0.25em;
        bottom: 0;
        right: 0;
    }

    .isjoker > .value {
        color:rgb(110, 59, 0);
    }


    .joker {
        --F: 1.75;
        width: calc(var(--S) * var(--F));
        height: calc(var(--S) * var(--F));

        background-image: url("../images/tile_xlight.png");
        position: relative;

        cursor: pointer;
    }

    .joker:hover {
        /* background-color: rgb(255, 185, 106); */
        background-image: url("../images/tile_medium.png");
    }

    .selected {
        /* background-color: rgb(255, 155, 41); */
        background-image: url("../images/tile_strong.png");
    }
    .selected:hover {
        /* background-color: rgb(255, 147, 23); */
        background-image: url("../images/tile_xstrong.png");
    }


    .temp {
        z-index: 100;
        /* opacity: 0.5; */
        background-image: url("../images/tile_xstrong.png");
    }
</style>