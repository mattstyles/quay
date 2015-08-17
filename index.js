
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
        console.log( 'attaching Quay' )
        this.el.addEventListener( 'keydown', this.onKeydown )
        this.el.addEventListener( 'keyup', this.onKeyup )
    }

    detach = () => {
        console.log( 'detaching Quay' )
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

        // @TODO add some meaningful meta for the keypresses
        this.pressed.set( key, 'some data' )
        console.log( 'keydown', key )

        // Start emitting events
        this.raf.resume()
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

        // With no keypresses stop spamming the tick
        if ( this.pressed.size <= 0 ) {
            this.raf.pause()
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

    resume() {
        if ( !this.raf.paused ) {
            return
        }

        this.raf.resume()
    }

    pause() {
        if ( this.raf.paused ) {
            return
        }

        this.raf.pause()
    }

    onTick = ( delta ) => {
        this.pressed.forEach( ( val, key ) => {
            let stream = this.keys.get( key )
            if ( !stream ) {
                return
            }
            stream.emit( 'data', {
                delta: delta
            })
        }, this )
    }
}
