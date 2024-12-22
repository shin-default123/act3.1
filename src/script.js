import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/2.png') // Load the particle texture

/**
 * Particles
 */
// Geometry: Create a BufferGeometry for the particles
const particlesGeometry = new THREE.BufferGeometry()
const count = 20000 // Increased number of particles to 20,000

// Create Float32Arrays to store the positions and colors of the particles
const positions = new Float32Array(count * 3) // 3 values for each position (x, y, z)
const colors = new Float32Array(count * 3) // 3 values for each color (r, g, b)

// Randomly generate positions and colors for each particle
for (let i = 0; i < count * 3; i++) {
    // Random position between -5 and 5
    positions[i] = (Math.random() - 0.5) * 10
    
    // Random color between 0 and 1 for each of the RGB channels
    colors[i] = Math.random() 
}

// Set the position and color attributes for the particles geometry
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))  // Add color attribute

// Material: Create a PointsMaterial for the particles
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    sizeAttenuation: true,
    transparent: true,
    map: particleTexture,
    alphaMap: particleTexture,
    alphaTest: 0.001,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending, // Makes the particles blend additively, creating a glow effect
    vertexColors: true // Enable per-particle color
})

// Create the particle system (Points object)
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Rotate the particle system for a continuous effect
    particles.rotation.y = elapsedTime * 0.2  // Apply rotation to the particle system for dynamic movement

    // Access the position array from the geometry's attribute
    const positionArray = particlesGeometry.attributes.position.array

    // Update positions based on the X-coordinate
    for (let i = 0; i < count; i++) {
        let i3 = i * 3  // Get the index for x, y, z in the array
        const x = positionArray[i3]  // Get the current X position of the particle
        positionArray[i3 + 1] = Math.sin(elapsedTime + x) // Update the Y position using a sine function based on X
    }

    // Mark the position attribute as needing an update to reflect changes
    particlesGeometry.attributes.position.needsUpdate = true

    // Update controls
    controls.update()

    // Render the scene
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
