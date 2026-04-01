import { Sprite, Text } from "pixi.js";
import { kill, tickerAdd } from "../../../app/application";
import { images } from "../../../app/assets";
import { styles } from "../../../app/styles";
import { isPlayerScoreX2Active } from "../../state";

class FlyX2 extends Sprite {
    constructor(x, y) {
        super(images.x2) 
        this.anchor.set(0.5)

        this.position.set(x,y)

        this.lifeTime = 450
        this.alphaStep = 0.0009
        this.flySpeed = 0.18

        tickerAdd(this)
    }

    tick(deltaMs) {
        this.y -= this.flySpeed * deltaMs

        if (this.lifeTime > 0) {
            this.lifeTime -= deltaMs
        } else {
            this.alpha -= this.alphaStep * deltaMs
            if (this.alpha <= 0) kill(this)
        }
    }
}

export default class FlyText extends Text {
    constructor(text, x, y) {
        super({text: text ? text : 'Новый уровень!', style: text ? styles.flyText : styles.flyTextLevel}) 
        this.anchor.set(0.5)

        this.position.set(x,y)

        this.lifeTime = text ? 300 : 450
        this.alphaStep = text ? 0.0012 : 0.0009
        this.flySpeed = text ? 0.24 : 0.18

        this.x2point = (isPlayerScoreX2Active && text) ? {x, y} : null

        tickerAdd(this)
    }

    tick(deltaMs) {
        this.y -= this.flySpeed * deltaMs

        if (this.lifeTime > 0) {
            this.lifeTime -= deltaMs
            if (this.lifeTime <= 0 && this.x2point) {
                this.parent.addChild( new FlyX2(this.x2point.x, this.x2point.y) )
            }
        } else {
            this.alpha -= this.alphaStep * deltaMs
            if (this.alpha <= 0) kill(this)
        }
    }
}