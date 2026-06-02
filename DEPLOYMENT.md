# Deploying LocalDoc

LocalDoc is built as a single-page application (SPA) using React and Vite. It runs entirely in the browser and connects directly to the Groq API. This makes it extremely easy to deploy to static hosting services like Vercel, Netlify, or GitHub Pages.

## Deploying to Vercel (Recommended)

Vercel is the recommended hosting platform as it provides excellent out-of-the-box support for Vite applications and makes environment variable management simple.

### Prerequisites

1. A GitHub account with the LocalDoc repository pushed to it.
2. A free [Vercel](https://vercel.com/) account.
3. Your Groq API Key.

### Steps

1. **Log in to Vercel** and click **"Add New..." > "Project"**.
2. **Import your Git repository** containing LocalDoc.
3. In the **Configure Project** section:
   - **Framework Preset**: Vercel should automatically detect "Vite". If not, select it.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand the **Environment Variables** section:
   - Name: `VITE_GROQ_API_KEY`
   - Value: `[Your Groq API Key]`
5. Click **Deploy**.

Vercel will build the project and deploy it to a live `.vercel.app` URL.

### Security Note

Because LocalDoc connects directly to the Groq API from the browser, the `VITE_GROQ_API_KEY` is exposed to anyone who inspects the network traffic or the client-side code of the application. 

**This architecture is designed for personal use or internal tools.** If you intend to deploy this application to the public internet, you must implement a backend proxy to securely store and handle the API key and forward requests to the Groq API.

## Building Locally for Production

If you want to host the files yourself (e.g., on a VPS using Nginx):

1. Clone the repository.
2. Install dependencies: `npm install`
3. Create a `.env` file with your `VITE_GROQ_API_KEY`.
4. Run the build command: `npm run build`
5. The static assets will be generated in the `dist` folder. You can serve this folder using any static web server.
