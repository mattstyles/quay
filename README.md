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
