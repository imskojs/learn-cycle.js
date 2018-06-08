import xs from "xstream";
import fromEvent from "xstream/extra/fromEvent";

// Logic goes inside the main function
function main(fromDriver) {
  // If more than one logicStream we return object with keyed logic streams.
  //This can be thought of as routing of streams to different domDrivers. Routing is not side-effect and is logic so goes into main
  return {
    DOM: xs.periodic(1000)
      .fold(prev => prev + 1, 0)
      .map(i => `Seconds elapsed: ${i}`),
    log: xs.periodic(2000)
      .fold(prev => prev + 1, 0)
  }
}

// Side effects or results go to the domDrive function
//domDrive handles presentation side effects.
function domDriver(text$) {
  text$.subscribe({
    next: str => {
      const elem = document.querySelector('#app');
      elem.textContent = str;
    }
  });

  // Stream returned from domDriver will go to logic function(main)
  const click$ = fromEvent(document, 'click');
  return click$;
}

function logDriver(text$) {
  text$.subscribe({
    next: text => console.log(text)
  })
}

// Only think run function do is plug logicStreams to appropriate drivers
//Hence run function is not a logic nor a side effect. It is what makes cycle.js, maybe.
function run(mainFunc, driverObj) {
  // Note, main function takes an object as an input with driverName as a key, just like it returns object with driverName as a key.
  // Run function coordinates routing. main function tells run function which stream goes to which driver, by returning
  //an object with driverName as a key and logicStream as value. (eg {DOM: xs.periodic(10)})
  // driverFunction returns effectStreams, and run function inputs effectStream back to mainFunction after categorizing
  //which driverFunction the effect stream is from. (eg {DOM: click$})
  const logicStreamObj = mainFunc({ DOM: click$ });
  const click$ = domDriver(logicStreamObj.DOM)


  // const driverNames = Object.keys(driverObj);
  // driverNames.forEach(driverName => {
  //   if (logicStreamObj[driverName]) {
  //     const driverFunc = driverObj[driverName];
  //     driverFunc(logicStreamObj[driverName]);
  //   }
  // })
}

run(main, { DOM: domDriver, log: logDriver })


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

// Side-track: I think cycle.js would attract a lot of devs if rx.js is used, since it is the most buzz worded observable library.

