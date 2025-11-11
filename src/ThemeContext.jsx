import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeContextProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        try {
            const savedMode = localStorage.getItem('themeMode');
            // Return 'dark' only if it's explicitly set, otherwise default to 'light'
            return savedMode === 'dark' ? 'dark' : 'light';
        } catch (error) {
            // If localStorage is unavailable (e.g., private browsing in some browsers)
            console.error("Could not access localStorage to get theme mode.", error);
            return 'light';
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem('themeMode', mode);
        } catch (error) {
            console.error("Could not access localStorage to set theme mode.", error);
        }
    }, [mode]);

    const themeToggle = useMemo(
        () => ({
            toggleTheme: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [],
    );

    return (
        <ThemeContext.Provider value={{ mode, ...themeToggle }}>{children}</ThemeContext.Provider>
    );
};