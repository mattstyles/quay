
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
        this.raf = raf( this.el, this._onTick )
        this.raf.pause()
        this.pressed = new Map()
        this.keys = new Map()

        this.el.addEventListener( 'focus', this._attach )
        this.el.addEventListener( 'blur', this._detach )

        this._attach()
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
        this._resume()
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
     * @param cb <Function> _optional_
     * @returns <EventEmitter> event stream
     * Adds an event stream listener. Stream emits events when the key is pressed
     */
    stream( key, cb = null ) {
        // If key stream already exist then bail
        if ( this.keys.has( key ) ) {
            // @TODO consider multiple streams to one key, but its probably best
            // this is handled by the caller and not the lib
            return false
        }

        let emitter = new EventEmitter()

        if ( cb ) {
            emitter.on( 'data', cb )
        }

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
        delete this.keys.get( key )
        this.keys.delete( key )
    }

    /**
     * @public
     * @param key <String> vkey key identifier
     * @param cb <Function>
     * @returns <EventEmitter> event stream
     * Alias for `this.stream`
     */
    on( key, cb ) {
        return this.stream( key, cb )
    }

    /**
     * @public
     * @param key <String> vkey key id
     * @returns <Boolean>
     * Alias for removeStream
     */
    off( key ) {
        this.removeStream( key )
    }

    /**
     * @public
     * @param key <String> vkey key identifier
     * @param cb <Function>
     * @returns <EventEmitter> event stream
     * Fires just one event on first keypress
     */
    once( key, cb ) {
        return this.stream( key, event => {
            cb( event )
            this.off( key )
        })
    }

}
