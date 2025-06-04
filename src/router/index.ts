import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  { path: '/',      name: 'Home',     component: () => import('@/pages/MainScreen.vue') },
  { path: '/find-trip', name: 'FindTrip', component: () => import('@/pages/FindTrip.vue'), },  
  { path: '/offer-trip', name: 'OfferTrip', component: () => import('@/pages/OfferTrip.vue'), },
  { path: "/trip/:id/passengers", name: "TripPassengers", component: () => import("@/pages/TripPassengers.vue")},
  { path: '/profile',    name: 'Profile',   component: () => import('@/pages/Profile.vue') },
  { path: '/help',       name: 'Help',      component: () => import('@/pages/Help.vue') },
  { path: '/edit-profile', name: 'EditProfile', component: () => import('@/pages/EditProfile.vue'),}, 
  { path: '/search-results', name: 'SearchResults', component: () => import('@/pages/SearchResults.vue'), },
  { path: '/trip/:id', name: 'TripDetails', component: () => import('@/pages/TripDetails.vue'),},  
  { path: '/manage-trips', name: 'ManageTrips', component: () => import('@/pages/ManageTrips.vue'), },  
  { path: '/rate/:id', name: 'RateDriver', component: () => import('@/pages/RateDriver.vue'),},  
  { path: '/edit-trip', name: 'EditTrip', component: () => import('@/pages/EditTrip.vue'),},
  { path: '/my-bookings', name: 'MyBookings', component: () => import('@/pages/MyBookings.vue'),},
  { path: "/rate/:id", name: "RateDriver", component: () => import("@/pages/RateDriver.vue") },
  { path: '/:catchAll(.*)', redirect: '/' },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
