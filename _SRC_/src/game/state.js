import { EventHub, events, getNextLevel } from "../app/events"
import { updateStoredData } from "../game/storage"
import { createEnum } from "../utils/functions"

export let timeScale = 1
export const setTimeScale = (ts) => timeScale = ts

export let isAdAvailable = true

export const LEVEL_TYPE = createEnum(['GROUND', 'WATER', 'SNOW', 'MOON'])

export let levelType = LEVEL_TYPE.GROUND
let previousLevelTypes = []

export let playerAvatarsShop = {
    player_0: 0, // set 0 if purchased
    player_1: 2,
    player_2: 0,
    player_3: 0,
    player_4: 15,
    player_5: 20,
    player_6: 30,
    player_7: 40,
    player_8: 50,
    player_9: 60,
    player_10: 80,
    player_11: 100,
    player_12: 120,
}
export let playerAvatarKeys = Object.keys(playerAvatarsShop)
export let playerAvatarIndex = Math.min( 0, playerAvatarKeys.length - 1)
export function nextAvatar() {
    let index = playerAvatarIndex + 1
    if (index === playerAvatarKeys.length) index = 0
    playerAvatarIndex = index
}

export let addCoins = 1
export let playerCoins = 0
export let playerSaves = 0
export let playerLevel = 1
export let playerScore = 0
export let playerTopScore = 0
export let playerTarget = 20 // score for next level
export let playerPrevious = 0 // score before next level
export let playerProgress = 0 // score rate for next level
export function playerAddScore(score) {
    playerScore += score
    if (playerScore >= playerTarget) {
        playerPrevious = playerTarget
        playerLevel++
        playerCoins += addCoins;
        addCoins++
        playerTarget += Math.floor(playerLevel * 1.2) * 20
        getNextLevel()
    }           
    playerProgress = (playerScore - playerPrevious) / (playerTarget - playerPrevious)
    playerTopScore = Math.max(playerScore, playerTopScore)
}
export function playerUseCoins(count) {
    playerCoins -= count
}
export function playerAddCoins(count) {
    playerCoins += count
}
export function playerUseSave() {
    addCoins = 1
    playerSaves--
}
export function playerAddSave(count) {
    playerSaves += count
}

export function resetScoreToPrevious() {
    addCoins = 1
    playerSaves = 0
    playerScore = playerPrevious
    playerProgress = (playerScore - playerPrevious) / (playerTarget - playerPrevious)

    levelType = getLevelType()
}

function getLevelType() {
    if (playerLevel < 3) return LEVEL_TYPE.GROUND

    previousLevelTypes.push(levelType)
    let sameLevels = null
    if (previousLevelTypes.length > 1) {
        let a = previousLevelTypes[previousLevelTypes.length - 1]
        let b = previousLevelTypes[previousLevelTypes.length - 2]
        if (a === b) sameLevels = a
        previousLevelTypes = [a]
    }

    switch(sameLevels) {
        case LEVEL_TYPE.GROUND : return LEVEL_TYPE.WATER
        case LEVEL_TYPE.WATER : return LEVEL_TYPE.SNOW
        case LEVEL_TYPE.SNOW : return LEVEL_TYPE.MOON
        case LEVEL_TYPE.MOON : return LEVEL_TYPE.SNOW
    }

    // (51) от 1 до 100
    if (playerLevel % 2 === 0) return LEVEL_TYPE.GROUND 
    
    // (17) 3, 9, 15, 21, 27, 33, 39, 45, 51, 57, 63, 69, 75, 81, 87, 93, 99
    if (playerLevel % 3 === 0) return LEVEL_TYPE.SNOW

    // (7) 5, 25, 35, 55, 65, 85, 95
    if (playerLevel % 5 === 0) return LEVEL_TYPE.MOON 

    // (25) 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 49, 53, 59, 61, 67, 71, 73, 77, 79, 83, 89, 91, 97
    return LEVEL_TYPE.WATER
}

export function getStateData() {

}

export function setStoredState() {
    
}