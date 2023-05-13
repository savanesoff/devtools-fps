# devtools-fps

![Validator](demo/devtools-fps-full-demo.gif)

`devtools-fps` is an FPS monitor for web application performance observability without the use of browser devtools.

# Why? 🙃

In order to monitor FPS without other processes running at the same time (browser devtools), but also while application is rendered at full screen. `devtools-fps` allows you to interact with it by pausing "recording" and inspecting a snapshot of a buffer for a specific frame performance and time the frame was rendered at.

# Install

`yarn`

```bash
yarn add -D devtools-fps
```

`npm`

```bash
npm install -D devtools-fps
```

# Usage

Anywhere in your code (preferably in the file `main.ts`) import `devtools-fps`:

```javascript
import devtoolsFPS from "devtools-fps";
```

...this will automatically start at the `bottom-right` corner of application page at `220x50` size.

Run your app! You'll see the `devtools-fps` display running on top of your content.

## Positioning

You can drag `devtools-fps` display around your screen, it will automatically snap to page edges.

## Resizing

Grab the control points of `devtools-fps` display, which will activate when you hover close to it, then drag it around to give it any size you like.

## Inspect

Click on `devtools-fps` to toggle `inspect` mode. If `inspect` mode is activated, the rendering will pause and a `Tooltip` will be displayed with data related to the corresponding buffer data, which includes:

1. FPS
2. Timestamp `HH:MM:SS:MS` (in local time)

Use it to reference various app events at specific times. Much like `performance` devtools in chrome.

## Configuration

You can further configure `devtools-fps` by using `.config()` method to customize it`s appearance, size, position and buffer size:

```ts
// config type
type config = {
  /** display width in px */
  width?: number;
  /** display height in px */
  height?: number;
  /** buffer size will determine the resolution and speed of motion */
  bufferSize?: number;
  /** CSS style of canvas. You shouldn't set "width", "height" and "position" */
  style?: Omit<Partial<CSSStyleDeclaration>, "width" | "height" | "position">;
};
```

Example:

```ts
import  devtoolsFPS  from 'devtools-fps';
// configure defaults
devtoolsFPS.config({
    width: 220
    height: 74,
    bufferSize: 110,
    style: {
        backgroundColor: `rgba(0,0,50,0.3)`,
        top: '0px',
        left: '0px',
        boxShadow: "5px 5px 10px 0 rgba(0,0,0,0.5)",
        opacity: '0.5',
        // etc...
    }
})

// rest of your app
```

In cases where your IDE will remove unused imports, simply call `.config()` with empty parameters:

```ts
import devtoolsFPS from "devtools-fps";
devtoolsFPS.config(); // <-- like this
```

### Buffer

Buffer size will determine the resolutions of the FPS timeline, the bigger the size the higher the resolution and therefor the slower the timeline will appear to shift. Conversely, smaller buffer size will enlarge individual FSP timeline slices, which means it will appear to shift faster.

# PS

Hit me up on [Li](https://www.linkedin.com/in/samvel-avanesov/)

Enjoy! 🎉🎉🎉
