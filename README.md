# My 3D Game — Sketchfab-Quality Real Solar System

A browser-based Three.js Solar System viewer designed for a realistic, spacecraft-style 3D experience rather than a simple colored-sphere demo.

## Realistic viewer

- Real NASA/JPL planetary map textures loaded onto 3D spheres where available.
- Higher-resolution sphere geometry for smoother close-up views.
- Sun with layered glow and strong solar lighting.
- Earth atmospheric halo and Moon.
- Saturn ring system.
- Deep-space star field and asteroid belt.
- Orbit camera with damping, zoom, touch/pinch support and click-to-inspect.
- Planet focus controls and scientific information panel.
- Kepler-style orbital motion with adjustable simulation speed.

NASA/JPL's Solar System Simulator publishes planetary map resources, many of which are stitched from spacecraft imagery; NASA also maintains a collection of free 3D models and textures. The gas-giant maps are representative because their atmospheres change over time. citeturn0search3turn0search4

## Scientific boundary

The viewer uses measured planetary radii, orbital distances, eccentricities, inclinations and orbital periods. Distances are visually compressed so the entire system can be explored on a screen. It is therefore a realistic educational orrery, **not a precision live-ephemeris replacement for NASA's Eyes on the Solar System**. NASA's Eyes application uses highly accurate data and imagery and supports time travel through simulated Solar System views. citeturn0search11

## Controls

- Drag: orbit camera
- Scroll / pinch: zoom
- Click a planet: inspect
- Planet buttons: focus camera
- Simulation slider: change simulated days per second
- Pause / Resume: stop or continue orbital motion
- Reset view: return to system overview

## Asset licensing

NASA states that its content used in 3D models, including texture maps and polygon data, is generally not subject to U.S. copyright, subject to its media-use guidelines. Third-party Sketchfab models can have their own Creative Commons restrictions and attribution requirements, so this project does not silently copy arbitrary Sketchfab assets. citeturn0search15turn0search14

## Sources

- NASA/JPL Solar System Simulator texture maps: https://space.jpl.nasa.gov/tmaps/
- NASA 3D Resources: https://github.com/nasa/NASA-3D-Resources
- NASA Eyes on the Solar System: https://science.nasa.gov/eyes/

## Status

**Realistic Solar System viewer upgraded and pushed to GitHub.**

The production runtime/deployment still needs an actual build and browser verification before claiming Vercel production readiness.

## Security

No provider API keys, tokens, or secrets belong in this repository.
