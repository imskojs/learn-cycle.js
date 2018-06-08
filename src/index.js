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
//Steam of a logic completely seperated from how it's going to be attached to the dom.
// `sink` or `logicStream` to represent the end of logic stream. i.e. No logic flows upwards. Uni-directional.
// Prefer name logicStream
const logicStream = main()

// LOGIC stream goes to domDriver. domDriver handles side effects such as writing to DOM.
domDriver(logicStream)


// Since logic stream and side-effects are seperated we can PLUG logic stream to other Drivers (side-effect handlers)
function logDriver(text$) {
  text$.subscribe({
    next: text => console.log(text)
  })
}
logDriver(logicStream)


// NOTE:
// 1) Logic and side effects are seperated.
//This means we can give logicStream (sink) to different drivers for different platforms.
//Q:: How easy is it to make a complex drivers? 
//Q:: Is there a standard way where there are rules devs agree upon to make drivers? 



// 2)In order for an observable to be subscribed more than once, it has to be HOT observable, otherwise it will create seperate
//independent subscribtions resulting in multiple independent emition of values. In rx.js we could use .share().
//`xstream` unlike Rx.js has hot observable as a default.
// Q:: Do xstream have cold observables?
// Q:: Do we ever need cold observable?


