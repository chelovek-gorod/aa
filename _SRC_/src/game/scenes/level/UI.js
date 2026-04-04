import { Container, Text, Point, Graphics, Sprite } from "pixi.js";
import { getSafeAreaOffsets, kill, tickerAdd, tickerRemove } from "../../../app/application";
import { images } from "../../../app/assets";
import { EventHub, events, pauseGameplay } from "../../../app/events";
import { styles } from "../../../app/styles";
import { isPlayerScoreX2Active, playerAddScore, playerCoins, playerLevel, playerProgress, playerSaves, playerScore, playerTarget } from "../../state";
import FlyText from "./FlyText"
import TapIcon from "../../UI/TapIcon"

const PROGRESS_WIDTH = 110

function formatNumber(n, isRoundUp = false) {
    if (n < 1_000_000) return n.toLocaleString('ru-RU')

    const millions = n / 1_000_000
    const factor = 1000
    const rounded = isRoundUp
        ? Math.ceil(millions * factor) / factor
        : Math.floor(millions * factor) / factor
    return rounded.toFixed(3) + ' M'
}

export default class UI extends Container {
    constructor(gameContainer) {
        super()

        this.gameContainer = gameContainer

        this.flyTextNextLevelY = 0

        this.centerTop = new Container()
        this.addChild(this.centerTop)

        this.levelIcon = new Sprite(images.cup)
        this.levelIcon.scale.set(0.5)
        this.addChild(this.levelIcon)

        this.levelText = new Text({text: 'x' + playerLevel, style: styles.level})
        this.addChild(this.levelText)

        this.levelProgressBar = new Graphics()
        this.levelProgressBar.point = {x: 0, y: 0}
        this.addChild(this.levelProgressBar)

        const targetScore = playerTarget - playerScore
        this.targetText = new Text({text: formatNumber(targetScore, true), style: styles.target})
        this.addChild(this.targetText)

        this.scoreText = new Text({text: formatNumber(playerScore), style: styles.score})
        this.scoreText.anchor.set(1, 0.1)
        this.centerTop.addChild(this.scoreText)

        this.combo = playerLevel
        this.comboText = new Text({text: ' x' + this.combo, style: styles.combo})
        this.comboText.anchor.set(0, 0)
        this.centerTop.addChild(this.comboText)

        this.pauseButton = new TapIcon( images.pause, pauseGameplay, true )
        this.pauseButton.anchor.set(1, 0)
        this.pauseButton.scale.set(0.5)
        this.addChild(this.pauseButton)

        this.coinAnimations = 0
        this.coinIcon = new Sprite(images.coin)
        this.coinIcon.anchor.set(0, 1)
        this.coinIcon.scale.set(0.5)
        this.addChild(this.coinIcon)

        this.coinsText = new Text({text: 'x' + playerCoins, style: styles.coins})
        this.coinsText.anchor.set(0, 1)
        this.addChild(this.coinsText)

        if (isPlayerScoreX2Active) {
            this.x2Icon = new Sprite(images.x2)
            this.x2Icon.anchor.set(0.5, 1)
            this.x2Icon.scale.set(0.5)
            this.addChild(this.x2Icon)
        }

        this.saveAnimations = 0
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

        this.flyTextNextLevelY = screenData.centerY - 50 - safeArea.bottom

        this.levelProgressBar.point.x = -screenData.centerX + 70,
        this.levelProgressBar.point.y = -screenData.centerY + 50 + safeArea.top,
        this.updateProgressBar()

        this.levelIcon.position.set(-screenData.centerX + 10, -screenData.centerY + 10 + safeArea.top)
        this.levelText.position.set(-screenData.centerX + 70, -screenData.centerY + 5 + safeArea.top)
        this.targetText.position.set(-screenData.centerX + 80 + PROGRESS_WIDTH, -screenData.centerY + 42 + safeArea.top)

        this.centerTop.y = -screenData.centerY + (screenData.isLandscape ? 10 : 80) + safeArea.top
        this.updateTopCenter()

        this.pauseButton.position.set(screenData.centerX - 10, -screenData.centerY + 10 + safeArea.top)

        this.coinIcon.position.set(-screenData.centerX + 10, screenData.centerY - 10 - safeArea.bottom)
        this.coinsText.position.set(-screenData.centerX + 80, screenData.centerY - 20 - safeArea.bottom)

        if (this.x2Icon) this.x2Icon.position.set(0, screenData.centerY - 10 - safeArea.bottom)

        this.saveIcon.position.set(screenData.centerX - 10, screenData.centerY - 10 - safeArea.bottom)
        this.savesText.position.set(screenData.centerX - 80, screenData.centerY - 15 - safeArea.bottom)
    }

    updateProgressBar() {
        let lineWidth = PROGRESS_WIDTH * playerProgress
        if (lineWidth > 0) lineWidth = Math.max(8, Math.min(PROGRESS_WIDTH, lineWidth))

        const point = this.levelProgressBar.point

        this.levelProgressBar.clear()
        this.levelProgressBar.roundRect( point.x, point.y, PROGRESS_WIDTH + 2, 10, 5 )
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
        this.scoreText.text = formatNumber(playerScore)

        this.targetText.text = formatNumber(playerTarget - playerScore, true)

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
        this.saveAnimations++
        tickerAdd(this)
    }
    updateLevel() {
        if (this.combo < playerLevel) this.combo = playerLevel
        this.levelText.text = 'x' + playerLevel
        this.targetText.text = formatNumber(playerTarget - playerScore, true)
        this.coinsText.text = 'x' + playerCoins
        this.gameContainer.addChild( new FlyText(null, 0, this.flyTextNextLevelY) )
        this.coinAnimations += 2
        tickerAdd(this)
    }

    tick(deltaMs) {
        if (this.saveAnimations > 0) {
            this.saveIcon.scale.set( this.saveIcon.scale.x + 0.0012 * deltaMs )
            this.saveIcon.alpha = Math.max(0, this.saveIcon.alpha - 0.0012 * deltaMs)

            if (this.x2Icon) {
                this.x2Icon.scale.set( this.saveIcon.scale.x )
                this.x2Icon.alpha = this.saveIcon.alpha
            }

            if (this.saveIcon.alpha === 0) {
                this.saveAnimations--
                this.saveIcon.scale.set(0.5)
                this.saveIcon.alpha = 1
                if (this.saveAnimations === 0 && this.coinAnimations === 0) tickerRemove(this)

                if (this.x2Icon) {
                    kill(this.x2Icon)
                    this.x2Icon = null
                }
            }
        }

        if (this.coinAnimations > 0) {
            if (this.coinAnimations % 2 === 0) {
                this.coinIcon.scale.set( Math.min(0.6, this.coinIcon.scale.x + 0.0006 * deltaMs) )
                if (this.coinIcon.scale.x === 0.6) this.coinAnimations--
            } else {
                this.coinIcon.scale.set( Math.max(0.5, this.coinIcon.scale.x - 0.0006 * deltaMs) )
                if (this.coinIcon.scale.x === 0.5) {
                    this.coinAnimations--
                    if (this.saveAnimations === 0 && this.coinAnimations === 0) tickerRemove(this)
                }
            }
        }
    }

    kill() {
        tickerRemove(this)
        EventHub.off( events.addScore, this.addScore, this )
        EventHub.off( events.resetCombo, this.resetCombo, this )
        EventHub.off( events.removePlyerSave, this.removeSave, this )
        EventHub.off( events.getNextLevel, this.updateLevel, this )
    }
}