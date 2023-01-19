import { promises as fs } from 'fs'
import ethers from 'ethers'
import inquirer from 'inquirer'
import { erc721balance, gas, ethbalance, erc20balance, erc721assets } from './urls.js'
import erc20abi from './erc20abi.js'
import erc721abi from './erc721abi.js'
import etherscanKey from './etherscan-key.js'

const provider = new ethers.providers.EtherscanProvider('homestead', etherscanKey)
const DEFAULT_ADDRESS = ''
const DEFAULT_TO = ''

async function restoreStateForAddress(address) {
  try {
    const data = (await fs.readFile('.data/.data-' + address)).toString()
    return JSON.parse(data)
  } catch (e) {
    return null
  }
}
async function fetchState(from) {
  const erc20s = (await (await fetch(erc20balance(from))).json()).result
  const erc721Dars = (await (await fetch(erc721balance(from))).json()).result
  await fs.writeFile('.data/.data-' + from, JSON.stringify({ erc20s, erc721Dars }))
  return {
    erc20s,
    erc721Dars
  }
}

(async function() {
  let defaultFrom = ''
  try {
    defaultFrom = (await fs.readFile('.data/.data-savedFrom')).toString()
  } catch (e) {
    defaultFrom = DEFAULT_ADDRESS
  }
  const from = (await inquirer.prompt([{
    type: 'input',
    name: 'address',
    message: "From address:",
    default: defaultFrom
  }])).address
  await fs.writeFile('.data-savedFrom', from)
  const {erc20s, erc721Dars } = (await restoreStateForAddress(from)) || (await fetchState(from))
  // const erc721Assets = await (await fetch(erc721balance(from))).json()
  const erc20sAnswers = await inquirer.prompt([{
    type: 'checkbox',
    name: 'erc20s',
    message: 'Which of these erc20s should be sent?',
    choices: erc20s
      .filter(_ => _.TokenQuantity / _.TokenDivisor > 0.0001)
      .map(_ => ({
        name: `${(-(-_.TokenQuantity) / -(-_.TokenDivisor))} ${_.TokenSymbol} (${_.TokenName} - ${_.TokenAddress})`,
        short: `${(-(-_.TokenQuantity) / -(-_.TokenDivisor))} ${_.TokenSymbol} (${_.TokenName} - ${_.TokenAddress})`,
        value: _.TokenAddress
      }))
  }])
  const erc721sAnswers = await inquirer.prompt([{
    type: 'checkbox',
    name: 'erc721s',
    message: 'Which of these ERC721 should be sent?',
    choices: erc721Dars
      .map(_ => ({
        name: `${_.TokenQuantity} ${_.TokenSymbol} (${_.TokenName} - ${_.TokenAddress})`,
        short: `${_.TokenQuantity} ${_.TokenSymbol} (${_.TokenName} - ${_.TokenAddress})`,
        value: _.TokenAddress
      }))
  }])
  let key = ''
  try {
    key = (await fs.readFile(`.key-${from}`)).toString()
  } catch (e) {
    key = (await inquirer.prompt([{
      type: 'password',
      name: 'private_key',
      message: `Private key for ${from}`,
    }])).private_key
    await fs.writeFile(`.key-${from}`, key)
  }
  const wallet = new ethers.Wallet(key, provider);
  for (let erc20 of erc20sAnswers.erc20s) {
    const contract = new ethers.Contract(erc20, erc20abi, wallet)
    const holdings = erc20s.filter(_ => _.TokenAddress === erc20)[0]

    const tx = await contract.transfer(DEFAULT_TO, ethers.utils.parseUnits(holdings.TokenQuantity, 'wei'))
    console.log(tx)
  }
  for (let erc721 of erc721sAnswers.erc721s) {
    const contract = new ethers.Contract(erc721, erc721abi, wallet)
    const holdings = (await (await fetch(erc721assets(from, erc721))).json()).result

    for (let token of holdings) {
      const tx = await contract.transferFrom(from, DEFAULT_TO, token.TokenId)
      console.log(tx)
    }
  }

  console.log(erc20sAnswers, erc721sAnswers)
})().catch(err => {
  console.log(err)
})
