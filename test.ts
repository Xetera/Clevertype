import Cleverbot from "./Cleverbot";

const cb = new Cleverbot('CC6zaMgw6Tvbd4_vrPSgtOhCM1Q');
cb.say('Hey!').then((response : any )=> {
    console.log(response);
});