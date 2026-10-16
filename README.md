# Aadithya Vikram — Portfolio

A responsive, dependency-free portfolio built with HTML, CSS, and JavaScript for GitHub Pages.

Features: persistent light/dark themes, system theme detection, project filters, expandable project descriptions, searchable certifications, email copying, active navigation, reduced-motion support, and print styles.

## Preview locally

Run `python -m http.server 8000` in this directory, then open http://localhost:8000. Use a local server so certificate JSON can load.

## Deploy to GitHub Pages

1. Commit and push the files to the `main` branch of `AadithyaVikram/AadithyaVikram.github.io`.
2. Open the repository's **Settings → Pages**.
3. Select **Deploy from a branch**, choose **main** and **/ (root)**, then save.
4. After GitHub completes deployment, visit https://aadithyavikram.github.io/.

No package install, build step, API keys, or backend required. All site paths are relative, so project subdirectory hosting works too.

## Update content

- `index.html`: bio, projects, experience, education, social links, and contact details.
- `assets/certificates.json`: certificate titles and original links.
- `css/styles.css`: theme colors and responsive styles.
- `js/scripts.js`: interactive behavior. The copy-email action reads the address directly from the contact link in `index.html`.

The original `resume.html` and `projects.html` URLs redirect visitors to the matching new sections. The old certificate anchor is supported. The two publications listed on LinkedIn are included with Springer and DOI links.

Original source pages are retained under `assets/*-original.html` for content reference; these are archives, not functional versions of the old site. The EPAM role and start date were confirmed by the portfolio owner.

Google Fonts enhances typography; system fonts provide a fallback if unavailable.

## Content sources (updated October 16, 2026)

The public profile at https://in.linkedin.com/in/aadithya-vikram matches the name, college, dates, and both projects in the original portfolio. It lists EPAM Systems in Hyderabad, an 8.87 CGPA, certifications, and both publications. The owner confirmed: Data Engineer at EPAM Systems since June 2024. The supplied older LinkedIn URL remains in the social links.

- https://in.linkedin.com/in/aadithya-vikram
- https://link.springer.com/book/10.1007/978-981-95-0269-1?page=8
- https://doi.org/10.1109/ASSIC60049.2024.10507915

New certifications link to LinkedIn because individual credential URLs were not exposed. Google Cloud career readiness is a program completion; it is not presented as the separate professional Associate Cloud Engineer certification. Claude certification is listed in public profile activity. EPAM duties and other hidden experience have not been inferred. GreenWatch's precise publication date is omitted because LinkedIn and the proceedings metadata differ.
