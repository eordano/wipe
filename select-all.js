import { fetchState } from './status.js'
import listFrom from './others.js'

(async function() {
  const all = []
  for (let data of listFrom) {
    const { from, note } = data
    all.push({ ...(await fetchState(from)), address: from })
  }
  console.log(all.sort((a, b) => a.eth - b.eth).map(_ => _.address + ' ' + _.eth / 1e18))
})().catch(err => {
  console.log(err)
})
