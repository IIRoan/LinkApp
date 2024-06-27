import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import CreatePage from './pages/CreatePage'
import DisplayPage from './pages/DisplayPage'
import EditPage from './pages/EditPage'
import '@radix-ui/themes/styles.css';
import { Theme, Flex, Switch, Box, Avatar, DropdownMenu } from '@radix-ui/themes';
import { MoonIcon, SunIcon, PersonIcon } from '@radix-ui/react-icons';
import './theme-override.css';

function AppContent({ isDarkMode, toggleDarkMode }) {
  const { user, signOut } = useAuth();

  return (
    <Box style={{ minHeight: '100vh', width: '100%' }}>
      <Router>
        <Flex 
          justify="between" 
          align="center" 
          px="5" 
          py="4" 
          style={{ position: 'fixed', top: 0, right: 0, left: 0, zIndex: 1000 }}
        >
          <Box>
            {user && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Box style={{ cursor: 'pointer' }}>
                    <Avatar
                      size="2"
                      src={user.user_metadata?.avatar_url}
                      fallback={<PersonIcon width="24" height="24" />}
                    />
                  </Box>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item>
                    <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                      Profile
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item>
                    <Link to="/create-page" style={{ textDecoration: 'none', color: 'inherit' }}>
                      Create Page
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item color="red" onClick={signOut}>
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            )}
          </Box>
          <Flex align="center" gap="2">
            <SunIcon />
            <Switch 
              checked={isDarkMode} 
              onCheckedChange={toggleDarkMode}
              size="3"
            />
            <MoonIcon />
          </Flex>
        </Flex>
        <Box pt="6">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-page" element={<CreatePage />} />
            <Route path="/:slug/edit" element={<EditPage />} />
            <Route path="/:slug" element={<DisplayPage />} />
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Box>
      </Router>
    </Box>
  )
}


function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handler = (event) => setIsDarkMode(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Theme 
      accentColor="teal"
      grayColor="slate"
      scaling="100%"
      radius="full"
      appearance={isDarkMode ? 'dark' : 'light'}
      hasBackground={true}
    >
      <AuthProvider>
        <AppContent isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </AuthProvider>
    </Theme>
  )
}

export default App
