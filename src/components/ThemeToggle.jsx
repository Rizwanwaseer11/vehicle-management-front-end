import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  // --- Load Theme on Mount (same logic as your script) ---
  useEffect(() => {
    const html = document.documentElement;
    const saved = localStorage.getItem("hs_theme");

    let finalTheme = "light";

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (saved === "dark" || (saved === "auto" && prefersDark)) {
      finalTheme = "dark";
    }

    setTheme(finalTheme);
    html.classList.toggle("dark", finalTheme === "dark");
  }, []);

  // --- Toggle Theme Handler ---
  const toggleTheme = () => {
    const html = document.documentElement;

    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    // update DOM
    html.classList.toggle("dark", newTheme === "dark");

    // persist
    localStorage.setItem("hs_theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="font-medium text-gray-800 rounded-full hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 
                 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
    >
      <span className="group inline-flex shrink-0 justify-center items-center size-9">

        {/* 🌑 Dark Mode Icon */}
        {theme !== "dark" && (
          <svg
            className="shrink-0 size-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}

        {/* ☀ Light Mode Icon */}
        {theme === "dark" && (
          <svg
            className="shrink-0 size-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        )}
      </span>
    </button>
  );
}

