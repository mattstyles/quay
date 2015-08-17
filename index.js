
import EventEmitter from 'eventemitter3'
import Map from 'core-js/es6/map'


export default class Quay extends EventEmitter {
    constructor( el = window ) {
        super()

        this.el = el
        this.pressed = new Map()

        this.el.addEventListener( 'keydown', this.onKeydown )
        this.el.addEventListener( 'keyup', this.onKeyup )
    }

    onKeydown = ( event ) => {
        let key = event.keyCode

        // This should also be impossible and as the keyup should remove it
        if ( this.pressed.has( key ) ) {
            console.log( 'already pressed' )
            console.log( this.pressed.get( key ) )
            return
        }

        this.pressed.set( key, 'some data' )
        console.log( 'added event', key )
    }

    onKeyup = ( event ) => {
        let key = event.keyCode

        console.log( 'keyup', key )

        // In theory, this should never occur
        if ( !this.pressed.has( key ) ) {
            // @TODO error handle here as this should be impossible
            return
        }

        this.pressed.delete( key )
    }

}
