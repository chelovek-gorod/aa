import { Container, Sprite, Text } from 'pixi.js'
import { kill } from '../../../app/application'
import { atlases, images, music } from '../../../app/assets'
import { startScene } from '../../../app/events'
import { setMusicList } from '../../../app/sound'
import { SCENE_NAME } from '../SceneManager'
import BackgroundImage from '../../BG/BackgroundImage'
import Button from '../../UI/Button'
import { nextAvatar, playerAddSave, playerAvatarIndex, playerAvatarKeys, playerSaves, resetScoreToPrevious } from '../../state'
import { AVATARS } from '../level/Player'
import { styles } from '../../../app/styles'
//import { TEXT_BUTTON_TYPE } from '../../localText'
//import Title from './Title'

const musics = [ music.bgm_menu_1, music.bgm_menu_2, music.bgm_menu_3, music.bgm_menu_4 ]
let currentMusicIndex = Math.floor( Math.random() * musics.length )
function getMusic() {
    const music = musics[currentMusicIndex]
    currentMusicIndex++
    if (currentMusicIndex === musics.length) currentMusicIndex = 0
    return music
}

export default class Menu extends Container {
    constructor() {
        super()
        this.isMenuActive = true

        resetScoreToPrevious()

        this.bg = new BackgroundImage( images.bg_main, 0x777777 )
        this.addChild(this.bg)

        this.playerContainer = new Container()
        const AVA_KEY = playerAvatarKeys[playerAvatarIndex]
        this.playerBody = new Sprite(images[ AVA_KEY ])
        this.playerBody.anchor.set(0.5)
        this.playerBody.eventMode = 'static'
        this.playerBody.on('pointerdown', this.changeAvatar, this)
        this.playerContainer.addChild(this.playerBody)
        this.playerEye = new Sprite(images[ AVATARS[AVA_KEY].eye ])
        this.playerEye.anchor.set(0.5)
        this.playerEye.position.set(32, -16)
        this.playerContainer.addChild(this.playerEye)
        this.playerTongue = new Sprite(images[ AVATARS[AVA_KEY].tongue ])
        this.playerTongue.pivot.set(47, 7)
        this.playerTongue.position.set(26, 26)
        this.playerContainer.addChild(this.playerTongue)
        this.addChild(this.playerContainer)

        this.save = new Sprite(images.save)
        this.save.scale.set(0.5)
        this.save.anchor.set(0.5)
        this.addChild(this.save)
        this.save.eventMode = 'static'
        this.save.on('pointerdown', this.addSave, this)
        this.saveText = new Text({text: playerSaves, style: styles.saves})
        this.addChild(this.saveText)

        this.logo = new Sprite(images.logo)
        this.logo.scale.set(0.75)
        this.logo.anchor.set(1)
        this.addChild(this.logo)

        
        /*
        this.title = new Title()
        this.titleStartWidth = this.title.width
        this.titleStartHeight = this.title.height
        this.addChild(this.title)
        */

        this.startButton = new Button(
            null, 'START' /* TEXT_BUTTON_TYPE.START*/, () => {
                if (!this.isMenuActive) return

                this.isMenuActive = false
                startScene(SCENE_NAME.Level)
            }, true
        )
        // this.startButton.scale.set(0.75)
        this.addChild(this.startButton)

        setMusicList( getMusic() )
    }

    addSave() {
        playerAddSave(1)
        this.saveText.text = playerSaves
    }

    changeAvatar() {
        nextAvatar()
        const AVA_KEY = playerAvatarKeys[playerAvatarIndex]
        this.playerBody.texture = images[ AVA_KEY ]
        this.playerEye.texture = images[ AVATARS[AVA_KEY].eye ]
        this.playerTongue.texture = images[ AVATARS[AVA_KEY].tongue ]
    }

    screenResize(screenData) {
        // set scene container in center of screen
        this.position.set( screenData.centerX, screenData.centerY )

        this.bg.screenResize(screenData)

        this.logo.position.set(screenData.centerX - 12, screenData.centerY - 12)

        this.playerContainer.position.set(-100, 70)
        this.save.position.set(100, 70)
        this.saveText.position.set(100, 70)

        /*
        const titleScaleX = Math.min(1, screenData.width / (this.titleStartWidth + 120))
        const titleScaleY = Math.min(1, screenData.centerY / (this.titleStartHeight + 60))
        const pointY = screenData.centerY * 0.3
        this.title.scale.set( Math.min(titleScaleX, titleScaleY) )
        this.title.position.set(0, -pointY)
        */

        this.startButton.position.set(0, screenData.centerY * 0.5)
    }

    kill() {
        this.logo.off('touchstart', this.addSave, this)
        this.playerBody.off('pointerdown', this.changeAvatar, this)
    }
}