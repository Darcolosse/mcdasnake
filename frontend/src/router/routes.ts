import HomePage from "../pages/HomePage.vue";
import GamePage from "../pages/GamePage.vue";
import SettingPage from "../pages/SettingPage.vue";

export interface Route {
  path: string,
  component: any,
}

export const homeRoute: Route = { path: "/",     component: HomePage }
export const playRoute: Route = { path: "/play", component: GamePage }
export const paramRoute: Route = { path: "/param", component: SettingPage } 

export const routes: Route[] = [
  homeRoute,
  playRoute,
  paramRoute
]
