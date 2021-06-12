<script>
    
    import {afterUpdate} from "svelte"
    // import html2canvas from "html2canvas"
    import domtoimage from "dom-to-image"
    import {newGameImagePreviewUpdate} from "./GameStateInterface"

    import {GameStateStore} from "./GameStore"

    import Letter from "./Letter.svelte"
    
    import BoardOverlay from "./BoardOverlay.svelte"

    // import {onMount} from "svelte"
    export let width;
    let game, container, rack_element

    afterUpdate(()=>{
        if ($GameStateStore && $GameStateStore.image_preview_needed) {
            GameStateStore.setNeedForNewImagePreview(false)
            // let img = document.querySelector("#html-2-canvas")
            // html2canvas(container, {
            //     backgroundColor: null,
            //     // logging: true,
            //     scale: 0.5,
            //     scrollY: -window.scrollY,
            //     // onclone: (e)=>{
            //     //     console.log(e)
            //     //     console.log(e.querySelector(".rack").hidden=true)
            //     //     return e
            //     // }
            // }).then(function(canvas) {
            //     let image_data = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
            //     newGameImagePreviewUpdate($GameStateStore.id, image_data)
            //     console.log("done")
            // });
            console.time("dom-to-image")
            domtoimage.toPng(container, {
                filter: (node) => {
                    // if (node.className) {
                    //     let a = node.className+""
                    //     if (a.startsWith("rack")) {
                    //         return false
                    //     } 
                    // }
                    return true
                }
            }).then((dataUrl)=>{
            // domtoimage.toSvg(container).then((dataUrl)=>{
                // var link = document.createElement('a');
                // link.download = 'my-image-name.jpeg';
                // link.href = dataUrl;
                // link.click();
                // let image_data = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
                // console.log(dataUrl)
                console.timeEnd("dom-to-image")
                newGameImagePreviewUpdate($GameStateStore.id, dataUrl)
                // console.log("done")
            })
        }
        
    })
    const BOARD_DIM = 15
    const RACK_DIM = 7


    let board = Array(BOARD_DIM*BOARD_DIM).fill(0);
    let rack  = Array(RACK_DIM).fill(0);

    const getBoardXY = (index) => {
        const x = Math.floor(index / BOARD_DIM)
        const y = index - x * BOARD_DIM
        return {x, y}
    }
    const getRackPos = (index) => index
    const getXY = (e) => {
        const curr_pos = {x: e.clientX, y: e.clientY}
        const game_pos = game.getBoundingClientRect()
        return {
            x: curr_pos.x - game_pos.x,
            y: curr_pos.y - game_pos.y
        }
    }
    const isWithinRect = (refRect, pos) => {
        return !(pos.x < refRect.x || pos.x > (refRect.x+refRect.width) 
        || pos.y < refRect.y || pos.y > (refRect.y+refRect.height))
    }
    const isWithinGame = (pos) => {
        return isWithinRect(game.getBoundingClientRect(), pos)
    }
    const getLocation = (e) => {
        const translateClientRect = (Rect, Ref) => {
            Rect.x = Rect.x - Ref.x
            Rect.y = Rect.y - Ref.y
            return Rect
        }
        const game_pos = game.getBoundingClientRect()
        const position = getXY(e)
        const getCID = (arr) => {
            const e = arr.filter(e=>{
                const current_obj = translateClientRect(e.getBoundingClientRect(), game_pos)
                return isWithinRect(current_obj, position)
            })[0]
            if (e) return parseInt(e.getAttribute("cid"))
            return undefined
        }
        const b = getCID(board)
        const r = getCID(rack)
        
        return {board: b!==undefined, index: b!==undefined?b:r}
    }

    const locationFunctions = {
            getLocation,
            getBoardXY,
            getRackPos,
            getXY,
            isWithinRect,
            isWithinGame,
        }
        
    // askForNewGame();
</script>
<div class="container" bind:this={container} style={`--REF-SIZE: ${width*15/16}px;--S: ${width/16}px;`}>
    <div class="game" bind:this={game}>
        <div class="board">
            <BoardOverlay game={locationFunctions}/>
            {#each board as e, i}
                <div class="board-cell" bind:this={e} style={`--x:${getBoardXY(i).x};--y:${getBoardXY(i).y};`} cid={i}>
                    <span style='font-size: 0.7em'>{i}</span>
                </div>
            {/each}
        </div>
        <div class="rack" id="rack" bind:this={rack_element}>
            {#each rack as e, i}
            <div class="rack-cell"  bind:this={e} style={`--pos:${getRackPos(i)};`} cid={i}>
                <div class="rack-decoration">

                </div>
            </div>
            {/each}
        </div>
        {#if $GameStateStore}
            <div class="board-letters-free">
                {#each $GameStateStore.letters.filter(e=>e.board && e.free) as ltr}
                    <Letter game={locationFunctions} letter={ltr}/>
                {/each}
            </div>
            <div class="board-letters-fixed">
                {#each $GameStateStore.letters.filter(e=>e.board && !e.free) as ltr}
                    <Letter game={locationFunctions} letter={ltr}/>
                {/each}
            </div>
            <div class="rack-letters">
                {#each $GameStateStore.letters.filter(e=>!e.board) as ltr}
                    <Letter game={locationFunctions} letter={ltr}/>
                {/each}
            </div>
        {/if}     
    </div>
</div>
<style>

    .container {
        /* outline: 1px solid orange; */
        width: calc(var(--REF-SIZE) + var(--S)) ;
        padding: calc(var(--S) / 2);
        padding-bottom: 0;
    }
    .game {
        /* outline: 1px solid black; */
        position: relative;

        --TOTAL: 17.5;
        --RACK: calc((var(--TOTAL) - 15) / var(--TOTAL));
        --BOARD: calc(15 / var(--TOTAL));

        font-size: calc(var(--REF-SIZE)*0.02);
        width: var(--REF-SIZE);
        height: calc(var(--REF-SIZE)* var(--TOTAL) / 15);
    }
    .board {
        /* outline: 2px solid pink; */
        
        /* background-image: url("../images/board_default_2.svg"); */
        background-image: url("../images/board.png");
        background-size: 100% 100%;

        height: calc(100% * var(--BOARD));
        width: var(--REF-SIZE);
    }
    .rack {
        /* outline: 2px solid rgb(0, 132, 255); */

        height: calc(100% * var(--RACK));
        width: calc(100%);
    }


    .board-cell {
        overflow: hidden;
        /* outline: 1px solid black; */

        position: absolute;
        width: var(--S);
        height: var(--S);

        top: calc(var(--S) * var(--y));
        left: calc(var(--S) * var(--x));
        
        /* background-image: url("../images/cell.png");
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position-x:right;
        background-position-y:top; */

        user-select: none;
        
        display: flex;
        justify-content:center;
        align-items:center;
    }

    .rack-cell {
        overflow: hidden;
        /* outline: 1px solid black; */
        /* padding: 1rem; */
        
        /* --O: calc(var(--S) / 4); */
        position: absolute;
        width: calc(var(--S) * 2);
        height: calc(var(--S) * 2);

        top: calc(var(--S) * 15.2);
        left: calc((var(--S) * 2.1) * var(--pos) + var(--S) * 0.2);

        user-select: none;

        
    }

    .rack-decoration {
        background-color: rgb(236, 236, 236);
        border-radius: 50%;
        width: 50%;
        height: 50%;
        transform: translate(50%, 50%);
        /* margin:  */
    }
    
    
    
</style>