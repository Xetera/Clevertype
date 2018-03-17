![](https://travis-ci.org/ilocereal/Clevertype.svg?branch=master)
# Clevertype

An extensive Javascript/Typescript wrapper for the cleverbot API

Get your Cleverbot API key [here](https://www.cleverbot.com/api/product/api-5k-free-trial/)

#### Note: Only the first 5000 requests are free, you will be required to purchase a subscription or extra API calls later.

# Example
## Get started in just a few lines

```
npm install --save clevertype
```

With typescript
```typescript
import {Cleverbot} from "clevertype"

const cleverbot = new Cleverbot('api-key');

cleverbot.say('come crawling faster').then((response : string) => {
    console.log(response); // => 'obey your master!'
});
```

With javascript
```javascript
const Cleverbot = require('clevertype').Cleverbot;

let cleverbot = new Cleverbot('api-key');

cleverbot.say('you should have known').then(response => {
    console.log(response); // => 'the price of evil'
});
```

## Important:

If you're using a version before 1.1.3 make sure to update it as a dependency was updated to prevent random crashes.  

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

You can pass in mood settings directly from the constructor as well
```typescript 
import {Cleverbot, Config} from 'clevertype'

const config : Config = {
    apiKey: 'your-api-key-here',
    mood: {
        emotion: 10,
        engagement: 40,
        regard: 100,
    }
};
const cleverbot = new Cleverbot(config);
```

Clevertype also logs the number of calls you make per session
```typescript
let calls : number = cleverbot.callAmount;
```

# Full Documentation
[Read the Wiki](https://github.com/ilocereal/Clevertype/wiki)
## Changes
2.0.0 - Now supporting multi user mode which lets you coordinate conversations among multiple users with just an id.

### Breaking changes

#### 2.0.0
`cleverbot.mood` is now a function `cleverbot.mood()`

## TODO
- [x] Save conversation history, this should also take into account the mood that the call was made with as well as the time and CleverbotState.
- [x] Option to start clevertype with a multi-user mode, saving a different CleverbotState for every unique id to allow coordinating multiple conversations at once without confusing contexts for different users.

### Note
As useful as it would be, currently cleverbot does not return and information on the remaining API calls for your account, to track that you would have to implement some sort of persistent database yourself.

#### Made for [Alexa](https://github.com/ilocereal/Alexa/)
