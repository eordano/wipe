import { promises as fs } from 'fs'
import { erc721balance, erc20balance, erc721assets, ethbalance } from './urls.js'

function rateLimit() {
  return new Promise((resolve) => {
    setTimeout(resolve, 1000)
  })
}
async function restoreStateForAddress(address) {
  try {
    const data = (await fs.readFile('.data/.data-' + address)).toString()
    return JSON.parse(data)
  } catch (e) {
    return null
  }
}

export async function fetchState(from) {
  const prev = await restoreStateForAddress(from)
  if (prev) {
    return prev
  }
  const eth = (await (await fetch(ethbalance(from))).json()).result
  await rateLimit()
  const erc721Dars = (await (await fetch(erc721balance(from))).json()).result
  await rateLimit()
  const erc20s = (await (await fetch(erc20balance(from))).json()).result
  await rateLimit()
  for (let erc721 of erc721Dars) {
    erc721.holdings = (await (await fetch(erc721assets(from, erc721.TokenAddress))).json()).result
    await rateLimit()
  }
  await fs.writeFile('.data/.data-' + from, JSON.stringify({ erc20s, erc721Dars, eth }))
  return {
    eth,
    erc20s,
    erc721Dars
  }
}
