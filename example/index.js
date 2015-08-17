
import Quay from '../build'

let quay = new Quay( window )

console.log( 'Quay attached to window', quay )

let s = quay.stream( 'S' )
s.on( 'data', event => {
    console.log( 's down', event )
})
