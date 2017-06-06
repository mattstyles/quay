
import vkey from 'vkey'
import raf from 'raf-stream'
import Map from 'core-js/es6/map'
import KeyStream from './keystream'


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
    this.keys = new Map()

    this.pressed = new Map()
    this.keydown = null

    this.anyKey = new KeyStream()

    this.el.addEventListener( 'focus', this._attach )
    this.el.addEventListener( 'blur', this._detach )

    this._attach()
  }

  /**
   * @public
   * Allow access to the static class member, no need to privatise it as its
   * handy for consumers to implement key combos
   */
  // get pressed() {
  //   return this.pressed
  // }

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

    // Register any key helper
    this.anyKey.emit( 'keydown', event )
    this.keydown = event

    this.pressed.set( key, event )

    let stream = this.keys.get( key )
    if ( stream ) {
      stream.emit( 'keydown', event )
    }

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

    // Register any key helper
    this.anyKey.emit( 'keyup', event )
    if ( !this.pressed.size ) {
      this.keydown = null
    }


    let stream = this.keys.get( key )
    if ( stream ) {
      stream.emit( 'keyup', event )
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
    this.anyKey.fire({
      raw: this.keydown,
      delta: delta
    })

    this.pressed.forEach( ( val, key ) => {
      let stream = this.keys.get( key )
      if ( !stream ) {
        return
      }

      // Custom emitter, sanitizes keypress
      stream.fire({
        raw: val,
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

    // Special any-keys emitter
    if ( key === '*' ) {
      if ( cb ) {
        this.anyKey.on( 'data', cb )
      }
      return this.anyKey
    }

    let emitter = new KeyStream()

    if ( cb ) {
      emitter.on( 'data', cb )
    }

    this.keys.set( key, emitter )
    return emitter
  }

  /**
   * Removes all streams from the key
   * @public
   * @param key <String> vkey key id
   * @returns <Boolean>
   */
  removeStream( key ) {
    if ( !this.keys.has( key ) ) {
      return false
    }

    // Any-key helper
    if ( key === '*' ) {
      this.anyKey.destroy()
    }

    this.keys.get( key ).destroy()

    delete this.keys.get( key )
    this.keys.delete( key )

    return true
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

  addEventListener( key, cb ) {
    return this.on( key, cb )
  }

  /**
   * @public
   * @param key <String> vkey key id
   * @returns <Boolean>
   * Alias for removeStream
   */
  off( key ) {
    return this.removeStream( key )
  }

  removeEventListener( key ) {
    return this.off( key )
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

module.exports = Quay
