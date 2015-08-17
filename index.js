
import EventEmitter from 'eventemitter3'
import vkey from 'vkey'
import Map from 'core-js/es6/map'


export default class Quay extends EventEmitter {
    constructor( el = window ) {
        super()

        this.el = el
        this.pressed = new Map()

        this.el.addEventListener( 'focus', this.attach )
        this.el.addEventListener( 'blur', this.detach )
    }

    attach = () => {
        console.log( 'attaching' )
        this.el.addEventListener( 'keydown', this.onKeydown )
        this.el.addEventListener( 'keyup', this.onKeyup )
    }

    detach = () => {
        console.log( 'detaching' )
        this.el.removeEventListener( 'keydown', this.onKeydown )
        this.el.removeEventListener( 'keyup', this.onKeyup )

        this.pressed.clear()
    }

    onKeydown = ( event ) => {
        let key = vkey[ event.keyCode ]

        // Bail on repeated keypresses
        if ( this.pressed.has( key ) ) {
            return
        }

        this.pressed.set( key, 'some data' )
        console.log( 'added event', key )
    }

    onKeyup = ( event ) => {
        let key = vkey[ event.keyCode ]

        console.log( 'keyup', key )

        // In theory, this should never occur
        if ( !this.pressed.has( key ) ) {
            // @TODO error handle here as this should be impossible
            return
        }

        this.pressed.delete( key )
    }

}
