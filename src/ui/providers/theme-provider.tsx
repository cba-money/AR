import { createContext, useContext, useEffect, useState } from "react";

type Theme =
  | "light"
  | "dark"
  | "system";

const ThemeContext = createContext({
  theme: "system" as Theme,
  setTheme: (_theme: Theme) => {},
});


export function ThemeProvider({
  children,
  defaultTheme = "system"
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {

  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {

    const root =
      window.document.documentElement;

    root.classList.remove(
      "light",
      "dark"
    );

    if(theme === "system") {

      const system =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
        ? "dark"
        : "light";

      root.classList.add(system);

    } else {

      root.classList.add(theme);

    }

  },[theme]);


  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}


export const useTheme = () =>
  useContext(ThemeContext);