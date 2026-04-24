export const assetType = {
    images : 'images',
    atlases: 'atlases',
    sounds : 'sounds',
    music : 'music',
    fonts : 'fonts',
}

export const path = {
    images : './images/',
    atlases: './atlases/',
    sounds : './sounds/',
    music : './music/',
    fonts : './fonts/',
}
export const fonts = {
    P: 'Nunito-Black.ttf',
}

export const images = {
    logo: 'logo.png',
    title: 'title.png',
    bg_main: 'bg_main.png',
}
export const atlases = {
    smoke: 'smoke.json',
    explosion: 'explosion.json',
    gameplay: 'gameplay.json',
    levels: 'levels.json',
    player: 'player.json',
    ui: 'ui.json'
}
export const sounds = {
    se_hover: 'se_hover.mp3',
    se_click: 'se_click.mp3',
    se_fall: 'se_fall.mp3',
    se_level: 'se_level.mp3',
    se_asteroid_explosion: 'se_asteroid.mp3',
    se_obstacle_explosion: 'se_obstacle_explosion.mp3',
    se_player_up: 'se_player_up.mp3',
    se_coins: 'se_coins.mp3',
    se_save: 'se_save.mp3',
    se_new_skin: 'se_new_skin.mp3',
    se_free_spin: 'se_free_spin.mp3',
    se_fireworks: 'se_fireworks.mp3',
}
export const music = {
    bgm_menu_1: 'bgm_menu_1.mp3',
    bgm_menu_2: 'bgm_menu_2.mp3',
    bgm_menu_3: 'bgm_menu_3.mp3',
    bgm_menu_4: 'bgm_menu_4.mp3',
    bgm_1: 'bgm_1.mp3',
    bgm_2: 'bgm_2.mp3',
    bgm_3: 'bgm_3.mp3',
    bgm_4: 'bgm_4.mp3',
    bgm_5: 'bgm_5.mp3',
    bgm_6: 'bgm_6.mp3',
    bgm_7: 'bgm_7.mp3',
}

export const assets = {fonts, images, atlases, sounds, music}
for (let assetType in assets) {
    for (let key in assets[assetType]) {
        assets[assetType][key] = path[assetType] + assets[assetType][key]
    }
}

// check duplicated keys
const allKeys = new Map()
const duplicates = new Set()

for (const [assetTypeName, assetCollection] of Object.entries(assets)) {
    for (const key of Object.keys(assetCollection)) {
        if (allKeys.has(key)) duplicates.add(key)
        allKeys.set(key, assetTypeName)
    }
}

if (duplicates.size > 0) {
    const duplicateDetails = Array.from(duplicates).map(key => {
        const types = []
        for (const [typeName, assetCollection] of Object.entries(assets)) {
            if (Object.prototype.hasOwnProperty.call(assetCollection, key)) {
                types.push(typeName)
            }
        }
        return `"${key}" (${types.join(', ')})`
    }).join(', ')
    
    throw new Error(`Duplicate asset keys detected: ${duplicateDetails}`)
}