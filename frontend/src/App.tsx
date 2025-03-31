import './App.css'
import { Route, Routes, Navigate } from 'react-router-dom'
import SignIn from './modules/authentication/pages/SignIn.tsx'
import Dashboard from './modules/Application/pages/Dashboard.tsx'
import RequireAuth from './modules/Authentication/components/RequireAuth.tsx';

function App() {
    return (
        <Routes>
            <Route path="/signin" element={<SignIn />} />

            <Route
                path="/*"
                element={
                    <RequireAuth>
                        <Dashboard />
                    </RequireAuth>
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App
