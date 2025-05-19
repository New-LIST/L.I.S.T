import "./App.css";
import AppRoutes from "./modules/Application/components/AppRoutes.tsx";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from 'i18next-http-backend';

i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
        ns: ['common'],
        defaultNS: 'common',
        
        fallbackLng: localStorage.getItem('language') ?? 'sk',
        
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        
        interpolation: {
            escapeValue: false
        }
    });

function App() {
    return (
      <AppRoutes />
    );
}

export default App;
