/**
 * Modal state and project-data loading. State is created per controller so
 * multiple instances cannot leak selection or open/closed flags.
 */

export function createState(projects = []) {
  return {
    projects,
    currentProjectIndex: -1,
    currentImageIndex: 0,
    isModalOpen: false,
    isLightboxOpen: false,
    lastActiveElement: null,

    getCurrentProject() {
      if (this.currentProjectIndex >= 0 && this.currentProjectIndex < this.projects.length) {
        return this.projects[this.currentProjectIndex];
      }
      return null;
    }
  };
}

export function loadProjects(doc) {
  const dataScript = doc.getElementById('portfolio-projects-data');
  if (!dataScript || !dataScript.textContent) return [];

  try {
    const parsed = JSON.parse(dataScript.textContent);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse portfolio projects JSON data:', error);
    return [];
  }
}
