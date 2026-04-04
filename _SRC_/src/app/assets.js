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
    H1: 'RubikDistressed-Regular.ttf',
    H2: 'RubikStorm-Regular.ttf',

    P: 'Nunito-Black.ttf',
}

export const images = {
    logo: 'logo.png',

    bg_main: 'bg_main.png',

    button: 'button.png',
    button_hover: 'button_hover.png',

    bg_ground_top: 'bg_ground_top.png',
    bg_ground_bottom: 'bg_ground_bottom.png',
    bg_water_top: 'bg_water_top.png',
    bg_water_bottom: 'bg_water_bottom.png',
    bg_snow_top: 'bg_snow_top.png',
    bg_snow_bottom: 'bg_snow_bottom.png',

    progress: 'progress.png',
    coin: 'coin.png',
    cup: 'cup.png',
    save: 'save.png',
    x2: 'x2.png',
    pause: 'pause.png',

    help: 'help.png',

    player_1: 'player_1.png',
    player_2: 'player_2.png',
    player_3: 'player_3.png',
    player_4: 'player_4.png',
    player_5: 'player_5.png',
    player_6: 'player_6.png',
    player_7: 'player_7.png',
    player_8: 'player_8.png',
    player_9: 'player_9.png',
    player_eye_b: 'player_eye_b.png',
    player_eye_c: 'player_eye_c.png',
    player_tongue_r: 'player_tongue_r.png',
    player_tongue_p: 'player_tongue_p.png',

    cloud_1: 'cloud_1.png',
    cloud_2: 'cloud_2.png',
    cloud_3: 'cloud_3.png',
    cloud_4: 'cloud_4.png',

    asteroid_1: 'asteroid_1.png',
    asteroid_2: 'asteroid_2.png',
    asteroid_3: 'asteroid_3.png',

    plane: 'plane.png',
    aerostat: 'aerostat.png',
    copter: 'copter.png',
    airship: 'airship.png',
    ship: 'ship.png',
    sign: 'sign.png',
    bus: 'bus.png',
    building_1: 'building_1.png',
    building_2: 'building_2.png',
    building_3: 'building_3.png',
    drone: 'drone.png',
    base: 'base.png',
    track: 'track.png',
    wagon: 'wagon.png',

    plane_black: 'plane_black.png',
    aerostat_black: 'aerostat_black.png',
    copter_black: 'copter_black.png',
    airship_black: 'airship_black.png',
    ship_black: 'ship_black.png',
    sign_black: 'sign_black.png',
    bus_black: 'bus_black.png',
    building_1_black: 'building_1_black.png',
    building_2_black: 'building_2_black.png',
    building_3_black: 'building_3_black.png',
    drone_black: 'drone_black.png',
    base_black: 'base_black.png',
    track_black: 'track_black.png',
    wagon_black: 'wagon_black.png',

    spark: 'spark.png',
    snowflake: 'snowflake.png',

    asteroid_stone_1: 'asteroid_stone_1.png',
    asteroid_stone_2: 'asteroid_stone_2.png',
    asteroid_stone_3: 'asteroid_stone_3.png',
    asteroid_stone_4: 'asteroid_stone_4.png',
    asteroid_stone_5: 'asteroid_stone_5.png',
    asteroid_stone_6: 'asteroid_stone_6.png',
    asteroid_stone_7: 'asteroid_stone_7.png',
    asteroid_stone_8: 'asteroid_stone_8.png',
    asteroid_stone_9: 'asteroid_stone_9.png',

    popup_bg: 'popup.png',
}
export const atlases = {
    smoke: 'smoke.json',
    explosion: 'explosion.json',
}
export const sounds = {
    se_hover: 'se_hover.mp3',
    se_click: 'se_click.mp3',
    se_fall: 'se_fall.mp3',
    se_asteroid_explosion: 'se_asteroid.mp3',
    se_obstacle_explosion: 'se_obstacle_explosion.mp3',
    se_player_up: 'se_player_up.mp3',
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