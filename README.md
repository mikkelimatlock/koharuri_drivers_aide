# Koharuri Driver's Aide
A Koharu Rikka warning you about speeding and all.  
## TODO
- **In case I forget: migrate / connect with BeamNG**  
Refer to this [manual](https://documentation.beamng.com/modding/ui/app_creation/)  
Leave some generic functions because we're not that much into BeamNG!!  
Probably? Make this into a UI app.  
Can access speed limits according to this: [BeamAdvisor](https://github.com/ThatTonybo/BeamAdvisor)  

- **Make all the lines**  
With VOICEPEAK Rikka  

- **Randomise lines a bit**  
I'll figure out how, and I'll write TODOs in the code, not here  

- **Fix state migration (see agent_actions.js)**  
More details in the code itself, not here   

## How to debug
- **Now integrated with Node.js server!**  
Requires Node.js and npm packages `express` and `morgan` to run... properly.  
`npm install express morgan`  
BeamNG OutGauge requires `dgram` for... something.  
`npm install dgram`  
Communication between frontend/backend requires some WebSocket.  
`npm install ws`  
Boot up the server with:  
`node server.js`  
Should be at `http://localhost:5860`  

- **Alternatively, a Python server** (without all the BeamNG fun)  
Navigate to root directory (`rikka_public`, where all the good HTML is)  
and run: `python -m http.server [port]`,  
boot up a browser and open up `http://localhost:[port]` and do everything.  

- **Debugging with BeamNG**  
I have no idea how to do that as of now.  

## Stuff borrowed
[Alte DIN 1451 Mittelschrift](https://fonts2u.com/alte-din-1451-mittelschrift.font) - for speed limit numbers.  

## About Koharu Rikka
Koharu Rikka (小春**立**花) is a character owned and managed by TOKYO6 ENTERTAINMENT.  
Voices used in this project are generated using VOICEPEAK 小春六花.  
Images used in this project are provided by TOKYO6 via [ニコニコ静画](https://seiga.nicovideo.jp/seiga/im11216393). Used according to the corresponding [guidelines](https://tokyo6.tokyo/guidelines/).  
### About the author  
Enjoying life at Todo-iwa 🦭🪨
