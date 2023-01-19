import { fetchState } from './status.js'
import listFrom from './others.js'

(async function() {
  let sum = 0
  for (let data of listFrom) {
    const { from, note } = data
    const {erc20s, erc721Dars, eth } = await fetchState(from)
    console.log(`Balance for ${from} (${note}):`)
    console.log(`  Ethereum: ${eth / 1e18}`)
    sum += eth / 1e18
  }
})().catch(err => {
  console.log(err)
})
