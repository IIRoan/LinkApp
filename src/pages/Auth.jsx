import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { Box, Flex, Heading, Text, Button, Card, TextField, Tabs, Separator } from '@radix-ui/themes'
import { EnvelopeClosedIcon, LockClosedIcon, GitHubLogoIcon, ChevronDownIcon, ChevronUpIcon, CodeIcon  } from '@radix-ui/react-icons'
import * as Collapsible from '@radix-ui/react-collapsible';
import LoadingSpinner from '../components/LoadingSpinner'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEmailPassword, setShowEmailPassword] = useState(false)
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/profile')
    } else {
      setLoading(false)
    }
  }, [user, navigate])

  async function handleSignIn(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await signIn({ email, password })
      if (error) throw error
      navigate('/profile')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await signUp({ email, password })
      if (error) throw error
      alert('Check your email for the confirmation link!')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGitHubSignIn() {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/profile`
        }
      })
      if (error) throw error
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGitLabSignIn() {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'gitlab',
        options: {
          redirectTo: `${window.location.origin}/profile`
        }
      })
      if (error) throw error
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  if (loading) return <LoadingSpinner message="Welcome!" />
  return (
    <Flex align="center" justify="center" style={{ minHeight: '80vh' }}>
    <Box p="4" style={{ maxWidth: '400px', margin: '0 auto'}}>
      <Card>
        <Heading size="8" mb="6">
          Welcome to <span style={{ color: 'var(--accent-9)' }}>LinkApp</span>
        </Heading>

        <Flex direction="column" gap="3">
          <Button
            onClick={handleGitHubSignIn}
            disabled={loading}
            variant="hard"
            style={{ width: '100%', cursor: 'pointer', }}
            
          >
            <GitHubLogoIcon mr="2" />
            {loading ? 'Signing In...' : 'Sign In with GitHub'}
          </Button>

          <Button
            onClick={handleGitLabSignIn}
            disabled={loading}
            variant="soft"
            style={{ width: '100%',  cursor: 'pointer', }}
          >
            <CodeIcon mr="2" />
            {loading ? 'Signing In...' : 'Sign In with GitLab'}
          </Button>
        </Flex>

        <Separator my="4" size="4" />

        <Collapsible.Root>
          <Collapsible.Trigger asChild>
            <Button variant="ghost" style={{ width: '100%',  cursor: 'pointer', }}>
              {showEmailPassword ? 'Hide' : 'Show'} Email/Password Login (not recommended)
              {showEmailPassword ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <Box mt="4">
              <Tabs.Root defaultValue="signin">
                <Tabs.List>
                  <Tabs.Trigger value="signin">Sign In</Tabs.Trigger>
                  <Tabs.Trigger value="signup">Sign Up</Tabs.Trigger>
                </Tabs.List>

                <Box mt="4">
                  <Tabs.Content value="signin">
                    <form onSubmit={handleSignIn}>
                      <Flex direction="column" gap="3">
                        <TextField.Root
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        >
                          <TextField.Slot>
                            <EnvelopeClosedIcon height="16" width="16" />
                          </TextField.Slot>
                        </TextField.Root>
                        <TextField.Root
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        >
                          <TextField.Slot>
                            <LockClosedIcon height="16" width="16" />
                          </TextField.Slot>
                        </TextField.Root>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                      </Flex>
                    </form>
                  </Tabs.Content>

                  <Tabs.Content value="signup">
                    <form onSubmit={handleSignUp}>
                      <Flex direction="column" gap="3">
                        <TextField.Root
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        >
                          <TextField.Slot>
                            <EnvelopeClosedIcon height="16" width="16" />
                          </TextField.Slot>
                        </TextField.Root>
                        <TextField.Root
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        >
                          <TextField.Slot>
                            <LockClosedIcon height="16" width="16" />
                          </TextField.Slot>
                        </TextField.Root>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Signing Up...' : 'Sign Up'}
                        </Button>
                      </Flex>
                    </form>
                  </Tabs.Content>
                </Box>
              </Tabs.Root>
            </Box>
          </Collapsible.Content>
        </Collapsible.Root>

        {error && (
          <Text color="red" size="2" weight="bold" mt="3">
            {error}
          </Text>
        )}
      </Card>
    </Box>
    </Flex>
  )
}
