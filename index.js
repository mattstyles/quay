
import EventEmitter from 'eventemitter3'
import vkey from 'vkey'
import raf from 'raf-stream'
import Map from 'core-js/es6/map'

/**
 * @class
 * Quay emits stream events on keydown events
 */
export default class Quay {
    /**
     * @constructs
     * @param el <Element> _window_ element to attach to
     */
    constructor( el = window ) {
        this.el = el
        this.raf = raf( this.el, this.onTick )
        this.raf.pause()
        this.pressed = new Map()
        this.keys = new Map()

        this.el.addEventListener( 'focus', this._attach )
        this.el.addEventListener( 'blur', this._detach )
    }

    /**
     * @private
     * Attaches key listeners
     */
    _attach = () => {
        this.el.addEventListener( 'keydown', this._onKeydown )
        this.el.addEventListener( 'keyup', this._onKeyup )
    }

    /**
     * @private
     * Detaches key listeners and clears any currently pressed keys
     */
    _detach = () => {
        this.el.removeEventListener( 'keydown', this._onKeydown )
        this.el.removeEventListener( 'keyup', this._onKeyup )

        this.pressed.clear()
    }

    /**
     * @private
     * Adds keypresses to the active list
     */
    _onKeydown = ( event ) => {
        let key = vkey[ event.keyCode ]

        // Bail on repeated keypresses
        if ( this.pressed.has( key ) ) {
            return
        }

        // @TODO add some specific meta for the keypresses
        this.pressed.set( key, event )

        // Emit events while keys are pressed
        this.raf._resume()
    }

    /**
     * @private
     * Removes keypresses from the list of active keys
     */
    _onKeyup = ( event ) => {
        let key = vkey[ event.keyCode ]

        // In theory, this should never occur
        if ( !this.pressed.has( key ) ) {
            // @TODO error handle here as this should be impossible
            return
        }

        this.pressed.delete( key )

        // With no keypresses stop spamming the tick
        if ( this.pressed.size <= 0 ) {
            this._pause()
        }
    }

    /**
     * @private
     * Start spamming out key press events
     */
    _resume() {
        if ( !this.raf.paused ) {
            return
        }

        this.raf.resume()
    }

    /**
     * @private
     * Stop spamming key events to streams
     */
    _pause() {
        if ( this.raf.paused ) {
            return
        }

        this.raf.pause()
    }

    /**
     * @private
     * Iterates through active keys and emits key events
     */
    _onTick = ( delta ) => {
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


    /*-----------------------------------------------------------*
     *
     *  Public API
     *
     *-----------------------------------------------------------*/

    /**
     * @public
     * @param key <String> vkey key identifier
     * @returns <EventEmitter> event stream
     * Adds an event stream listener. Stream emits events when the key is pressed
     */
    stream( key ) {
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

    /**
     * @public
     * @param key <String> vkey key id
     * @returns <Boolean>
     */
    removeStream( key ) {
        if ( !this.keys.has( key ) ) {
            return false
        }

        // @TODO mem leak? delete EventEmitter?
        this.keys.delete( key )
    }

}
