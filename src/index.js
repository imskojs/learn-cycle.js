import xs from "xstream";
import fromEvent from "xstream/extra/fromEvent";

// Logic goes inside the main function
function main(fromDriver) {
  // If more than one logicStream we return object with keyed logic streams.
  //This can be thought of as routing of streams to different domDrivers. Routing is not side-effect and is logic so goes into main
  const click$ = fromDriver.DOM;
  return {
    DOM: click$.startWith(null)
      .map(() => xs.periodic(1000)
        .fold(prev => prev + 1, 0)
      ).flatten()
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
  const relayFromLogicStream = xs.create();
  const click$ = domDriver(relayFromLogicStream);
  const logicStreamObj = mainFunc({ DOM: click$ });
  relayFromLogicStream.imitate(logicStreamObj.DOM)

  // However above does not work without relayFromLogicStream. click$ is not defined before calling mainFunc
  //If we change the order then logicStreamObj is not defined.
  // We can bypass this problem, by using a stream that simply relays the original stream so;

  // INITIALLY domDriver runs and subscribes to a stream that emits nothing, since it's hot observable no next tick happens upon subscribtion by driver.
  // it returns effect stream with no problem***. 

  // Since there is no possible DOM rendering due to next tick not happening in domDriver there would be no dom to listen to in domDriver so
  // INITIALLY main runs with empty effect stream.

  // Here we are in a state nothing happens. In order for something to happen one of the streams have to emit value (start the engine)
  //so that other stream will emit the value and so on (cyclically!)

  // In order to kick start the engine, within main function we would give initial value for a effect stream with (`startWith` operator) as we need initial state 
  //before rendering anything to the dom. Note, logicStream runs as soon as startWith happens as it is already subscribed in domDriver through
  //relayFromLoginStream. Now with `startWith` DOM is rendered, and any click from user will rerender DOM...Normally that would have shit performance
  //but since cycle uses snapdom it only rerenders things that are changed.

  // So result is BOTH domDriver and main runs without getting any stream. So INITIAL run simply sets up and connects streams.

  // ***Q:: in this example in domDriver `document` is used which is global. What if dom driver requires to
  //listen to specific dom requested by logic stream? Maybe relayStream is setup for fromEvent and actual setup is done only when next tick happens
  //for the first time. FOR EXAMPLE: set `relayClick$` and return that. In next tick relayClick$.imitate(wantedStream$)
  // Safe to assume xstream is used for DOM drive because of this imitate helper?


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

