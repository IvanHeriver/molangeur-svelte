<script>
    export let id;
    import {setupGame} from "./GameStateInterface"
    import Game from "./Game.svelte"

    import MasterMolangeur from "./MasterMolangeur.svelte"
    import Buttons from "./Buttons.svelte"
    import Info from "./Info.svelte"

    import {onMount, onDestroy} from "svelte"

    let container, game, info, btns, mstm
    $:  width = 500
    let molangeur_height = 500
    // let total_width = 500;
    $: padding = width / 15 / 2;
    $: width_memory = 0
    const onResize = () => {
        let container_box = container.parentElement.getBoundingClientRect()
        let info_box = info.getBoundingClientRect()
        let btns_box = btns.getBoundingClientRect()
        let height_available = (container_box.height - (info_box.height + btns_box.height)) * 15 / 16
        // let height_available = (container_box.height - (info_box.height + btns_box.height)) 
        let width_available = container_box.width
        molangeur_height = 500
        if (document.body.getBoundingClientRect().width > 992) {
            height_available = (container_box.height - btns_box.height) * 15 / 16
            // height_available = (container_box.height - btns_box.height) 
            width_available = container_box.width - 300
            molangeur_height = container_box.height - info_box.height
        }
        width = Math.min(height_available, width_available)
       
        // width = Math.max(350, width)
        width = width - width / 15
        width_memory = width
        width = ((width * window.devicePixelRatio) < 700 ? 700 / window.devicePixelRatio : width)
        // if ((width * window.devicePixelRatio) < 800) width = 800 / window.devicePixelRatio
        console.log("******************************************")
        console.log("container_box", container_box)
        console.log("info_box", info_box)
        console.log("btns_box", btns_box)
        // console.log(window.getComputedStyle(info, null).getPropertyValue('padding-top'))
        // console.log(window.getComputedStyle(info, null).getPropertyValue('padding-bottom'))
        // console.log(window.getComputedStyle(btns, null).getPropertyValue('padding-top'))
        // console.log(window.getComputedStyle(btns, null).getPropertyValue('padding-bottom'))
        console.log("height_available", height_available)
    }
    let timeout = null
    const multiOnResize = () => {
        onResize()
        timeout && clearTimeout(timeout)
        timeout = setTimeout(onResize, 500)
    }
    onMount(()=> {
        window.addEventListener("resize", multiOnResize)
        container.parentElement.scrollTo(0, 0)
        console.log(container)
        console.log(container.parentElement)
        console.log(container.parentElement.parentElement)
        multiOnResize()
    })
    onDestroy(()=>{
        window.removeEventListener("resize", multiOnResize)
    })

    setupGame(id)
</script>

<div style={"position: absolute; top: 0; right: 0; background-color: grey; font-size: 0.8em;"}>
    {`w: ${width.toFixed(1)} |
      width: ${width_memory.toFixed(1)} | 
      width*r: ${(width_memory * window.devicePixelRatio).toFixed(1)} | 
      r: ${(window.devicePixelRatio).toFixed(1)}
     `}
</div>
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
    .game {
        display: flex;
        justify-content: center;
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