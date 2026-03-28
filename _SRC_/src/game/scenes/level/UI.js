import { Container, Text, Point, Graphics, Sprite } from "pixi.js";
import { images } from "../../../app/assets";
import { EventHub, events } from "../../../app/events";
import { styles } from "../../../app/styles";
import FlyText from "./FlyText"

export default class UI extends Container {
    constructor(gameContainer) {
        super()

        this.gameContainer = gameContainer

        this.centerTop = new Container()
        this.addChild(this.centerTop)

        this.levelIcon = new Sprite(images.cup)
        this.levelIcon.scale.set(0.5)
        this.addChild(this.levelIcon)

        this.level = 1
        this.levelText = new Text({text: 'Уровень ' + this.level, style: styles.level})
        this.addChild(this.levelText)

        this.levelProgress = 0.5
        this.levelProgressBar = new Graphics()
        this.levelProgressBar.point = {x: 0, y: 0}
        this.addChild(this.levelProgressBar)

        this.score = 0
        this.scoreText = new Text({text: this.score, style: styles.score})
        this.scoreText.anchor.set(1, 0.1)
        this.centerTop.addChild(this.scoreText)

        this.combo = 1
        this.comboText = new Text({text: ' x' + this.combo, style: styles.combo})
        this.comboText.anchor.set(0, 0)
        this.centerTop.addChild(this.comboText)

        this.pauseButton = new Sprite(images.pause)
        this.pauseButton.anchor.set(1, 0)
        this.pauseButton.scale.set(0.5)
        this.addChild(this.pauseButton)

        this.coinIcon = new Sprite(images.coin)
        this.coinIcon.anchor.set(0, 1)
        this.coinIcon.scale.set(0.5)
        this.addChild(this.coinIcon)

        this.coins = 12
        this.coinsText = new Text({text: 'x' + this.coins, style: styles.coins})
        this.coinsText.anchor.set(0, 1)
        this.addChild(this.coinsText)

        this.saveIcon = new Sprite(images.save)
        this.saveIcon.anchor.set(1, 1)
        this.saveIcon.scale.set(0.5)
        this.addChild(this.saveIcon)

        this.saves = 0
        this.savesText = new Text({text: 'x' + this.saves, style: styles.saves})
        this.savesText.anchor.set(1, 1)
        this.addChild(this.savesText)

        EventHub.on( events.addScore, this.addScore, this )
        EventHub.on( events.resetCombo, this.resetCombo, this )
    }

    screenResize(screenData) {
        this.levelProgressBar.point.x = -screenData.centerX + 70,
        this.levelProgressBar.point.y = -screenData.centerY + 50,
        this.updateProgressBar()

        this.levelIcon.position.set(-screenData.centerX + 10, -screenData.centerY + 10)
        this.levelText.position.set(-screenData.centerX + 70, -screenData.centerY + 5)

        this.centerTop.y = -screenData.centerY + (screenData.isLandscape ? 10 : 80)
        this.updateTopCenter()

        this.pauseButton.position.set(screenData.centerX - 10, -screenData.centerY + 10)

        this.coinIcon.position.set(-screenData.centerX + 10, screenData.centerY - 10)
        this.coinsText.position.set(-screenData.centerX + 80, screenData.centerY - 20)

        this.saveIcon.position.set(screenData.centerX - 10, screenData.centerY - 10)
        this.savesText.position.set(screenData.centerX - 80, screenData.centerY - 15)
    }

    updateProgressBar() {
        let lineWidth = 150 * this.levelProgress
        if (lineWidth > 0) lineWidth = Math.max(8, Math.min(150, lineWidth))

        const point = this.levelProgressBar.point

        this.levelProgressBar.clear()
        this.levelProgressBar.roundRect( point.x, point.y, 152, 10, 5 )
        this.levelProgressBar.fill(0x777777)
        this.levelProgressBar.stroke({width: 2, color: 0x000000})
        if (lineWidth > 0) {
            this.levelProgressBar.roundRect( point.x + 1, point.y + 1, lineWidth, 8, 4 )
            this.levelProgressBar.fill(0x00ff00)
        }
    }

    updateTopCenter() {
        const def = this.scoreText.width - this.comboText.width
        this.centerTop.x = def * 0.5
        //console.log(this.centerTop.width, this.centerTop.x, this.scoreText.width, this.comboText.width)
    }

    // data= {score: 1, x: asteroid.x, y: asteroid.y, parent}
    addScore(data) {
        const addScore = data.score * this.combo
        this.score += addScore
        this.scoreText.text = this.score

        this.combo++
        this.comboText.text = ' x' + this.combo

        const localPoint = this.toLocal(new Point(data.x, data.y), data.parent)
        this.gameContainer.addChild( new FlyText('+' + addScore, localPoint.x, localPoint.y) )

        this.updateTopCenter()
    }
    resetCombo() {
        this.combo = 1
        this.comboText.text = ' x' + this.combo

        this.updateTopCenter()
    }

    kill() {
        EventHub.off( events.addScore, this.addScore, this )
        EventHub.off( events.resetCombo, this.resetCombo, this )
    }
}