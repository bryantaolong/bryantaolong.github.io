<template>
  <div id="app">
    <Header />
    <RouterView />
    <Footer />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<style>
/* Global styles will be imported via simple.css */
</style>