# Deployment Guide for Omani Hosting Providers

This guide will help you deploy your professional medical researcher website to a local hosting provider in Oman.

## 1. Prepare Your Website for Hosting

Before uploading to a hosting provider, you need to generate the production files.

1.  **Open the Terminal** in your project.
2.  **Run the build command**:
    ```bash
    pnpm build
    ```
3.  This will create a **`dist`** folder in your project directory. This folder contains all the optimized files (HTML, CSS, JavaScript, Images) ready for the web.

## 2. Choose a Hosting Provider in Oman

Based on your requirement for local hosting, here are the top recommended providers:

### **Option A: Oman Data Park (ODP)**
*   **Best for:** High security, data sovereignty, and enterprise-grade reliability.
*   **Website:** [omandatapark.om](https://www.omandatapark.om/)
*   **Service to look for:** "Web Hosting" or "Cloud Hosting" (Linux/Shared Hosting is sufficient for this site).

### **Option B: Ooredoo Oman / Omantel**
*   **Best for:** Integrated business services if you already use their internet/telecom services.
*   **Website:** [ooredoo.om](https://www.ooredoo.om/en/business/ict/cloud-services/) or [omantel.om](https://www.omantel.om/)
*   **Service to look for:** "Business Web Hosting" or "Domain Name Registration".

### **Option C: CloudAcropolis**
*   **Best for:** Local cloud infrastructure with a focus on data location in Oman.
*   **Website:** [cloudacropolis.com](https://cloudacropolis.com/)

## 3. Uploading Your Website

Once you have purchased a hosting plan and domain (e.g., `dralalawi.om`), you will typically receive access to a **Control Panel** (like cPanel or Plesk) or **FTP credentials**.

### **Method 1: Using File Manager (cPanel/Plesk)**
1.  Log in to your hosting Control Panel.
2.  Navigate to **File Manager**.
3.  Go to the `public_html` or `www` folder.
4.  **Upload** all the files from inside your local **`dist`** folder.
    *   *Note: Upload the **contents** of the `dist` folder, not the folder itself.*
5.  Your website should now be live!

### **Method 2: Using FTP (FileZilla)**
1.  Download an FTP client like [FileZilla](https://filezilla-project.org/).
2.  Enter the **Host**, **Username**, and **Password** provided by your hosting company.
3.  Connect and navigate to the remote `public_html` folder.
4.  Drag and drop all files from your local **`dist`** folder to the server.

## 4. Domain Name Registration (.om)

If you haven't registered your domain yet:
*   You can register `.om` domains directly through the **TRA (Telecommunications Regulatory Authority)** accredited registrars like Oman Data Park or Ooredoo.
*   Ensure you have your **Civil ID** or **Commercial Registration (CR)** handy, as it is often required for `.om` domains.

## 5. Support

If you encounter issues during upload, contact your hosting provider's support team and mention that you are uploading a **"Static HTML/React Website"**.
