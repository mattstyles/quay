
import Quay from '../lib'

let quay = new Quay( window )

console.log( 'Quay attached to window', quay )

let s = quay.stream( 'S' )
s.on( 'data', event => {
    console.log( 's down', event )
})

quay.on( 'W', event => {
    console.log( 'w', event )
    console.log( 'Should fire only once' )
    quay.off( 'W' )
})

quay.once( 'Q', event => {
    console.log( 'q', event )
    console.log( 'just once' )
})

window.quay = quay
