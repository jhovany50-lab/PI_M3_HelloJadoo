const PROFILE_KEY = "jadooUserProfile";

export function initWelcome() {
  const welcomeForm = document.getElementById("welcome-form");

  if (!welcomeForm) {
    return;
  }

  welcomeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedGender = welcomeForm.querySelector(
      'input[name="gender"]:checked'
    );

    const nameInput = document.getElementById("student-name");

    if (!selectedGender) {
      return;
    }

    const profile = {
      name: nameInput.value.trim(),
      gender: selectedGender.value
    };

    sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

    window.history.pushState({}, "", "/home");

    window.dispatchEvent(new PopStateEvent("popstate"));
  });
}

export function getUserProfile() {
  const savedProfile = sessionStorage.getItem(PROFILE_KEY);

  if (!savedProfile) {
    return null;
  }

  try {
    return JSON.parse(savedProfile);
  } catch (error) {
    console.error("No se pudo leer el perfil de Jadoo:", error);
    return null;
  }
}

export function applyUserTheme() {
  const profile = getUserProfile();

  if (!profile) {
    return;
  }

  document.body.classList.remove(
    "jadoo-theme-female",
    "jadoo-theme-male",
    "jadoo-theme-neutral"
  );

  const themeMap = {
    female: "jadoo-theme-female",
    male: "jadoo-theme-male",
    neutral: "jadoo-theme-neutral"
  };

  const selectedTheme = themeMap[profile.gender];

  if (selectedTheme) {
    document.body.classList.add(selectedTheme);
  }
}