import React from 'react';
import { useLocalStorage } from 'react-use-storage';

export type GeneralContextType = {
  navOpen: boolean;
  setNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
  theme: string;
  isDarkTheme: boolean;
  toggleDarkTheme: () => void;
};

const GeneralContext = React.createContext<GeneralContextType>({} as any);

const defaultTheme = 'dark';

type Props = {
  children: React.ReactNode;
};

const GeneralContextProvider: React.FC<Props> = ({ children }) => {
  const [navOpen, setNavOpen] = React.useState<boolean>(false);
  const [theme, setTheme] = useLocalStorage('bb_theme', defaultTheme);

  React.useEffect(() => {
    if (theme) {
      document.body.setAttribute('data-theme', theme);
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [theme]);

  React.useEffect(() => {
    if (navOpen) {
      document.body.setAttribute('data-fixed', 'true');
    } else {
      document.body.removeAttribute('data-fixed');
    }
  }, [navOpen]);

  return (
    <GeneralContext.Provider
      value={{
        navOpen,
        setNavOpen,
        theme,
        isDarkTheme: theme === 'dark',
        toggleDarkTheme: () => {
          setTheme(theme === 'dark' ? 'light' : 'dark');
        },
      }}>
      {children}
    </GeneralContext.Provider>
  );
};

export default GeneralContextProvider;

export function useGeneral(): GeneralContextType {
  return React.useContext<GeneralContextType>(GeneralContext);
}
