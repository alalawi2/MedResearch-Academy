# GitHub + Vercel Setup Guide
**Project:** MedResearch Academy Website
**Date:** December 20, 2025

This guide will help you set up the **"Automated Update"** workflow. Once completed, updating your website will be as simple as asking Manus to make a change and then clicking one button.

---

## Phase 1: Create Your "Code Vault" (GitHub)

GitHub is where your website's source code will live permanently. It is private, secure, and industry-standard.

1.  **Sign Up:** Go to [github.com](https://github.com) and create a free account.
2.  **Create Repository:**
    *   Click the **+** icon in the top right corner and select **"New repository"**.
    *   **Repository name:** `med-research-academy` (or similar).
    *   **Visibility:** Choose **Public** (free and easy) or **Private** (if you want to hide the code).
    *   Click **"Create repository"**.
3.  **Get the Link:** You will see a URL like `https://github.com/your-username/med-research-academy.git`. **Copy this link.**

---

## Phase 2: Upload Your Code

Now we need to move the code from Manus to your new GitHub repository.

1.  **Download Code:** In the Manus interface, go to the **"Code"** tab (file icon) and click **"Download All"**. This gives you a ZIP file.
2.  **Unzip:** Extract the folder on your computer.
3.  **Upload to GitHub:**
    *   Go back to your GitHub repository page.
    *   Click **"uploading an existing file"**.
    *   Drag and drop all the files from the unzipped folder into the browser window.
    *   **Important:** Wait for them to upload, then scroll down and click the green **"Commit changes"** button.

*(Note: For a more professional setup, you can use the "Git" command line tool, but the drag-and-drop method works fine for the initial upload.)*

---

## Phase 3: Connect the "Engine" (Vercel)

Vercel will take the code from GitHub and turn it into a live website.

1.  **Sign Up:** Go to [vercel.com](https://vercel.com) and sign up using **"Continue with GitHub"**.
2.  **Import Project:**
    *   On your Vercel dashboard, click **"Add New..."** -> **"Project"**.
    *   You will see your `med-research-academy` repository listed. Click **"Import"**.
3.  **Configure:**
    *   **Framework Preset:** It should auto-detect "Vite" or "React". If not, select **Vite**.
    *   **Root Directory:** Ensure it points to the main folder (where `package.json` is).
    *   Click **"Deploy"**.

**Success!** Vercel will build your site and give you a live URL (e.g., `med-research-academy.vercel.app`).

---

## Phase 4: Connect Your Domain

Finally, make your professional domain (`med-research.om`) point to this new Vercel site.

1.  In Vercel, go to **Settings** -> **Domains**.
2.  Type your domain (e.g., `www.med-research.om`) and click **Add**.
3.  Vercel will show you some **DNS Records** (usually an A Record and a CNAME).
4.  Log in to where you bought your domain (e.g., Oman Data Park) and add these records.

---

## How to Update in the Future

This is the magic part. When you want to change something:

1.  **Ask Manus:** "Add a new news item about the 2026 Conference."
2.  **Manus Updates:** I change the code here.
3.  **You Sync:** You download the updated files and upload them to GitHub (or use Git commands).
4.  **Automatic Magic:** Vercel sees the change on GitHub and **automatically updates your live website** within seconds. No servers to restart, no files to FTP.
