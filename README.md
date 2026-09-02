[Live](https://momentogram.onrender.com)

Feature List:

-   🌟 Tech stack: MERN + Socket.io + Chakra UI
-   🎃 Authentication & Authorization with JWT
-   📝 Create Post
-   🗑️ Delete Post
-   ❤️ Like/Unlike Post
-   💬 Comment to a Post
-   👥 Follow/Unfollow Users
-   ❄️ Freeze Your Account
-   🌓 Dark/Light Mode
-   📱 Completely Responsive
-   💬 Chat App With Image Support
-   👀 Seen/Unseen Status for Messages
-   🔊 Notification sounds
-   ⭐ Deployment for FREE
# Momentogram

An Instagram-like infinite-scrolling demo app built with React + TypeScript and Tailwind. Momentogram showcases a modern, component-driven feed UI with pages for Home, Profile, Post Details, Create/Edit Post, Explore, Saved/Liked posts and basic client-side auth patterns.

## Features
- Infinite-scrolling feed (Home)
- Create, edit, view post details
- User profiles, follow / like / save UI flows
- Explore/search pages and All Users listing
- Reusable UI primitives: buttons, inputs, forms, toasts
- Built with Vite for a fast dev experience

## Tech stack
- TypeScript + React
- Vite (dev server & build)
- Tailwind CSS for styling
- Local UI components and hooks in `src/components` and `src/hooks`

## Getting started

Prerequisites
- Node.js (16+ recommended)
- npm

Quick start
```bash
git clone https://github.com/twonum/Momentogram.git
cd Momentogram
npm install
npm run dev
```

Available scripts
- `npm run dev` — start the Vite dev server
- `npm run build` — build production bundle
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

## Project structure (top-level)
```
index.html
package.json
vite.config.ts
tailwind.config.js
src/
  main.tsx                # app bootstrap
  App.tsx                 # top-level app / routes
  globals.css             # global styles (Tailwind)
  _root/
    RootLayout.tsx        # app layout
    pages/                # pages: Home, Profile, PostDetails, CreatePost, EditPost, Explore, Saved, LikedPosts, UpdateProfile, AllUsers
  components/
    ui/                   # UI primitives: button, input, form, toast, etc.
    shared/               # shared components
    forms/                # form related components
  context/
    AuthContext.tsx       # auth context/provider
  hooks/                  # custom hooks (infinite scroll, etc.)
  lib/                    # helper utilities / API client (if present)
  types/                  # TypeScript types
public/                   # static assets
```

## Notes about data & backend
This repository is primarily a frontend demo. If you find API calls or a client in `src/lib` or elsewhere, the project may expect a backend or mock server. Check:
- `src/lib` for API client wrappers
- `src/context/AuthContext.tsx` for auth flows and endpoints

If no backend is provided, the app can be used with mock data or wired to your own API by:
1. Creating a simple JSON server / mock endpoints, or
2. Replacing fetch calls in the API client with your endpoints, and adding any required env vars.

## Configuration
- Tailwind configuration: `tailwind.config.js`
- Vite config: `vite.config.ts`
- TypeScript configs: `tsconfig.json`, `tsconfig.app.json`

If you add environment variables for an API, create a `.env` file and reference them in `vite.config.ts` or the client code. Example:
```
VITE_API_BASE_URL=https://api.example.com
```

## Contributing
- Suggest improvements via issues or open a PR.
- Run `npm run lint` and ensure TypeScript type checks pass before opening a PR.
- Keep changes focused and add brief descriptions to commits.

## License
Add a license file if you want to make the licensing explicit (e.g., MIT). This repo currently does not include a LICENSE.

## Contact
Questions or suggestions — open an issue or contact the repository owner on GitHub.

```
