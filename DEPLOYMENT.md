# Deployment, Security, & Maintenance Guide
**Project:** MedResearch Academy Website
**Date:** December 20, 2025

This document outlines the recommended strategies for hosting, securing, and maintaining the MedResearch Academy website. As a **static React application**, this website benefits from high performance, low cost, and superior security compared to traditional CMS platforms like WordPress.

---

## 1. Hosting Recommendations

Since you have acquired a domain (e.g., `.om`), you need a hosting provider to serve your website files to the world.

### Option A: Global Cloud Hosting (Recommended)
**Providers:** [Vercel](https://vercel.com), [Netlify](https://netlify.com), or [Cloudflare Pages](https://pages.cloudflare.com).

*   **Why:** These platforms are built specifically for React applications.
*   **Pros:**
    *   **Speed:** They use a Global CDN (Content Delivery Network) to serve your site from the server closest to the visitor (e.g., a visitor in Muscat gets data from a Middle East node, a visitor in London gets it from London).
    *   **Cost:** Generous free tiers that can easily handle thousands of visitors per month.
    *   **Automation:** Connects to your GitHub repository. Every time you save a change to the code, the site updates automatically.
    *   **Security:** Free, automatic SSL (HTTPS) certificates.

### Option B: Local Omani Hosting (For Data Sovereignty)
**Providers:** [Oman Data Park](https://omandatapark.com), [Ooredoo Host](https://ooredoo.om), or [Omantel](https://omantel.om).

*   **Why:** If you are legally required to host data physically within the Sultanate of Oman (often required for government or sensitive patient data portals).
*   **Pros:** Compliance with strict local data residency laws.
*   **Cons:** typically more expensive, requires more manual setup (FTP/cPanel), and may not offer the same automated deployment features as global providers.
*   **Verdict:** Since this is an **informational website** and not a patient database, Option A is usually acceptable and superior in performance. However, check with your institution's IT policy.

---

## 2. Security Architecture

Your website is built as a **Static Web App**. This architecture is inherently more secure than dynamic sites.

### Why it is Secure:
1.  **No Database to Hack:** The site consists of pre-built files (HTML, CSS, JavaScript). There is no database connected directly to the frontend that hackers can exploit via SQL Injection.
2.  **No Server-Side Code:** There is no PHP or Python server running that needs constant patching against vulnerabilities.
3.  **Reduced Attack Surface:** The only "moving part" is the contact form, which is offloaded to a secure third-party service (Formspree).

### Security Checklist for Launch:
*   [ ] **SSL Certificate:** Ensure your domain has `https://` enabled. (Automatic on Vercel/Netlify).
*   [ ] **Secure Headers:** Configure your host to send security headers (HSTS, X-Frame-Options) to prevent clickjacking.
*   [ ] **Form Protection:** Your Formspree integration already includes spam filtering (reCAPTCHA) to protect your inbox.

---

## 3. Long-Term Maintenance

To keep the website running smoothly for years, follow this maintenance schedule.

### Routine Updates (Quarterly)
*   **Update News:** Add new achievements, workshops, or publications to the `News` and `Resources` pages to keep the site alive.
*   **Check Links:** Verify that external links (to PubMed, LinkedIn, Partners) are still working.
*   **Dependency Audits:** Run `npm audit` in the project folder to check for security updates in the software libraries used (React, Tailwind, etc.).

### Backup Strategy
*   **Source Code:** Your code should be hosted on a version control system like **GitHub** or **GitLab**. This is your primary backup. If the hosting server crashes, you can redeploy the site from GitHub in minutes.
*   **Assets:** Keep a local backup of high-resolution images (team photos, event pictures) in a secure folder (e.g., Google Drive or OneDrive).

---

## 4. Domain Configuration (DNS)

Once you choose a host, you will need to update your domain's DNS records.

1.  **Log in** to your domain registrar (where you bought the `.om` domain).
2.  **Find DNS Settings** (sometimes called Zone File).
3.  **Add Records** provided by your host:
    *   **A Record:** Points `@` to the host's IP address.
    *   **CNAME Record:** Points `www` to the host's domain (e.g., `med-research.vercel.app`).

---

## Summary Recommendation

For **MedResearch Academy**, we recommend:
1.  **Host on Vercel or Netlify** for the best balance of speed, cost, and ease of use.
2.  **Keep the source code on GitHub** for safety and version history.
3.  **Use Formspree** for handling emails securely.
4.  **Review content every 3 months** to ensure accuracy.
