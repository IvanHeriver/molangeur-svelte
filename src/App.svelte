<script>

import GamePage from "./game/GamePage.svelte"
import WelcomPage from "./welcom/WelcomPage.svelte"
// import {initDictionnary} from "./logic/dico"
import {initDatabase} from "./logic/DB"
import {resetMolangeur} from "./logic/molangeur"

// let page = "game"
let page = "welcom"
let game_id = null

let app_ready_steps = {dico: true, db: false}
$: app_ready = Object.keys(app_ready_steps).map(e=>app_ready_steps[e]).reduce((a, b)=>a && b)
// let 
// initDictionnary(()=>{
//     // app_ready = true
//     app_ready_steps.dico = true
// })
initDatabase(()=>{
    app_ready_steps.db = true
    // close()
})

</script>

{#if !app_ready}
     <div class="loading">
        <div>
            <p>Molangeur se prépare. </p>
            <p>Veuillez patienter quelques instants...</p>
        </div>
     </div>
{:else}
<div class="container">
    <div class="header-navigation">
        <div class="navigation-toggle">
            
        </div>
        <img src="../images/molangeur_logo.png" alt="" on:click={()=>{
            resetMolangeur(()=>{})
            page = "welcom"
        }}>
    </div>
    <div class="content">
        {#if page === "welcom"}
            <WelcomPage
            launchGame={(id)=>{
                page="game"
                game_id=id
            }}
            /> 
        {:else if  page === "game"}
            <GamePage id={game_id}/>
            <!-- <GamePage id={null}/> -->
        {/if}
    </div>
    
</div>
{/if}


<style>
	
    .container {
        display: flex;
        flex-direction: column;
        /* align-items: stretch; */
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
    .header-navigation {
        background-color: var(--strong-col);
        height: 30px;
        width: 100%;
        display: flex;
    }
    .header-navigation > img {
        width: 150px;
        height: 30px;
    }
    .navigation-toggle {
        height: 0px;
        width: 0px;
    }
    .content {
        /* padding: 1rem; */
        width: 100%;
        height: calc(100% - 40px);
        overflow-y: auto;
    }

    img {
        cursor: pointer;
        z-index: 11;
    }
    @media screen and (min-width: 992px) {
        .container {
            flex-direction: row;
        }
        .header-navigation {
            width: 50px;
            flex-direction: column;
            height: 100%;
        }
        .header-navigation > img {
            width: 250px;
            height: 50px;
            transform-origin: top left;
            transform: rotate(-90deg) translateX(-100%);
        }
        .content {
            height: 100%;
        }
    }
    @media screen and (min-width: 1350px) {
        .content {
            display: flex;
            justify-content: center;
        }
    }
    

    .loading {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;

        background-color: black;

        display: flex;
        justify-content: center;
        align-items: center;

        z-index: 1000;
    }
    .loading > div {
        color: white;
        font-size: 2rem;
        padding: 2rem;
        padding-bottom: 4rem;
        text-align: center;
    }
</style>