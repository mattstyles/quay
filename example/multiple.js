
import Quay from '../lib'

let quay = new Quay()
let key = new Quay()

console.log( 'Try hitting z and x' )

quay.on( 'X', event => {
  console.log( 'quay' )
})

key.on( 'Z', event => {
  console.log( 'key' )
})

quay.on( '*', event => {
  console.log( 'any key' )
})
