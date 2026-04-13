import { Container, Text, Point, Sprite } from "pixi.js";
import { getSafeAreaOffsets, kill, tickerAdd, tickerRemove } from "../../app/application";
import { images } from "../../app/assets";
import { EventHub, events, startScene } from "../../app/events";
import { styles } from "../../app/styles";
import { playerCoins, playerLevel, playerSaves, playerTopScore } from "../state";
import TapIcon from "./TapIcon"
import { formatNumber } from "../scenes/level/UI"
import { POPUP_TYPE } from "../popup/Popup";
import Button from "./Button";
import { SCENE_NAME } from "../scenes/SceneManager";

export default class MenuUI extends Container {
    constructor(menu, targetScene) {
        super()

        this.menu = menu

        this.levelIcon = new Sprite(images.cup)
        this.levelIcon.scale.set(0.5)
        this.addChild(this.levelIcon)

        this.levelText = new Text({text: 'x' + playerLevel, style: styles.level})
        this.addChild(this.levelText)

        this.topScoreText = new Text({text: formatNumber(playerTopScore, true), style: styles.target})
        this.addChild(this.topScoreText)

        this.settingsButton = new TapIcon( images.settings, this.openSettings.bind(this), true )
        this.settingsButton.anchor.set(1, 0)
        this.settingsButton.scale.set(0.5)
        this.addChild(this.settingsButton)

        this.coinAnimations = 0
        this.coinIcon = new Sprite(images.coin)
        this.coinIcon.anchor.set(1, 0)
        this.coinIcon.scale.set(0.5)
        this.addChild(this.coinIcon)

        this.coinsText = new Text({text: 'x' + playerCoins, style: styles.coins})
        this.addChild(this.coinsText)

        this.saveAnimations = 0
        this.saveIcon = new Sprite(images.save)
        this.saveIcon.scale.set(0.5)
        this.addChild(this.saveIcon)

        this.savesText = new Text({text: 'x' + playerSaves, style: styles.saves})
        this.savesText.anchor.set(1, 0)
        this.addChild(this.savesText)

        this.startButton = new Button(
            null, 'START' /* TEXT_BUTTON_TYPE.START*/, () => {
                if (!this.menu.isMenuActive) return

                this.menu.isMenuActive = false
                startScene(targetScene)
            }, true
        )
        this.startButton.scale.set(0.75)
        this.addChild(this.startButton)
    }

    screenResize(screenData) {
        const safeArea = getSafeAreaOffsets()

        this.levelIcon.position.set(-screenData.centerX + 10, -screenData.centerY + 10 + safeArea.top)
        this.levelText.position.set(-screenData.centerX + 70, -screenData.centerY + 5 + safeArea.top)
        this.topScoreText.position.set(-screenData.centerX + 70, -screenData.centerY + 42 + safeArea.top)

        this.settingsButton.position.set(screenData.centerX - 10, -screenData.centerY + 10 + safeArea.top)

        if (screenData.isLandscape) {
            const offset = Math.ceil(screenData.width / 8)
            this.coinIcon.position.set(-offset, -screenData.centerY + 10 + safeArea.top)
            this.coinsText.position.set(-offset, -screenData.centerY + 20 + safeArea.top)
        
            this.saveIcon.position.set(offset, -screenData.centerY + 10 + safeArea.top)
            this.savesText.position.set(offset, -screenData.centerY + 15 + safeArea.top)
        } else {
            this.coinIcon.position.set(-screenData.centerX + 75, -screenData.centerY + 90 + safeArea.top)
            this.coinsText.position.set(-screenData.centerX + 75, -screenData.centerY + 100 + safeArea.top)
        
            this.saveIcon.position.set(screenData.centerX - 75, -screenData.centerY + 90 + safeArea.top)
            this.savesText.position.set(screenData.centerX - 75, -screenData.centerY + 95 + safeArea.top)
        }

        this.startButton.position.set(0, screenData.centerY - 75 - safeArea.bottom)
    }

    openSettings() {
        this.menu.popup.show(POPUP_TYPE.SETTINGS)
    }

    removeSave() {
        this.savesText.text = 'x' + Math.max(0, playerSaves)
        this.saveAnimations++
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
    }
}