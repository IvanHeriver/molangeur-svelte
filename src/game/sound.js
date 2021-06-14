import * as Tone from "tone"

const drop_board = new Tone.Player("../images/drop_board.wav").toDestination()
const drop_rack = new Tone.Player("../images/drop_rack.wav").toDestination()
drop_board.volume.value = -10
drop_rack.volume.value = -20
Tone.setContext(new Tone.Context({ latencyHint : "playback" }))

const init = () => {
    Tone.loaded()
    document.removeEventListener("mouseover", init)
    document.removeEventListener("scroll", init)
    document.removeEventListener("keydown", init)
}
document.addEventListener("mouseover", init)
document.addEventListener("scroll", init)
document.addEventListener("keydown", init)

export const soundDropBoard = () => {
    // drop_board.start("0")
    drop_board.start("-0.1")
}

export const soundDropRack = () => {
    drop_rack.start("-0.1")
}
