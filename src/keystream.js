
import EventEmitter from 'eventemitter3'


/**
 * Basic event emitter with some added extra info for listeners
 */
export default class KeyStream extends EventEmitter {
    constructor() {
        super()

        /**
         * Start of this keypress
         * @type <TimeStamp>
         */
        this.startTime = null

        /**
         * Start of the last keypress, useful for double taps or timers
         * @type <TimeStamp>
         */
        this.lastDown = null

        /**
         * Duration of this keypress
         * @type <Integer> in ms
         */
        this.delta = 0


        this.on( 'keydown', this.onKeydown )
        this.on( 'keyup', this.onKeyup )
    }

    /**
     * Emits an event
     * Santizes the raw key event
     */
    fire = ( event ) => {
        // This is necessary as the first `event.delta` will be from the animation
        // frame and will be since the last 'tick' that was fired, after that every
        // tick will fire and the delta will be correct
        this.delta += this.delta === 0
            ? 1
            : event.delta

        // Emit a data event with the timing info appended
        this.emit( 'data', {
            /**
             * Measures from the last keypress to this keypress
             */
            since: event.raw.timeStamp - this.lastDown,

            /**
             * Measures the duration of this keypress
             */
            delta: this.delta
        })
    }

    /**
     * Fired on initial keydown event
     * @param event <Object> passed from Quay, which should be the raw keyboard event
     */
    onKeydown = ( event ) => {
        this.startTime = event.timeStamp
        this.delta = 0

        if ( !this.lastDown ) {
            this.lastDown = event.timeStamp
        }
    }

    /**
     * Fired on the keyup associated with this keypress
     * @param event <Object> passed from Quay, which should be the raw keyboard event
     */
    onKeyup = ( event ) => {
        this.lastDown = event.timeStamp
    }
}
