import { fetchState } from './status.js'
import listFrom from './others.js'

(async function() {
  for (let data of listFrom) {
    const { from, note } = data
    const {erc20s, erc721Dars, eth } = await fetchState(from)
    console.log(`Balance for ${from} (${note}):`)
    console.log(`  Ethereum: ${eth / 1e18}`)
    console.log(`  ERC20s:`)
    for (let _ of erc20s) {
      console.log(`    - ${(-(-_.TokenQuantity)) / (-Math.exp(10, -(-_.TokenDivisor)))} ${_.TokenSymbol} (${_.TokenName} - ${_.TokenAddress})`)
    }
    console.log(`  ERC721s:`)
    for (let _ of erc721Dars) {
      console.log(`    - ${_.TokenQuantity} ${_.TokenSymbol} (${_.TokenName} - ${_.TokenAddress})`)
      for (let token of _.holdings) {
        console.log(`      - ${token.TokenId}`)
      }
    }
  }
})().catch(err => {
  console.log(err)
})
