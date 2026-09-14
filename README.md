# My 3D Game — Real Solar System Explorer

An interactive Three.js orrery based on real astronomical measurements from NASA/JPL sources. It is a visualization of the Sun, eight planets, Earth’s Moon, planetary rings, asteroid belt, orbital eccentricities, inclinations, and orbital periods.

## What is scientifically based

- 8 planets in the correct order from the Sun.
- Mean orbital distances and orbital periods based on NASA/JPL planetary data.
- Orbital eccentricity and inclination values are represented.
- Planet radius values are based on published planetary parameters.
- Kepler-style orbital motion with a user-controlled simulation clock.
- Planetary surface maps use NASA/JPL Solar System Simulator map resources where available.

## Visualization note

A literal scale model cannot fit on a screen: the real Solar System has enormous empty distances and tiny planets relative to those distances. Therefore the app uses a **compressed visual distance scale** while preserving the measured orbital relationships and physical size ordering. This is an educational interactive orrery, not a precision ephemeris viewer.

## Controls

- Drag: orbit camera
- Scroll/pinch: zoom
- Click a planet: inspect data
- Planet buttons: focus camera
- Simulation slider: change simulated days per second
- Pause / Resume: stop or continue orbital motion

## Sources

NASA Science: https://science.nasa.gov/solar-system/solar-system-facts/
NASA planetary data: https://ssd.jpl.nasa.gov/planets/phys_par.html
NASA/JPL orbital information: https://science.nasa.gov/solar-system/orbits-and-keplers-laws/
NASA/JPL texture maps: https://space.jpl.nasa.gov/tmaps/

## Status

**Real Solar System implementation pushed to GitHub.**

The web runtime still needs a real production build/deployment check before claiming Vercel production readiness.

## Security

No provider API keys, tokens, or secrets belong in this repository.
