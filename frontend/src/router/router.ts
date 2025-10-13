import { createRouter, createWebHistory, type Router } from "vue-router";
import { routes } from "./routes";

export const router : Router = createRouter({
  history: createWebHistory(),
  routes,
})
