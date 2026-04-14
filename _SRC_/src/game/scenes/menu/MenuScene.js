import { Container, Sprite, Text, Texture } from 'pixi.js'
import { kill } from '../../../app/application'
import { atlases, images, music } from '../../../app/assets'
import { setMusicList } from '../../../app/sound'
import BackgroundImage from '../../BG/BackgroundImage'
import FlashButton, { FLASH_TYPE } from '../../UI/FlashButton'
import { nextAvatar, playerAddSave, playerAvatarIndex, playerAvatarKeys, playerCoins, playerSaves, resetScoreToPrevious } from '../../state'
import { AVATARS } from '../level/Player'
import { styles } from '../../../app/styles'
import MenuUI from '../../UI/MenuUI'
import Popup from '../../popup/Popup'
import { startScene } from '../../../app/events'
import { SCENE_NAME } from '../SceneManager'

const musics = [ music.bgm_menu_1, music.bgm_menu_2, music.bgm_menu_3, music.bgm_menu_4 ]
let currentMusicIndex = Math.floor( Math.random() * musics.length )
function getMusic() {
    const music = musics[currentMusicIndex]
    currentMusicIndex++
    if (currentMusicIndex === musics.length) currentMusicIndex = 0
    return music
}

const OFFSET_Y = 120
const OFFSET_X = 10

const ICON_W = 300
const ICON_H = 260

export default class Menu extends Container {
    constructor() {
        super()
        this.isMenuActive = true

        resetScoreToPrevious()

        this.bg = new BackgroundImage( images.bg_main, 0x333333 )
        this.addChild(this.bg)

        this.mainContainer = new Container()
        this.addChild(this.mainContainer)

        this.popup = new Popup()

        this.ui = new MenuUI(this, SCENE_NAME.Level)
        this.addChild(this.ui)

        this.results = new FlashButton(FLASH_TYPE.RESULTS, this.showResults.bind(this), 0.45)
        this.results.position.set(-320, -130)

        this.player = new FlashButton(FLASH_TYPE.SKIN, this.changeAvatar.bind(this), 0.6)
        this.player.position.set(0, -130)

        this.buySave = new FlashButton(FLASH_TYPE.BUY_SAVE, this.addSaveForCoins.bind(this), 0.75)
        this.buySave.position.set(320, -130)

        this.mainContainer.addChild(this.results, this.player, this.buySave)

        this.wheel = new FlashButton(FLASH_TYPE.WHEEL, this.rotateWheel.bind(this), 0.05)
        this.wheel.position.set(-320, 130)

        this.shop = new FlashButton(FLASH_TYPE.SHOP, this.openShop.bind(this), 0.2)
        this.shop.position.set(0, 130)

        this.adSave = new FlashButton(FLASH_TYPE.AD_SAVE, this.addSaveForAd.bind(this), 0.35)
        this.adSave.position.set(320, 130)

        this.mainContainer.addChild(this.wheel, this.shop, this.adSave)

        this.addChild(this.popup)

        setMusicList( getMusic() )
    }

    screenResize(screenData) {
        // set scene container in center of screen
        this.position.set( screenData.centerX, screenData.centerY )

        this.bg.screenResize(screenData)
        this.ui.screenResize(screenData)
        this.popup.screenResize(screenData)

        const maxScale = 0.75

        const width = screenData.width - OFFSET_X * 2
        const height = screenData.height - OFFSET_Y * 2

        const widthRate = screenData.width / screenData.height
        if (widthRate > 2) {
            this.results.position.set(-ICON_W * 2.5, 0)
            this.player.position.set( -ICON_W * 1.5, 0)
            this.shop.position.set(   -ICON_W * 0.5, 0)
            this.wheel.position.set(   ICON_W * 0.5, 0)
            this.adSave.position.set(  ICON_W * 1.5, 0)
            this.buySave.position.set( ICON_W * 2.5, 0)

            const scaleX = Math.min(maxScale, width / (ICON_W * 6))
            const scaleY = Math.min(maxScale, height / ICON_H)
            this.mainContainer.scale.set(Math.min(scaleX, scaleY))
            this.mainContainer.position.set(0, 0)
        } else if (widthRate > 0.6) {
            const y = ICON_H * 0.5
            this.results.position.set(-ICON_W, -y)
            this.player.position.set(       0, -y)
            this.shop.position.set(    ICON_W, -y)
            this.wheel.position.set(  -ICON_W,  y)
            this.adSave.position.set(       0,  y)
            this.buySave.position.set( ICON_W,  y)

            const scaleX = Math.min(maxScale, width / (ICON_W * 3))
            const scaleY = Math.min(maxScale, height / (ICON_H * 2))
            this.mainContainer.scale.set(Math.min(scaleX, scaleY))
            this.mainContainer.position.set(0, -20)
        } else {
            const x = ICON_W * 0.5
            this.results.position.set(-x, -ICON_H)
            this.player.position.set(  x, -ICON_H)
            this.wheel.position.set(  -x, 0)
            this.shop.position.set(    x, 0)
            this.adSave.position.set( -x, ICON_H)
            this.buySave.position.set( x, ICON_H)

            const scaleX = Math.min(maxScale, width / (ICON_W * 2))
            const scaleY = Math.min(maxScale, height / (ICON_H * 3))
            this.mainContainer.scale.set(Math.min(scaleX, scaleY))
            this.mainContainer.position.set(0, 0)
        }
    }

    changeAvatar() {
        nextAvatar()
        const AVA_KEY = playerAvatarKeys[playerAvatarIndex]
        this.playerBody.texture = images[ AVA_KEY ]
        this.playerEye.texture = AVATARS[AVA_KEY].eye !== 'EMPTY'
            ? images[ AVATARS[AVA_KEY].eye ] : Texture.EMPTY
        this.playerTongue.texture = AVATARS[AVA_KEY].tongue !== 'EMPTY'
            ? images[ AVATARS[AVA_KEY].tongue ] : Texture.EMPTY
    }

    showResults() {

    }

    addSaveForCoins() {
        playerAddSave(1)
        this.saveText.text = playerSaves
    }

    addSaveForAd() {

    }

    rotateWheel() {
        startScene( SCENE_NAME.Wheel )
    }

    openShop() {
        startScene( SCENE_NAME.Shop )
    }
}