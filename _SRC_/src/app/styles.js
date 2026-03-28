import { TextStyle, FillGradient } from "pixi.js"
import { fonts } from "./assets"

const levelGradient = new FillGradient({
    type: 'linear',
    colorStops: [
      { offset: 0,    color: '#ffffff' },
      { offset: 1,    color: '#ff9900' },
    ],
})
const scoreGradient = new FillGradient({
    type: 'linear',
    colorStops: [
      { offset: 0,    color: '#ffff00' },
      { offset: 1,    color: '#ff9900' },
    ],
})
const comboGradient = new FillGradient({
    type: 'linear',
    colorStops: [
      { offset: 0,    color: '#00ffff' },
      { offset: 1,    color: '#ff00ff' },
    ],
})
const coinsGradient = new FillGradient({
    type: 'linear',
    colorStops: [
      { offset: 0,    color: '#ffff00' },
      { offset: 1,    color: '#ff7700' },
    ],
})
const savesGradient = new FillGradient({
    type: 'linear',
    colorStops: [
      { offset: 0,    color: '#ffffff' },
      { offset: 1,    color: '#ff0000' },
    ],
})

export let styles = {
    isReady: false, /* if true -> fonts is already loaded */

    /* Font keys (init all fonts in function bellow) */
    loading: null,
    level: null,
    score: null,
    combo: null,
    coins: null,
    saves: null,
    flyText: null,
    button: null,
    buttonHover: null,
    shineCounter: null,
    taskCount: null,
    cardCount: null,
    popupTitle: null,
    popupDescription: null,
    popupTurnsText: null,
    settingsReset: null,
}

export function initFontStyles() {
    styles.loading = new TextStyle({
        fontFamily: fonts.P,
        fontSize: 48,
        fill: '#ffffff',
    
        dropShadow: true,
        dropShadowColor: '#4000ff',
        dropShadowBlur: 6,
        dropShadowAngle: 0,
        dropShadowDistance: 0,
    })

    styles.level = new TextStyle({
        fontFamily: fonts.P,
        fontSize: 32,
        fill: levelGradient,
        align: 'left',
    
        stroke: {
            color: 0x000000,
            width: 4
        },
    })
    styles.score = new TextStyle({
        fontFamily: fonts.P,
        fontSize: 56,
        fill: scoreGradient,
        align: 'right',
    
        stroke: {
            color: 0x000000,
            width: 5
        },
    })
    styles.combo = new TextStyle({
        fontFamily: fonts.P,
        fontSize: 32,
        fill: comboGradient,
        align: 'left',
    
        stroke: {
            color: 0x000000,
            width: 4
        },
    })
    styles.coins = new TextStyle({
        fontFamily: fonts.P,
        fontSize: 32,
        fill: coinsGradient,
        align: 'left',
    
        stroke: {
            color: 0x000000,
            width: 4
        },
    })
    styles.saves = new TextStyle({
        fontFamily: fonts.P,
        fontSize: 36,
        fill: savesGradient,
        align: 'right',
    
        stroke: {
            color: 0x000000,
            width: 4
        },
    })

    styles.flyText = new TextStyle({
        fontFamily: fonts.P,
        fontSize: 64,
        fill: scoreGradient,
        align: 'left',

        stroke: {
            color: 0x000000,
            width: 6
        },

        dropShadow: true,
        dropShadowColor: '#ff0000',
        dropShadowBlur: 6,
        dropShadowAngle: Math.PI * 0.5,
        dropShadowDistance: 6,
    })

    styles.button = new TextStyle({
        fontFamily: fonts.P,
        fontSize: 36,
        fill: '#ffffff',
    })
    styles.buttonHover = new TextStyle({
        fontFamily: fonts.P,
        fontSize: 36,
        fill: '#ffffff',
    
        dropShadow: true,
        dropShadowColor: '#770077',
        dropShadowBlur: 6,
        dropShadowAngle: 0,
        dropShadowDistance: 0,
    })

    styles.popupDescription = new TextStyle({
        fontFamily: fonts.P,
        fontSize: 32,
        fill: 0xcc00cc,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 700,
        lineHeight: 32,
    })

    styles.popupTurnsText = new TextStyle({
        fontFamily: fonts.P,
        fontSize: 40,
        fill: 0xee0000,
    })

    styles.settingsReset = new TextStyle({
        fontFamily: fonts.P,
        fontSize: 24,
        fill: 0xee0000,
        align: 'right',
        wordWrap: true,
        wordWrapWidth: 640,
        lineHeight: 24,
    })

    styles.isReady = true

    // EXAMPLES
    /*
    gradientText: new TextStyle({
        fontFamily: fonts.RobotoBlack,
        fontSize: 32,
        fill: '#000000',

        align: 'center',
        
        wordWrap: true,
        wordWrapWidth: 440,
        //breakWords: true,
        lineJoin: 'round',

        stroke: {
            color: 0x000000,
            width: 2
        }

        dropShadow: true,
        dropShadowColor: '#ffffff',
        dropShadowBlur: 6,
        dropShadowAngle: 0,
        dropShadowDistance: 0,

        wordWrap: true,
        wordWrapWidth: 400,
    }),
    */
}