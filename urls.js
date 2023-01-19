import key from './etherscan-key.js'

const base = 'https://api.etherscan.io/api?'
export const ethbalance = address => `${base}module=account&action=balance&address=${address}&tag=latest&apikey=${key}`

export const erc20balance = address => `${base}module=account&action=addresstokenbalance&address=${address}&page=1&apikey=${key}`
export const erc721balance = address => `${base}module=account&action=addresstokennftbalance&address=${address}&page=1&apikey=${key}`

export const erc721assets = (address, dar) => `${base}module=account&action=addresstokennftinventory&address=${address}&contractaddress=${dar}&page=1&apikey=${key}`

export const gas = () => `${base}?module=gastracker&action=gasoracle&apikey=${key}` 
