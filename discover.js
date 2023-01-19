import ethers from 'ethers'
import { promises as fs } from 'fs'

const phrases = ["file-with-12-words"]

;(async function () {
  console.log(`[`)
  for (let phrase of phrases) {
    const data = (await fs.readFile(phrase)).toString().replace('\n', '')
    for (let i = 0; i < 12; i++) {
      try {
        const wallet = ethers.Wallet.fromMnemonic(data, "m/44'/60'/0'/0/" + i)
        console.log(`{ note: "${phrase} ${i}", from: "${wallet.address.toString()}", pass: "${wallet.privateKey.toString()}" },`)
      } catch (e) {
        console.log(`${phrase} is invalid (data is ${data})`)
      }
    }
  }
  console.log(`]`)
})().catch(err => console.log(err))
