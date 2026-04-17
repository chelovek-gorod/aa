import { Container, Sprite } from "pixi.js";
import { images } from "../../../app/assets";


export default class TopTable extends Container {
    constructor(data, width, height) {
        super()

        // data.isAuthorized -> true/false
        // data.userRank -> 1 - 100000000000
        // data.aroundEntries -> [] -> {avatarSrc, isCurrentUser, playerName, rank, score}
        // data.topEntries -> [] -> {avatarSrc, isCurrentUser, playerName, rank, score}

        if (data.isAuthorized) {
            if (data.userRank < 11) {
                for(let i = 0; i < data.topEntries.length; i++) {
                    const lineData = data.topEntries[i]
                    this.addLine(lineData, i, width)
                }
            } else {
                for(let i = 0; i < data.topEntries.length; i++) {
                    const lineData = data.topEntries[i]
                    this.addLine(lineData, i, width)
                }
            }
        } else {
            if (data.userRank < 11) {
                for(let i = 0; i < data.topEntries.length; i++) {
                    const lineData = data.topEntries[i]
                    this.addLine(lineData, i, width)
                }
            } else {
                for(let i = 0; i < data.topEntries.length; i++) {
                    const lineData = data.topEntries[i]
                    this.addLine(lineData, i, width, height)
                }
            }
        }

        console.log(data)
    }

    addLine(data, i, width, height) {
        // data = {avatarSrc, isCurrentUser, playerName, rank, score}

        const step = 64
        const y = -height * 0.5 + step * (i + 0.5)
        const x = -width * 0.5
        // icon
        if (data.isCurrentUser || data.rank < 4) {
            if (data.isCurrentUser) {//.medal_1 // .medal_player
                const iconBg = new Sprite(images[data.rank < 4 ? 'medal_' + data.rank : 'medal_player'])
                iconBg.anchor.set(0.5)
                iconBg.scale.set(0.5)
                iconBg.position.set(x, y)
                this.addChild(iconBg)

                const icon = new Sprite(images.medal_used)
                icon.anchor.set(0.5)
                icon.scale.set(0.5)
                icon.position.set(x, y)
                this.addChild(icon)
            } else {
                const icon = new Sprite(images['medal_' + data.rank])
                icon.anchor.set(0.5)
                icon.scale.set(0.5)
                icon.position.set(x, y)
                this.addChild(icon)
            }
        }
        const line = new Sprite(images.medal_line)
        line.anchor.set(0.5)
        line.position.set(0, y + step * 0.5)
        this.addChild(line)
    }
}