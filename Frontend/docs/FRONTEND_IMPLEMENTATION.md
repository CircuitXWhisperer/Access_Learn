# AccessLearn Frontend Implementation Notes

## Route map

### Student
- `/dashboard` — daily learning dashboard
- `/learn` — learning path and modules
- `/lesson` — accessible lesson reader + Sahayak AI
- `/audio` — audio-first library
- `/schemes` — schemes / scholarships hub
- `/profile` — learning and accessibility preferences
- `/exam` — exam hall

### Admin / educator
- `/admin` — educator command centre
- `/classroom` — live classroom setup
- `/exam-management` — exam scheduling and management
- `/inclusion` — student inclusion roster

## Backend integration points

The frontend is prepared for the blueprint API conventions:

- `POST /auth/refresh`
- `GET /users/me`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /dashboard`
- `GET /schemes`
- `GET /students`
- `PATCH /users/me`

The Axios client sends an in-memory access token in `Authorization: Bearer ...` and uses a separate refresh client so a 401 refresh cannot recursively intercept itself. Refresh is single-flight.

## Accessibility

- Semantic buttons/labels and visible keyboard focus.
- Text scaling control.
- Focus mode.
- Browser speech synthesis for lesson narration.
- Simplified lesson mode.
- Accessible exam controls and question navigation.
- Screen-reader-friendly status and action text.

## Security notes

- No token is stored in localStorage or sessionStorage.
- User-generated rich text is sanitized with DOMPurify before HTML rendering.
- Environment values are validated with Zod.
- Error boundary prevents a render failure from taking down the entire UI.
- Demo mode is intentionally isolated behind `VITE_DEMO_MODE`.
