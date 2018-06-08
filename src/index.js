import xs from "xstream";

// Logic goes inside the main function
function main() {
  return xs.periodic(1000)
    .fold(prev => prev + 1, 0)
    .map(i => `Seconds elapsed: ${i}`)
}

// Side effects or results go to the domDrive function
//domDrive handles presentation side effects.
function domDriver(text$) {
  text$.subscribe({
    next: str => {
      const elem = document.querySelector('#app');
      elem.textContent = str;
    }
  })
}

// This returns a stream. 
//Note steam of a logic completely seperated from how it's going to be attached to the dom
// `sink` to represent end of logic stream. i.e. No logic flows upwards. Uni-directional.
const logicSink = main()

// LOGIC stream goes to domDriver. domDriver handles side effects such as writing to DOM.
domDriver(logicSink)




