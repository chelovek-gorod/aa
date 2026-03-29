import { Container, Text, Point, Graphics, Sprite } from "pixi.js";
import { getSafeAreaOffsets } from "../../../app/application";
import { images } from "../../../app/assets";
import { EventHub, events } from "../../../app/events";
import { styles } from "../../../app/styles";
import { playerAddScore, playerCoins, playerLevel, playerProgress, playerSaves, playerScore, playerTarget } from "../../state";
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

        this.levelText = new Text({text: 'Уровень ' + playerLevel, style: styles.level})
        this.addChild(this.levelText)

        this.levelProgressBar = new Graphics()
        this.levelProgressBar.point = {x: 0, y: 0}
        this.addChild(this.levelProgressBar)

        this.targetText = new Text({text: playerTarget, style: styles.target})
        this.addChild(this.targetText)

        this.scoreText = new Text({text: playerScore, style: styles.score})
        this.scoreText.anchor.set(1, 0.1)
        this.centerTop.addChild(this.scoreText)

        this.combo = playerLevel
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

        this.coinsText = new Text({text: 'x' + playerCoins, style: styles.coins})
        this.coinsText.anchor.set(0, 1)
        this.addChild(this.coinsText)

        this.saveIcon = new Sprite(images.save)
        this.saveIcon.anchor.set(1, 1)
        this.saveIcon.scale.set(0.5)
        this.addChild(this.saveIcon)

        this.savesText = new Text({text: 'x' + playerSaves, style: styles.saves})
        this.savesText.anchor.set(1, 1)
        this.addChild(this.savesText)

        EventHub.on( events.addScore, this.addScore, this )
        EventHub.on( events.resetCombo, this.resetCombo, this )
        EventHub.on( events.removePlyerSave, this.removeSave, this )
        EventHub.on( events.getNextLevel, this.updateLevel, this )
    }

    screenResize(screenData) {
        const safeArea = getSafeAreaOffsets()

        this.levelProgressBar.point.x = -screenData.centerX + 70,
        this.levelProgressBar.point.y = -screenData.centerY + 50 + safeArea.top,
        this.updateProgressBar()

        this.levelIcon.position.set(-screenData.centerX + 10, -screenData.centerY + 10 + safeArea.top)
        this.levelText.position.set(-screenData.centerX + 70, -screenData.centerY + 5 + safeArea.top)
        this.targetText.position.set(-screenData.centerX + 180, -screenData.centerY + 42 + safeArea.top)

        this.centerTop.y = -screenData.centerY + (screenData.isLandscape ? 10 : 80) + safeArea.top
        this.updateTopCenter()

        this.pauseButton.position.set(screenData.centerX - 10, -screenData.centerY + 10 + safeArea.top)

        this.coinIcon.position.set(-screenData.centerX + 10, screenData.centerY - 10 - safeArea.bottom)
        this.coinsText.position.set(-screenData.centerX + 80, screenData.centerY - 20 - safeArea.bottom)

        this.saveIcon.position.set(screenData.centerX - 10, screenData.centerY - 10 - safeArea.bottom)
        this.savesText.position.set(screenData.centerX - 80, screenData.centerY - 15 - safeArea.bottom)
    }

    updateProgressBar() {
        let lineWidth = 100 * playerProgress
        if (lineWidth > 0) lineWidth = Math.max(8, Math.min(100, lineWidth))

        const point = this.levelProgressBar.point

        this.levelProgressBar.clear()
        this.levelProgressBar.roundRect( point.x, point.y, 102, 10, 5 )
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
        if (playerSaves < 0) return

        const addScore = data.score * this.combo
        playerAddScore(addScore)
        this.scoreText.text = playerScore

        this.combo++
        this.comboText.text = ' x' + this.combo

        const localPoint = this.toLocal(new Point(data.x, data.y), data.parent)
        this.gameContainer.addChild( new FlyText('+' + addScore, localPoint.x, localPoint.y) )

        this.updateTopCenter()
        this.updateProgressBar()
    }
    resetCombo() {
        this.combo = playerLevel
        this.comboText.text = ' x' + this.combo

        this.updateTopCenter()
    }
    removeSave() {
        this.savesText.text = 'x' + Math.max(0, playerSaves)
    }
    updateLevel() {
        if (this.combo < playerLevel) this.combo = playerLevel
        this.levelText.text = 'Уровень ' + playerLevel
        this.targetText.text = playerTarget
        this.coinsText.text = 'x' + playerCoins
        this.gameContainer.addChild( new FlyText(null, 0, 0) )
    }

    kill() {
        EventHub.off( events.addScore, this.addScore, this )
        EventHub.off( events.resetCombo, this.resetCombo, this )
        EventHub.off( events.removePlyerSave, this.removeSave, this )
    }
}