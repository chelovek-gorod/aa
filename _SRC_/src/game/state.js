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
    player_1: 5,
    player_2: 10,
    player_3: 15,
    player_4: 20,
    player_5: 30,
    player_6: 40,
    player_7: 50,
    player_8: 60,
    player_9: 80,
    player_10: 100,
    player_11: 120,
    player_12: 150,
}
export let playerAvatarKeys = Object.keys(playerAvatarsShop)
export let playerAvatarIndex = Math.min( 0, playerAvatarKeys.length - 1)
export function setAvatar() {
    let index = playerAvatarIndex
    do {
        if (++index === playerAvatarKeys.length) index = 0
    } while(playerAvatarsShop['player_' + index] !== 0)

    playerAvatarIndex = index
    updateStoredData()
}
export function buyAvatar(index) {
    const shopKey = 'player_' + index
    if (playerCoins < playerAvatarsShop[shopKey]) return false
    
    playerCoins -= playerAvatarsShop[shopKey]
    playerAvatarsShop[shopKey] = 0
    playerAvatarIndex = index
    updateStoredData()
    return true
}
export function countAvailableAvatars() { 
    let count = 0
    for (const key of playerAvatarKeys) {
        if (playerAvatarsShop[key] === 0) count++
    }
    return count
}

export let addCoins = 1 // coins add if reached new level
export let playerCoins = 0
export let playerSaves = 0
export let playerLevel = 1
export let playerScore = 0
export let playerTopScore = 0
export let playerTarget = 20 // score for next level
export let playerPrevious = 0 // score before next level
export let playerProgress = 0 // score rate for next level

export let isSaveCoinsAvailable = true
export let isSaveAdAvailable = true

export function playerAddScore(score) {
    playerScore += score
    if (playerScore >= playerTarget) {
        playerPrevious = playerTarget
        playerLevel++
        playerCoins += addCoins
        addCoins++
        playerTarget += Math.floor(playerLevel * 1.2) * 20
        getNextLevel()
        updateStoredData()
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
    console.log('addCoins =', addCoins )

    if (playerSaves < 0) {
        playerSaves = 0
        playerScore = playerPrevious
        playerProgress = 0
        levelType = getLevelType()
        isSaveCoinsAvailable = true
        isSaveAdAvailable = true
    }

    updateStoredData()
}
export function playerAddSave(price = 0) {
    playerSaves++
    playerCoins -= price
    updateStoredData()
}

export function setSaveCoinsDisable() {
    isSaveCoinsAvailable = false
}
export function setSaveAdDisable() {
    isSaveAdAvailable = false
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
    const gameState =  {
        playerAvatarsShop, playerAvatarIndex,
        playerCoins, playerSaves, playerLevel,
        playerTopScore, playerTarget, playerPrevious,
        isSaveCoinsAvailable, isSaveAdAvailable
    }
    return gameState
}

export function setStoredState(savedState) {
    if (!savedState) return

    if ('playerAvatarsShop' in savedState) playerAvatarsShop = savedState.playerAvatarsShop
    if ('playerAvatarIndex' in savedState) playerAvatarIndex = savedState.playerAvatarIndex
    if ('playerCoins' in savedState) playerCoins = savedState.playerCoins
    if ('playerSaves' in savedState) playerSaves = savedState.playerSaves
    if ('playerLevel' in savedState) playerLevel = savedState.playerLevel
    if ('playerTopScore' in savedState) playerTopScore = savedState.playerTopScore
    if ('playerTarget' in savedState) playerTarget = savedState.playerTarget
    if ('playerPrevious' in savedState) {
        playerPrevious = savedState.playerPrevious
        playerScore = savedState.playerPrevious
    }
    if ('isSaveCoinsAvailable' in savedState) isSaveCoinsAvailable = savedState.isSaveCoinsAvailable
    if ('isSaveAdAvailable' in savedState) isSaveAdAvailable = savedState.isSaveAdAvailable
    
    // После обновления пересчитываем прогресс
    playerProgress = 0
}