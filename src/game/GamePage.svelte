<script>
    export let id;
    import {setupGame} from "./GameStateInterface"
    import Game from "./Game.svelte"

    import MasterMolangeur from "./MasterMolangeur.svelte"
    import Buttons from "./Buttons.svelte"
    import Info from "./Info.svelte"

    import {onMount, onDestroy} from "svelte"
    let container, game, info, btns, mstm
    let width = 500
    let molangeur_height = 500
    // let total_width = 500;
    $: padding = width / 15 / 2;
    const onResize = () => {
        let container_box = container.parentElement.getBoundingClientRect()
        let info_box = info.getBoundingClientRect()
        let btns_box = btns.getBoundingClientRect()
        let height_available = (container_box.height - (info_box.height + btns_box.height)) * 15 / 17.5
        let width_available = container_box.width
        molangeur_height = 500
        if (document.body.getBoundingClientRect().width > 992) {
            height_available = (container_box.height - btns_box.height) * 15 / 17.5
            width_available = container_box.width - 300
            molangeur_height = container_box.height - info_box.height
        }
        width = Math.min(height_available, width_available)
        width = Math.max(350, width)
        width = width - width / 15      
    }
    const multiOnResize = () => {
        onResize()
        setTimeout(onResize, 100)
        setTimeout(onResize, 250)
    }
    onMount(()=> {
        window.addEventListener("resize", multiOnResize)
        multiOnResize()
    })
    onDestroy(()=>{
        window.removeEventListener("resize", multiOnResize)
    })

    setupGame(id)
</script>

<div class="container" style={`--padd: ${padding}px;`} bind:this={container}>
    <!-- <div class="allways-visible">

    </div>
    <div class="molangeur"> -->
        
    <!-- </div> -->
        <div class="info" bind:this={info}><Info /></div>
        <div class="game-btns">
            <div class="game" bind:this={game}><Game width={width} updateSize={multiOnResize} /></div>
            <!-- <div class="btns" bind:this={btns} style={`width: ${width}px;`}><Buttons /></div> -->
            <div class="btns" bind:this={btns}><Buttons /></div>
        </div>

        <div class="mstm" bind:this={mstm} style={`--h_molangeur: ${molangeur_height}px`}><MasterMolangeur /></div>

</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        
    }
    .info, .mstm {
        display: flex;
        justify-content: center;
        padding: calc(var(--padd) / 4) var(--padd);
        width: 100%;
    }
    .info {
        grid-area: info;
    }
    .mstm {
        grid-area: mstm;
        padding: var(--padd);
        height: 500px;
        /* width: 100%; */
    }
    .game-btns{
        grid-area: game-btns;
    }
    .btns {
        padding: 0 calc(var(--padd));
    }

    @media screen and (min-width: 992px) {
        .container {
            display: grid;
            grid-template-columns: auto auto;
            grid-template-areas: 
            "game-btns info"
            "game-btns mstm"
            "game-btns mstm"
            ;
            max-width: 1350px;
            align-items: start;
        }
        .info, .mstm {
            padding-top: var(--padd);
            padding-left: 0;
            padding-bottom: var(--padd);
            padding-right: calc(var(--padd) / 4);
            /* min-width: 300px; */
        }
        .info {
            padding-bottom: 0;
        }
        .mstm {
            height: calc(var(--h_molangeur) - var(--padd));
        }
    }

</style>