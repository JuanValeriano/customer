// ===== DOM Elements =====
const header = document.getElementById("header")
const navToggle = document.getElementById("nav-toggle")
const navMenu = document.getElementById("nav-menu")
const navLinks = document.querySelectorAll(".nav__link")
const tabBtns = document.querySelectorAll(".tab__btn")
const doctorFlow = document.getElementById("doctor-flow")
const patientFlow = document.getElementById("patient-flow")
const statsNumbers = document.querySelectorAll(".stats__number")

// ===== Header Scroll Effect =====
function handleScroll() {
  if (window.scrollY > 50) {
    header.classList.add("scrolled")
  } else {
    header.classList.remove("scrolled")
  }
}

window.addEventListener("scroll", handleScroll)

// ===== Mobile Navigation =====
navToggle.addEventListener("click", () => {
  navToggle.classList.toggle("active")
  navMenu.classList.toggle("active")
})

// Close menu when clicking a link
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navToggle.classList.remove("active")
    navMenu.classList.remove("active")
  })
})

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
    navToggle.classList.remove("active")
    navMenu.classList.remove("active")
  }
})

// ===== Tab Functionality =====
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active class from all buttons
    tabBtns.forEach((b) => b.classList.remove("tab__btn--active"))

    // Add active class to clicked button
    btn.classList.add("tab__btn--active")

    // Show/hide flows based on tab
    const tab = btn.getAttribute("data-tab")

    if (tab === "doctor") {
      doctorFlow.classList.add("flow--active")
      patientFlow.classList.remove("flow--active")
    } else {
      patientFlow.classList.add("flow--active")
      doctorFlow.classList.remove("flow--active")
    }
  })
})

// ===== Counter Animation =====
function animateCounter(el) {
  const target = Number.parseInt(el.getAttribute("data-count"))
  const duration = 2000
  const step = target / (duration / 16)
  let current = 0

  const timer = setInterval(() => {
    current += step
    if (current >= target) {
      el.textContent = target + (el.parentElement.querySelector(".stats__label").textContent.includes("%") ? "%" : "+")
      clearInterval(timer)
    } else {
      el.textContent = Math.floor(current)
    }
  }, 16)
}

// ===== Intersection Observer for Counter Animation =====
const observerOptions = {
  threshold: 0.5,
  rootMargin: "0px",
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      statsNumbers.forEach((num) => animateCounter(num))
      statsObserver.unobserve(entry.target)
    }
  })
}, observerOptions)

const statsSection = document.querySelector(".stats")
if (statsSection) {
  statsObserver.observe(statsSection)
}

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const targetId = this.getAttribute("href")

    if (targetId === "#") return

    const targetElement = document.querySelector(targetId)

    if (targetElement) {
      const headerHeight = header.offsetHeight
      const targetPosition = targetElement.offsetTop - headerHeight

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }
  })
})

// ===== Active Navigation Link on Scroll =====
const sections = document.querySelectorAll("section[id]")

function highlightNavLink() {
  const scrollY = window.scrollY

  sections.forEach((section) => {
    const sectionHeight = section.offsetHeight
    const sectionTop = section.offsetTop - 100
    const sectionId = section.getAttribute("id")

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach((link) => {
        link.classList.remove("active")
        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active")
        }
      })
    }
  })
}

window.addEventListener("scroll", highlightNavLink)

// ===== Fade In Animation on Scroll =====
const fadeElements = document.querySelectorAll(".benefit__card, .team__member, .flow__step")

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  },
)

fadeElements.forEach((el) => {
  el.style.opacity = "0"
  el.style.transform = "translateY(20px)"
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
  fadeObserver.observe(el)
})

// ===== Initialize =====
document.addEventListener("DOMContentLoaded", () => {
  // Check initial scroll position
  handleScroll()
  highlightNavLink()
})
