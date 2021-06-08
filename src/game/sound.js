import * as Tone from "tone"

const drop_board = new Tone.Player("../images/drop_board.wav").toDestination()
const drop_rack = new Tone.Player("../images/drop_rack.wav").toDestination()
drop_board.volume.value = -15
drop_rack.volume.value = -25
Tone.loaded()

export const soundDropBoard = () => {
    drop_board.start()
}

export const soundDropRack = () => {
    drop_rack.start()
}
