<script>
    import {askForNewGame} from "./GameStateInterface"
    import Game from "./Game.svelte"

    import MasterMolangeur from "./MasterMolangeur.svelte"
    import Buttons from "./Buttons.svelte"
    import Info from "./Info.svelte"

    import {onMount, onDestroy} from "svelte"
    let container
    let width = 500;
    $: padding = width / 15 / 2;
    const onResize = () => {
        let box = container.getBoundingClientRect()
        // console.log("box", box)
        width = box.width
    }
    onMount(()=> {
        window.addEventListener("resize", onResize)
        onResize()
    })
    onDestroy(()=>{
        window.removeEventListener("resize", onResize)
    })

    askForNewGame()
</script>

<div class="container"  style={`--padd: ${padding}px;`}>
        <div class="info extra" ><Info /></div>
        <div class="game" bind:this={container}><Game width={width}/></div>
        <div class="extra btns"><Buttons /></div>
        <div class="mstm extra"><MasterMolangeur /></div>

</div>

<style>
    .container {
        /* width: 100%; */
        display: flex;
        flex-direction: column;
    }
    .extra {
        padding: 0 var(--padd);
    }
    .game {
        grid-area: game;
        /* background-color: rgb(0, 143, 168); */
    }
    .info {
        grid-area: info;
        /* background-color: rgb(148, 0, 168); */
    }
    .btns {
        grid-area: btns;
        /* background-color: rgb(168, 151, 0); */
    }
    .mstm {
        grid-area: mstm;
        /* background-color: rgb(34, 168, 0); */
    }

    @media screen and (min-width: 992px) {
        .container {
            display: grid;
            grid-template-columns: calc(100vw - 360px) 300px;
            grid-template-areas: 
            "game info"
            "game mstm"
            "btns mstm"
            ;
        }
        .extra {
            padding: var(--padd) 0 0 0;
        }
        .btns {
            /* outline: 1px solid red; */
            height: 150px;
            padding: 0 var(--padd);
        }
    }

  @media screen and (min-width: 1350px) {
        .container {
            grid-template-columns: calc(100vh * 15/17.5 - 150px) minmax(300px, 400px);
        }
        /* .btns {
            height: 150px;
            padding: 0 var(--padd);
        } */
    }



</style>