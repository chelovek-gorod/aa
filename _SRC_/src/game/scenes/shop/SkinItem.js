import { Container, Sprite, Text } from "pixi.js";
import { tickerAdd, tickerRemove } from "../../../app/application";
import { images, sounds } from "../../../app/assets";
import { soundPlay } from "../../../app/sound";
import { styles } from "../../../app/styles";
import { removeCursorPointer, setCursorPointer } from "../../../utils/functions";
import { playerAvatarsShop } from "../../state";
import { renderPlayer } from "../../UI/renderPlayer";

const SCALE_UP_RATE = 1.06
const SCALE_DURATION = 120
const SCALE_STEP = (SCALE_UP_RATE - 1) / SCALE_DURATION

export default class SkinItem extends Container {
    constructor(skinIndex, callback) {
        super()

        this.price = playerAvatarsShop['player_' + skinIndex]
        this.skinIndex = skinIndex
        this.callback = callback

        this.skin = new Sprite( renderPlayer(skinIndex) )
        this.skin.anchor.set(0.5)
        this.addChild(this.skin)

        this.priceContainer = new Container()
        this.addChild(this.priceContainer)

        if (this.price > 0) {
            this.priceCoin = new Sprite(images.coin)
            this.priceCoin.scale.set(0.35)
            this.priceContainer.addChild(this.priceCoin)
    
            this.priceTex = new Text({text: this.price, style: styles.coins})
            this.priceTex.position.set(50, -5)
            this.priceTex.scale.set(1.2)
            this.priceContainer.addChild(this.priceTex)
    
            this.priceContainer.position.set( -this.priceContainer.width * 0.5 - 5, 40)
        } else {
            this.done = new Sprite(images.done)
            this.done.scale.set(0.35)
            this.priceContainer.addChild(this.done)
            this.priceContainer.position.set( -this.priceContainer.width * 0.5, 0)
        }

        this.isOnHover = false
        
        setCursorPointer(this)
        this.on('pointerdown', this.click, this)
        this.on('pointerover', this.onHover, this)
        this.on('pointerout', this.onOut, this)

        this.scaleMin = 1
        this.scaleMax = SCALE_UP_RATE
    }

    setStartScale(scale) {
        this.scaleMin = scale
        this.scaleMax = scale * SCALE_UP_RATE
        this.scale.set(scale)
    }

    click() {
        setTimeout( () => soundPlay(sounds.se_click), 1 )
        this.callback()
    }

    onHover() {
        if (this.price === 0 || this.isOnHover) return

        this.isOnHover = true
        soundPlay(sounds.se_hover)
        tickerAdd(this)
    }
    onOut() {
        if (this.price === 0 || !this.isOnHover) return

        this.isOnHover = false
        tickerAdd(this)
    }

    tick(deltaMs) {
        if (this.isOnHover) {
            this.scale.set( Math.min(this.scaleMax, this.scale.x + SCALE_STEP * deltaMs) )
            if (this.scale.x === this.scaleMax) tickerRemove(this)
        } else {
            this.scale.set( Math.max(this.scaleMin, this.scale.x - SCALE_STEP * deltaMs) )
            if (this.scale.x === this.scaleMin) tickerRemove(this)
        }
    }

    kill() {
        tickerRemove(this)
        removeCursorPointer(this)
        this.off('pointerdown', this.click, this)
        this.off('pointerover', this.onHover, this)
        this.off('pointerout', this.onOut, this)
        this.isOnHover = false
    }
}