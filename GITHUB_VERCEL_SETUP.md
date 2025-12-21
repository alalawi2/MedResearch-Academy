# GitHub + Vercel Setup Guide
**Project:** MedResearch Academy Website
**Domain:** `medresearch-academy.om`
**Date:** December 21, 2025

This guide explains how to host your website for free using GitHub and Vercel, and how to connect your newly approved domain **medresearch-academy.om**.

---

## Phase 1: Create Your "Code Vault" (GitHub)

GitHub is where your website's source code will live permanently.

1.  **Sign Up:** Go to [github.com](https://github.com) and create a free account.
2.  **Create Repository:**
    *   Click the **+** icon (top right) -> **"New repository"**.
    *   **Repository name:** `medresearch-academy`
    *   **Visibility:** **Public** (easiest) or **Private**.
    *   Click **"Create repository"**.
3.  **Copy URL:** Copy the HTTPS link (e.g., `https://github.com/your-username/medresearch-academy.git`).

---

## Phase 2: Upload Your Code

1.  **Download:** In Manus, go to the **"Code"** tab -> **"Download All"**.
2.  **Unzip:** Extract the ZIP file on your computer.
3.  **Upload:**
    *   Go to your new GitHub repository page.
    *   Click **"uploading an existing file"**.
    *   Drag & drop all files from the unzipped folder.
    *   Click the green **"Commit changes"** button.

---

## Phase 3: Connect the "Engine" (Vercel)

Vercel will build and host your site automatically.

1.  **Sign Up:** Go to [vercel.com](https://vercel.com) -> **"Continue with GitHub"**.
2.  **Import:**
    *   Click **"Add New..."** -> **"Project"**.
    *   Find `medresearch-academy` and click **"Import"**.
3.  **Deploy:**
    *   **Framework Preset:** Select **Vite**.
    *   **Root Directory:** `./` (default).
    *   Click **"Deploy"**.

---

## Phase 4: Connect Your Domain (`medresearch-academy.om`)

This is the final step to make your site live at your professional address.

1.  **Vercel Settings:**
    *   Go to your project dashboard on Vercel.
    *   Click **Settings** -> **Domains**.
    *   Enter `medresearch-academy.om` and click **Add**.
    *   (Recommended) Also add `www.medresearch-academy.om` and click **Add**.

2.  **DNS Configuration (At your Domain Registrar):**
    Log in to your domain provider (e.g., Oman Data Park, Ooredoo) and find the **DNS Management** section. Add the following records:

    | Type | Name (Host) | Value (Points to) | TTL |
    | :--- | :--- | :--- | :--- |
    | **A** | `@` (or blank) | `76.76.21.21` | 3600 |
    | **CNAME** | `www` | `cname.vercel-dns.com` | 3600 |

    *Note: If you have existing A or CNAME records for `@` or `www`, delete them first.*

3.  **Verification:**
    Vercel will automatically check these records. It may take **1 to 24 hours** for the `.om` domain to propagate globally, but often it works within minutes.

---

## How to Update Content

1.  **Ask Manus:** Request changes (e.g., "Add a new blog post").
2.  **Download:** Get the updated files from Manus.
3.  **Upload:** Drag and drop the new files to your GitHub repository.
4.  **Auto-Deploy:** Vercel detects the change and updates the live site instantly.
