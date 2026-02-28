import './style.css'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger);

// Initial states
gsap.set('.layer-exterior', { opacity: 0 });
gsap.set('.title-part', { y: 100, opacity: 0 });
gsap.set('.window-wall', { scale: 1 });
gsap.set('.amenity', { y: 20, opacity: 0 });

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.scroll-container',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1, // Smooth scrubbing
  }
});

// Segment 1: The Dive (Zoom into the window hole)
// We scale the interior wall extremely large, 
// so the 480x700 hole becomes larger than the viewport.
tl.to('.window-wall', {
  scale: 45, // Massive scale
  duration: 1.5,
  ease: 'power2.inOut'
}, 0)
  // Fade out interior text concurrently
  .to('.interior-text-content', {
    opacity: 0,
    duration: 0.5,
    ease: 'power1.in'
  }, 0);

// Segment 2: Cloud transition & Exterior reveal
// Hide the wall completely once the hole engulfs the view
tl.to('.layer-interior', {
  opacity: 0,
  duration: 0.1
}, 1.4)
  // Scale the clouds to give a zooming/flying effect
  .to('.cloud-image', {
    scale: 2.5,
    duration: 2,
    ease: 'none'
  }, 0)
  // Fade out clouds to reveal the exterior jet underneath
  .to('.layer-clouds', {
    opacity: 0,
    duration: 0.8,
    ease: 'power2.inOut' // Slow fade to give a smooth transition
  }, 1.6); // Start fading clouds near the end of the timeline

// Turn on exterior layer opacity as clouds start fading
tl.to('.layer-exterior', {
  opacity: 1,
  duration: 0.1
}, 1.5);

// Segment 3: Exterior Jet animation
// Scale down jet slightly as if we're stabilizing altitude
tl.fromTo('.jet-container',
  { scale: 1.2 },
  { scale: 1.0, duration: 1.5, ease: 'power1.out' },
  1.6) // Match cloud fade
  // Reveal jet text
  .to('.title-part', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.2, // Animate "Fly in" then "Luxury"
    ease: 'back.out(1.7)'
  }, 2.0)

  // ---- Segment 4: The Interior Tour ----

  // Fade out previous text to focus on the tour
  .to('.title-part, .subtext-left', {
    opacity: 0,
    y: -20,
    duration: 0.8,
    ease: 'power1.in'
  }, 3.0)

  // Dissolve the exterior metal roof
  .to('.jet-exterior', {
    opacity: 0,
    duration: 1.5,
    ease: 'power2.inOut'
  }, 3.2)

  // Coordinated Static Amenities Pop-ups (Premium Labels without panning)
  .to('.amenity-cockpit', { opacity: 1, y: 0, duration: 1.0, ease: 'power1.out' }, 3.8)
  .to('.amenity-lounge', { opacity: 1, y: 0, duration: 1.0, ease: 'power1.out' }, 4.8)
  .to('.amenity-bedroom', { opacity: 1, y: 0, duration: 1.0, ease: 'power1.out' }, 5.8)

  // Extra padding to ensure labels stay visible as user reaches bottom of scroll container
  .to({}, { duration: 2.0 });

// --- Booking Modal Logic ---
const openBtn = document.getElementById('open-booking');
const closeBtn = document.getElementById('close-booking');
const modalOverlay = document.getElementById('booking-modal');
const modalContent = document.querySelector('.booking-content');

let modalTimeline = gsap.timeline({ paused: true });

// Setup animation
modalTimeline.to(modalOverlay, {
  opacity: 1,
  pointerEvents: 'auto',
  duration: 0.4,
  ease: 'power2.out'
})
  .to(modalContent, {
    scale: 1,
    opacity: 1,
    duration: 0.5,
    ease: 'back.out(1.5)'
  }, "-=0.2");

openBtn.addEventListener('click', () => {
  // Lock body scroll logic if we weren't depending entirely on locomotive/fixed height
  document.body.style.overflow = 'hidden';
  modalTimeline.play();
});

closeBtn.addEventListener('click', () => {
  document.body.style.overflow = '';
  modalTimeline.reverse();

  // reset to step 1
  setTimeout(() => {
    goToStep(1);
  }, 500);
});

// --- Step Navigation Logic ---
const steps = [
  document.getElementById('step-1'),
  document.getElementById('step-2'),
  document.getElementById('step-3'),
  document.getElementById('step-4')
];

function goToStep(stepIndex) {
  // Hide all
  steps.forEach(step => step.classList.remove('active'));
  // Show target
  steps[stepIndex - 1].classList.add('active');

  // Quick little fade in animation for the step content
  gsap.fromTo(steps[stepIndex - 1],
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  );
}

document.getElementById('btn-next-1').addEventListener('click', () => goToStep(2));
document.getElementById('btn-back-2').addEventListener('click', () => goToStep(1));
document.getElementById('btn-next-2').addEventListener('click', () => goToStep(3));
document.getElementById('btn-back-3').addEventListener('click', () => goToStep(2));
document.getElementById('btn-next-3').addEventListener('click', () => goToStep(4));
document.getElementById('btn-back-4').addEventListener('click', () => goToStep(3));
// Guest Selection Logic
const guestBtns = document.querySelectorAll('.guest-btn');
guestBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    guestBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  });
});

document.getElementById('btn-finish').addEventListener('click', () => {
  // Grab standard info
  const nameInput = document.getElementById('passenger-name').value || "MEMBER";
  const dateInput = document.getElementById('departure-date').value || "TBD";
  let activeGuest = document.querySelector('.guest-btn.active');
  let guests = activeGuest ? activeGuest.innerText : "1";

  // Populate Boarding Pass
  document.getElementById('pass-name-display').innerText = nameInput.toUpperCase();
  document.getElementById('pass-date-display').innerText = dateInput;
  document.getElementById('pass-guests-display').innerText = guests;

  // Save for Dashboard
  localStorage.setItem('jesko_passenger_name', nameInput);

  // Transition to Boarding Pass Overlay
  const boardingPassOverlay = document.getElementById('boarding-pass-overlay');
  const passContainer = document.querySelector('.pass-container');

  // Fade out standard modal content
  gsap.to(modalContent, {
    scale: 0.95,
    opacity: 0,
    duration: 0.4
  });

  // Fade in pure black background and drop in the pass
  let bpTimeline = gsap.timeline();
  bpTimeline.to(boardingPassOverlay, {
    opacity: 1,
    pointerEvents: 'auto',
    duration: 0.8,
    ease: 'power2.inOut'
  })
    .to(passContainer, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'expo.out'
    }, "-=0.2");
});

document.getElementById('btn-enter-dashboard').addEventListener('click', () => {
  window.location.href = '/dashboard.html';
});
