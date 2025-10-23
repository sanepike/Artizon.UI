<template>
  <div class="home-page">
    <div class="hero-section">
      <!-- Hero Background Image -->
      <div class="hero-image" />

      <!-- Gradient Overlay -->
      <div class="hero-gradient" />

      <!-- Hero Content -->
      <div class="hero-content">
        <h1 class="hero-title">Welcome to Artizons</h1>
        <p class="hero-description">
          Discover unique handcrafted products from talented artisans around the
          world. Connect directly with creators and bring their masterpieces to
          your doorstep.
        </p>
        <button class="explore-btn" @click="handleExploreMarketplace">
          Explore Marketplace
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

function handleExploreMarketplace() {
  if (authStore.isAuthenticated) {
    router.push("/dashboard");
  } else {
    router.push("/auth/login");
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  width: 100%;
}

.hero-section {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Hero Background Image */
.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #8b7355; /* Fallback color - earthy brown */
  background-image: url("/hero-artisan.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

/* Gradient Overlay - Top to Bottom, decreasing opacity */
.hero-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.5) 40%,
    rgba(0, 0, 0, 0.2) 70%,
    rgba(0, 0, 0, 0) 100%
  );
  z-index: 2;
}

/* Hero Content */
.hero-content {
  position: relative;
  z-index: 3;
  text-align: center;
  color: white;
  max-width: 800px;
  padding: 2rem;
  margin-top: -10vh;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
  letter-spacing: 1px;
}

.hero-description {
  font-size: 1.3rem;
  line-height: 1.8;
  margin: 0 0 2.5rem 0;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.95);
}

.explore-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.explore-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.explore-btn:active {
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1.1rem;
    line-height: 1.6;
  }

  .explore-btn {
    padding: 0.9rem 2.5rem;
    font-size: 1.1rem;
  }

  .hero-content {
    padding: 1.5rem;
    margin-top: -5vh;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .hero-description {
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  .explore-btn {
    padding: 0.8rem 2rem;
    font-size: 1rem;
  }

  .hero-content {
    padding: 1rem;
  }
}
</style>
