export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    GET_PROFILE: "/api/auth/profile",
  },

  USERS: {
    UPDATE_PROFILE: "/api/users/profile",
    GET_COUNT: "/api/users/count",
  },

  TRAINERS: {
    GET_ALL: "/api/trainers",
    GET_ONE: (id) => `/api/trainers/${id}`,
  },

  CLASSES: {
    GET_ALL: "/api/classes",
    GET_ALL_WITH_AVAILABILITY: "/api/classes/all-with-availability",
    GET_ONE: (id) => `/api/classes/${id}`,
  },

  MEMBERSHIPS: {
    GET_ALL: "/api/memberships",
    GET_ONE: (id) => `/api/memberships/${id}`,
  },

  PLANS: {
    GET_ALL: "/api/plans",
    GET_ONE: (id) => `/api/plans/${id}`,
  },

  BOOKINGS: {
    GET_ALL: "/api/bookings",
    CREATE: "/api/bookings",
    GET_ONE: (id) => `/api/bookings/${id}`,
    UPDATE: (id) => `/api/bookings/${id}`,
    CANCEL: (id) => `/api/bookings/${id}/cancel`,
  },

  TESTIMONIALS: {
    GET_APPROVED: "/api/testimonials",
    CREATE: "/api/testimonials",
    UPDATE: (id) => `/api/testimonials/${id}`,
  },

  AI: {
    GENERATE_WORKOUT: "/api/ai/workout",
    GENERATE_DIET: "/api/ai/diet",
    GENERATE_EXPLANATION: "/api/ai/explanation",
  },

  SESSIONS: {
    CREATE: "/api/sessions/create",
    GET_MY: "/api/sessions/my-sessions",
    GET_ONE: (id) => `/api/sessions/${id}`,
    DELETE: (id) => `/api/sessions/${id}`,
  },

  QUESTIONS: {
    ADD_TO_SESSION: "/api/questions/add",
    PIN: (id) => `/api/questions/${id}/pin`,
    UPDATE_NOTE: (id) => `/api/questions/${id}/note`,
  },

  ADMIN: {
    BOOKINGS: {
      UPDATE_STATUS: (id) => `/api/admin/bookings/${id}/status`,
      DELETE: (id) => `/api/admin/bookings/${id}`,
    },
    CLASSES: {
      CREATE: "/api/admin/classes",
      UPDATE: (id) => `/api/admin/classes/${id}`,
      DELETE: (id) => `/api/admin/classes/${id}`,
      CANCEL_DATE: (id) => `/api/admin/classes/${id}/cancel`,
      ACTIVATE_DATE: (id) => `/api/admin/classes/${id}/activate`,
    },
    MEMBERSHIPS: {
      CREATE: "/api/admin/memberships",
      UPDATE: (id) => `/api/admin/memberships/${id}`,
      DEACTIVATE: (id) => `/api/admin/memberships/deactivate/${id}`,
      REACTIVATE: (id) => `/api/admin/memberships/reactivate/${id}`,
      DELETE: (id) => `/api/admin/memberships/${id}`,
    },
    TESTIMONIALS: {
      GET_ALL: "/api/admin/testimonials/all",
      APPROVE: (id) => `/api/admin/testimonials/approve/${id}`,
      REJECT: (id) => `/api/admin/testimonials/reject/${id}`,
      DELETE: (id) => `/api/admin/testimonials/${id}`,
    },
    TRAINERS: {
      CREATE: "/api/admin/trainers",
      UPDATE: (id) => `/api/admin/trainers/${id}`,
      DELETE: (id) => `/api/admin/trainers/${id}`,
    },
    USERS: {
      GET_ALL: "/api/admin/users",
      DELETE: (id) => `/api/admin/users/${id}`,
    },
  },
};