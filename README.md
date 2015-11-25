# Quay

> Turns keypresses into event streams

Client side module for turning key presses into event streams synced with the animation frame. Uses [vkey](https://github.com/chrisdickinson/vkey/blob/master/index.js) definitions.

## Installation

```
npm i -S quay
```

## Usage

```js
import Quay from 'quay'

let quay = new Quay()

quay.on( '<up>', event => {
  console.log( 'up', event )
})
```

### Appending listeners to streams

A stream can be created which will return an emitter, from there you can apply or remove callbacks to the emitter

```js
function onUp( event ) {
  console.log( 'up', event )
}

quay.stream( '<up>' )
  .on( 'data', onUp )
```

`.stream` also accepts a callback that manually binds to the `data` event. The stream also emits other events, see the api docs.

### Removing an individual listener

`.removeStream` or `.off` removes the stream from `quay`, meaning that it destroys the emitter and any listeners associated with that listener. To remove a single listener grab the emitter and use `.off` or `.removeListener`.

```js
quay.keys.get( '<up>' )
  .off( 'data', onUp )
```


## API

### `.stream`

```js
<Stream> quay.stream( key <String>, cb <Function> _optional_ )
```

Creates an event stream that will fire whenever a key is in the `keydown` state. The keycode is human-friendly thanks to [vkey](https://github.com/chrisdickinson/vkey/blob/master/index.js) and expects `vkey` definitions to be used i.e. `<shift>`, `<up>`, `A`.

`.stream` will bail if the key is already assigned, multiple actions for a single key should be handled in the `data` event.

The optional `callback` parameter is simply sugar for manually assigning the `data` event to the stream

```js
quay.stream( 'A' )
  .on( 'data', event => {
    console.log( 'pressing a' )
  })
```

The `data` event will fire as fast as `requestAnimationFrame` will allow. Depending on your use case this may be too fast or too slow, whilst dealing with the too fast case is fairly simple there is currently little you can do if its not firing fast enough for you. Its on the roadmap, but PR’s are always welcome.

The stream will also emit the raw `keydown` and `keyup` events

```js
quay.stream( '<shift>' )
  .on( 'keydown', event => {
    store.set( 'shift', true )
  })
  .on( 'keyup', event => {
    store.set( 'shift', false )
  })
```

This example shows manually setting key values in a separate key-value store, but `quay` actually implements this as a map and can be accessed via `pressed`,

```js
quay.stream( 'S', event => {
  if ( quay.pressed.has( 'shift' ) ) {
    console.log( 'Shift + s' )
  }
})
```


### `.removeStream`

```js
<bool> quay.removeStream( key <String> )
```

Removes the stream associated with a key


### `.on`

```js
let emitter = quay.on( key, cb )
```

Alias for `.stream`


### `.off`

```js
quay.off( key )
```

Alias for `.removeStream`


### `.once`

```js
quay.once( key <String>, cb <Function> )
```

Fires the callback once for a keypress


### get `.pressed`

```js
<Map> quay.pressed
```

Returns the static keypress map used to hold currently pressed keys, keys are stored as `vkey` definitions whilst the value is the initial raw `keydown` event (`keydown` will usually repeat, these events are ignored as the key stream emits events whilst a key is pressed)

Manually `setting` a value here will probably muck things up, although checking for existence or `getting` the raw event associated with a key will be fine.

```js
quay.pressed.has( '<shift>' ) // Boolean
```


## Stream `data` Event Object

The `data` event is a fairly simple one at present and simply attaches some timing helpers.

```
{
  since: 1291,
  delta: 23.46678
}
```

```
since <Integer>
```

Denotes the time since the last keypress (super handy for measuring double-taps and implementing debounce),

```
delta: <Float>
```

Represents the total duration in `ms` of this current keypress.


## Stream `events`

### `keydown`

Raw keydown for the associated key stream

### `keyup`

Raw keyup for the associated key stream

### `data`

Fired whilst the key is pressed and returns the data event object

### `destroy`

Fired when the stream is removed
