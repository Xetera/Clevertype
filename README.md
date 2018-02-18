# Clevertype

0 dependency Typescript wrapper for the cleverbot API

Get your Cleverbot API key [here](https://www.cleverbot.com/api/product/api-5k-free-trial/)

Note: Only the first 5000 requests are free, you would have to get a subscription for more.

# Example

With typescript
```typescript
import * as Cleverbot from "clevertype"

const config : Cleverbot.Config = {
    apiKey: 'your-api-key-here',
    mood: {
        emotion: 10,
        engagement: 40,
        regard: 100,
    }
};

const cleverbot = new Cleverbot.Client(config);
// or 
const cleverbot = new Cleverbot.Client('api-key');


cleverbot.say('nevermind I'll find').then((response : Cleverbot.Response) => { 
    // Cleverbot.Response is just an alias for string
    console.log(response); // => 'someone like youuu'
}
```

With javascript
```javascript
const Cleverbot = require('clevertype');

const config = {
    apiKey: "your-api-key",
    emotion: { 
    // defaults to 50 for all
        emotion: 100, 
        engagement: 100,
        regard: 100,
   }
};

let cleverbot = new Cleverbot(config);
// constructor also takes in just an api key

cleverbot.say('you should have known').then(response => {
    console.log(response); // => 'the price of evil'
});
```



## Change cleverbot's mood:

* Emotion: Controls how random cleverbot's responses are going to be, 0 = relevant, 100 = wtf

* Engagement: Controls the shyness of the responses, 0 = super shy, 100 = outgoing

* Regard: Controls how self centered her responses are going to be. Usually makes her ruder and ends up not caring about the input as much. 0 = total asshole, 100 = nice boi


```typescript
// all take in a number from 0 to 100
cleverbot.setEmotion(100); 
cleverbot.setEngagement(100);
cleverbot.setRegard(0);

console.log(cleverbot.mood); // => {emotion: 100, engagement: 100, regard: 0}

```

Clevertype also logs the number of calls you make per session
```typescript
let calls : number = cleverbot.callAmount;
```

## TODO
- [ ] Save conversation history, this should also take into account the mood that the call was made with as well as the time and CleverbotState
## Note:
As useful as it would be, currently cleverbot does not return responses on remaining API calls, to track that you would have to implement some sort of persistent database yourself.
