# Sadman Muhtasim Portfolio

A lightweight personal portfolio built with HTML, CSS and JavaScript for free GitHub Pages hosting.

## Files

- `index.html` — website structure and content
- `style.css` — dark/light themes, responsive design and animations
- `script.js` — theme switching, menu, projects, particles, interactions
- `404.html` — GitHub Pages custom 404 page
- `assets/profile.png` — profile picture
- `assets/Sadman-Muhtasim-CV.pdf` — add your CV here later

## Add a project

Open `script.js` and find:

```js
const PROJECTS = [
  // Add real projects here later.
];
```

Paste:

```js
{
  title: "Project Name",
  description: "What the project does.",
  technologies: ["Python", "HTML", "CSS"],
  github: "https://github.com/FeralVortex/your-repo",
  live: "https://your-live-site.com"
}
```

Add a comma between project objects.

## Add the CV

Put your PDF inside the `assets` folder and name it:

`Sadman-Muhtasim-CV.pdf`

The Download CV button is already connected to that filename.

## Publish on GitHub Pages

1. Sign in to GitHub.
2. Create a new public repository named exactly `FeralVortex.github.io`.
3. Upload every file and folder from this project into that repository.
4. Commit the files.
5. Open repository **Settings → Pages**.
6. Under **Build and deployment**, select **Deploy from a branch**.
7. Choose branch **main** and folder **/(root)**, then save.
8. Your site should appear at `https://FeralVortex.github.io`.

Because the repository is named `<username>.github.io`, it becomes your main GitHub Pages website.
