
import EventEmitter from 'eventemitter3'


export default class Quay extends EventEmitter {
    constructor( el = window ) {
        super()

        this.el = el
    }

}
