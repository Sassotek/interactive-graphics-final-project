# interactive-graphics-final-project

## Space Walking
This app realizes a scene where an astronaut placed on a planet which constitutes the center of a fictional planet system, where are included moving planets and standstill planets.
The camera is placed always locking at the astronaut and can be:
+ rotated around X-axys and Z-axis clicking with the left mouse button and dragging,
+ moved closer and farther with the mouse wheel.
 
The scene is made using webgl and javascript, and are realized the visual effets: omni directional shading, omni directional shadowmapping. The final result is obtained combining both techniques.
Initially all the planets are standing still, waiting for the command to move.
6 planets can be find in the scene, of which
+ Standstill: _Quaoar_, _Kamillis_, _Hagaton_ and _Ophin_, the central planet.
+ Moving: _Pyrona_ the light source of the planetary system, it revolves around Ophin, and _Hal_, a smaller planet that revolves around Pyrona.
All the moving planets rotates also on their axis.  

## How to run it
In order to run this app:
1. Run ```server.py``` in ```./objects``` so that the main program can take objects and textures resources. (Check if your browser accepts http request having ```server.py``` opening a server reachible only by http requests)
2. Open ```index.html``` in your browser.


## Controls
In the application on the upper right side there is placed a commands table containing some buttons and checkbox here are the functions:
- A little button to display/hide the command table
* ```Toggle first person``` will put from the initial 3rd person point of view the astronaut point of view and viceversa, mantaining the camera rotation.
+ ```Reset``` puts the planetary system on the initial disposition.
+ ```Orizzontal rotation``` makes Hal moving around Pyrona and Pyrona around Hal, orizzontally. 
+ ```Vertical rotation``` makes Hal moving around Pyrona and Pyrona around Hal, vertically. 
+ ```Shadowmap```
+ ```Shadowmap + Shading```
