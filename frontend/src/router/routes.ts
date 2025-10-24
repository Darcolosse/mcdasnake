import HomePage from "../pages/HomePage.vue";
import GamePage from "../pages/GamePage.vue";
import SettingPage from "../pages/SettingPage.vue";

export interface Route {
  path: string,
  component: any,
}

export const homeRoute: Route = { path: "/",     component: HomePage }
//export const homeRoute: Route = { path: "/",     component: SettingPage } 
export const playRoute: Route = { path: "/play", component: GamePage } 

export const routes: Route[] = [
  homeRoute,
  playRoute
]
