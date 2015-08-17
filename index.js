
import EventEmitter from 'eventemitter3'
import vkey from 'vkey'
import raf from 'raf-stream'
import Map from 'core-js/es6/map'


export default class Quay extends EventEmitter {
    constructor( el = window ) {
        super()

        this.el = el
        this.raf = raf( this.el, this.onTick )
        this.raf.pause()
        this.pressed = new Map()
        this.keys = new Map()

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

        // Start emitting events
        this.fire()
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

        if ( this.pressed.size <= 0 ) {
            this.cancel()
        }
    }

    addKeyStream( key ) {
        // If key stream already exist then bail
        if ( this.keys.has( key ) ) {
            // @TODO consider multiple streams to one key, but its probably best
            // this is handled by the caller and not the lib
            return false
        }

        let emitter = new EventEmitter()
        this.keys.set( key, emitter )
        return emitter
    }

    fire() {
        if ( this.firing ) {
            return
        }

        console.log( 'fire tick' )
        this.firing = true

        this.raf.resume()
    }

    cancel() {
        if ( !this.firing ) {
            return
        }

        console.log( 'cancel tick' )
        this.firing = false
        this.raf.pause()
    }

    onTick = ( delta ) => {
        console.log( 'ticking', delta )
    }
}
