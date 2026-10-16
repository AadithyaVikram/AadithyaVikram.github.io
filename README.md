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

## Animated hero and LinkedIn activity

The hero uses CSS orbit and floating animations plus small mouse parallax. It includes a pause/resume control, respects the system reduced-motion preference, and pauses while the browser tab is hidden. It runs directly on GitHub Pages without a backend.

`assets/linkedin-updates.json` holds curated achievements and optionally synchronized public posts. The page includes static achievement cards as a fallback if JavaScript or the data request fails. Reviewed dates and API sync dates are shown separately; the page does not claim to be a live feed. Edit both the JSON highlights and fallback HTML cards when manually changing achievements.

Achievements reviewed October 16, 2026: Q1 India Performance Champion, EPAM recognition badges, and the Claude credential. The award/badge posts are attributed to Aadithya in public LinkedIn activity at https://in.linkedin.com/in/aryan-vedy. Exact dates and post permalinks were not exposed, so the cards link to your activity page. No award year, badge names, or performance metrics are inferred.

### Optional scheduled updates (requires setup)

Direct browser access to private LinkedIn data is not used. The official Posts API restricts `r_member_social` to approved applications: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api. Installing a ChatGPT plugin does not supply credentials to GitHub Actions.

The included workflow is **not connected yet**. For an approved LinkedIn application:

1. Obtain a member access token with approved `r_member_social` access and the matching member author URN. Basic LinkedIn sign-in or `w_member_social` alone does not permit reading posts.
2. In GitHub **Settings → Secrets and variables → Actions**, add repository secrets `LINKEDIN_ACCESS_TOKEN` and `LINKEDIN_AUTHOR_URN` (format `urn:li:person:...`). Never put tokens in site files or chat.
3. Add repository variable `LINKEDIN_API_VERSION` with a currently supported `YYYYMM` version from the official documentation. Maintain this value as API versions retire and renew the token when it expires.
4. Enable Actions and, under **Settings → Actions → General → Workflow permissions**, allow GitHub Actions to create pull requests.
5. Run **Actions → Review LinkedIn updates → Run workflow**. It also runs Mondays at 09:00 India time once pushed to the default branch. Without credentials it skips the API call and leaves existing content intact.
6. Review and merge the generated content PR to publish through your existing GitHub Pages setup. Changes are not automatically merged. The workflow only modifies public posts; it does not rewrite achievements, biography, employment, or certificates from unverified text.

Only public, published posts authored by the configured member are included. Reshares are excluded; empty or failed responses preserve existing content. No dependencies need to be installed. Run `python -m unittest discover -s tests` for the sync checks.

Without approved API access, the curated highlights and the link to your LinkedIn activity still work. Update the JSON manually as you post new milestones; automatic LinkedIn synchronization is unavailable until the connection is configured.

## Content sources (updated October 16, 2026)

The public profile at https://in.linkedin.com/in/aadithya-vikram matches the name, college, dates, and both projects in the original portfolio. It lists EPAM Systems in Hyderabad, an 8.87 CGPA, certifications, and both publications. The owner confirmed: Data Engineer at EPAM Systems since June 2024. The supplied older LinkedIn URL remains in the social links.

- https://in.linkedin.com/in/aadithya-vikram
- https://link.springer.com/book/10.1007/978-981-95-0269-1?page=8
- https://doi.org/10.1109/ASSIC60049.2024.10507915

New certifications link to LinkedIn because individual credential URLs were not exposed. Google Cloud career readiness is a program completion; it is not presented as the separate professional Associate Cloud Engineer certification. Claude certification is listed in public profile activity. EPAM duties and other hidden experience have not been inferred. GreenWatch's precise publication date is omitted because LinkedIn and the proceedings metadata differ.
