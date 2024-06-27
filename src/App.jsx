import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import CreatePage from './pages/CreatePage'
import DisplayPage from './pages/DisplayPage'
import EditPage from './pages/EditPage'
import '@radix-ui/themes/styles.css';
import { Theme, Flex, Switch, Box, Avatar, DropdownMenu, Select } from '@radix-ui/themes';
import { MoonIcon, SunIcon, PersonIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import './theme-override.css';

const accentColors = [
  'red', 'crimson', 'violet',
  'blue', 'cyan', 'teal', 'mint',
  'lime', 'amber'
];

function ColorSwatch({ color }) {
  return (
    <div
      style={{
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: `var(--${color}-9)`,
        marginRight: '8px',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  );
}

function AppContent({ isDarkMode, toggleDarkMode, accentColor, setAccentColor }) {
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
          <Flex align="center" gap="4">
            <Select.Root value={accentColor} onValueChange={setAccentColor}>
              <Select.Trigger>
                <Flex align="center" gap="1">
                  <ColorSwatch color={accentColor} />
                  <span style={{ textTransform: 'capitalize' }}>{accentColor}</span>
                </Flex>
              </Select.Trigger>
              <Select.Content>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                  padding: '6px'
                }}>
                  {accentColors.map((color) => (
                    <Select.Item key={color} value={color}>
                      <Flex align="center">
                        <ColorSwatch color={color} />
                        <span style={{ textTransform: 'capitalize' }}>{color}</span>
                      </Flex>
                    </Select.Item>
                  ))}</div>
              </Select.Content>
            </Select.Root>
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('accentColor') || 'teal';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      const newDarkMode = e.matches;
      setIsDarkMode(newDarkMode);
      localStorage.setItem('isDarkMode', JSON.stringify(newDarkMode));
    };

    if (localStorage.getItem('isDarkMode') === null) {
      handleChange(mediaQuery);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <Theme
      accentColor={accentColor}
      grayColor="slate"
      scaling="100%"
      radius="full"
      appearance={isDarkMode ? 'dark' : 'light'}
      hasBackground={true}
    >
      <AuthProvider>
        <AppContent
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
        />
      </AuthProvider>
    </Theme>
  )
}

export default App
