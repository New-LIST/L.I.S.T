import './App.css'
import { useNotification } from './context/NotificationContext'
import { Button, Stack } from '@mui/material'
import Categories from './pages/Categories';

function App() {
    const { showNotification } = useNotification()

    return (<><Categories />


        <div style={{ padding: '2rem' }}>
            <h1>Hey L.I.S.T</h1>
            <Stack spacing={2} direction="column" maxWidth="300px">
                <Button
                    variant="contained"
                    color="success"
                    onClick={() => showNotification('Success notification', 'success')}
                >
                    Success Notification
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => showNotification('Error notification', 'error')}
                >
                    Error Notification
                </Button>
                <Button
                    variant="contained"
                    color="warning"
                    onClick={() => showNotification('Upozornenie', 'warning')}
                >
                    Warning Notification
                </Button>
                <Button
                    variant="contained"
                    color="info"
                    onClick={() => showNotification('Info notification', 'info')}
                >
                    Info Notification
                </Button>
            </Stack>
        </div>
        </>
    )
}

export default App
