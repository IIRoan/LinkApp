import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../utils/supabaseClient'
import { Box, Flex, Heading, Text, Button, Card, Avatar, Separator, TextField, AlertDialog, Tooltip } from '@radix-ui/themes'
import { PersonIcon, EnvelopeClosedIcon, ExitIcon, UpdateIcon, PlusIcon, LockClosedIcon, Link2Icon } from '@radix-ui/react-icons'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [avatar_url, setAvatarUrl] = useState('')
  const [error, setError] = useState(null)
  const [userPages, setUserPages] = useState([])
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [emailSent, setEmailSent] = useState(false)


  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
      getProfilePicture()
      getUserPages()
    } else {
      navigate('/auth')
    }
  }, [user, navigate])

  async function getProfilePicture() {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('image_url')
        .eq('user_id', user.id)
        .single()


      if (data) {
        setAvatarUrl(data.image_url)
      }
    } catch (error) {
      console.error('Error loading profile picture:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile(e) {
    e.preventDefault()
    try {
      setLoading(true)
      setEmailSent(false)
      const { error: updateError } = await supabase.auth.updateUser({
        email: email
      })

      if (updateError) throw updateError

      setEmailSent(true)

      if (avatar_url && avatar_url.startsWith('data:image')) {
        const file = await dataURLtoFile(avatar_url, 'avatar.png')
        const filePath = `images/${user.id}/${Date.now()}.png`

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)

        if (urlError) throw urlError

        const { error: avatarError } = await supabase
          .from('images')
          .upsert(
            {
              user_id: user.id,
              image_url: publicUrl
            },
            {
              onConflict: 'user_id'
            }
          )

        if (avatarError) throw avatarError

        setAvatarUrl(publicUrl)
      }

    } catch (error) {
      console.error('Error updating profile:', error.message)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function getUserPages() {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('slug')
        .eq('user_id', user.id)

      if (error) throw error

      setUserPages(data)
    } catch (error) {
      console.error('Error fetching user pages:', error.message)
      setError('Failed to fetch user pages')
    }
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64String = event.target.result
        setAvatarUrl(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleAvatarClick() {
    fileInputRef.current.click()
  }

  async function dataURLtoFile(dataurl, filename) {
    const res = await fetch(dataurl)
    const blob = await res.blob()
    return new File([blob], filename, { type: 'image/png' })
  }

  function handleSignOut() {
    signOut()
    navigate('/auth')
  }

  function handleCreatePage() {
    navigate('/create-page')
  }

  function handleGoToPage(slug) {
    navigate(`/${slug}`)
  }


  if (loading) return <Box p="4">Loading...</Box>

  return (
    <Flex align="center" justify="center" style={{ minHeight: '75vh' }}>
      <Box p="4" style={{ width: '100%', maxWidth: '400px' }}>
        <Card>
          <form onSubmit={updateProfile}>
            <Flex direction="column" gap="2">
              <Flex justify="center" mb="4">
                <Box
                  onClick={handleAvatarClick}
                  style={{
                    cursor: 'pointer',
                    display: 'inline-block',
                  }}
                >
                  <Avatar
                    size="8"
                    src={avatar_url || user.user_metadata?.avatar_url || undefined}
                    fallback={<PersonIcon width="32" height="32" />}
                    radius="full"
                    style={{
                      border: '2px solid var(--accent-9)',
                    }}
                  />

                </Box>
              </Flex>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />

              <Separator size="4" />

              <TextField.Root
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              >
                <TextField.Slot>
                  <EnvelopeClosedIcon height="16" width="16" />
                </TextField.Slot>
              </TextField.Root>

              {emailSent && (
                <Text color="green" size="2" weight="bold">
                  An email has been sent to your new address
                </Text>
              )}

              {error && (
                <Text color="red" size="2" weight="bold">
                  {error}
                </Text>
              )}

              <Flex justify="between" mt="4">
                <Button type="submit" disabled={loading}>
                  {loading ? <UpdateIcon /> : 'Save changes'}
                </Button>
                <AlertDialog.Root>
                  <AlertDialog.Trigger>
                    <Button color="red" variant="soft">
                      <ExitIcon />
                      Sign Out
                    </Button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Content>
                    <AlertDialog.Title>Confirm Sign Out</AlertDialog.Title>
                    <AlertDialog.Description>
                      Are you sure you want to sign out? You'll need to sign in again to access your account.
                    </AlertDialog.Description>
                    <Flex gap="3" mt="4" justify="end">
                      <AlertDialog.Cancel>
                        <Button variant="soft" color="gray">
                          Cancel
                        </Button>
                      </AlertDialog.Cancel>
                      <AlertDialog.Action>
                        <Button variant="solid" color="red" onClick={handleSignOut}>
                          Sign Out
                        </Button>
                      </AlertDialog.Action>
                    </Flex>
                  </AlertDialog.Content>
                </AlertDialog.Root>
              </Flex>
            </Flex>
          </form>
        </Card>
        <Separator size="4" my="4" />

        <Card>
          <Flex justify="between" align="center" mb="2">
            <Heading size="6">Your Pages</Heading>
            <Button onClick={handleCreatePage} size="1">
              <PlusIcon />
              Create Page
            </Button>
          </Flex>
          {userPages.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {userPages.map((page, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  <Flex align="center" justify="between">
                    <Flex align="center">
                      <Link2Icon style={{ marginRight: '8px' }} />
                      <Text>{page.slug}</Text>
                    </Flex>
                    <Button onClick={() => handleGoToPage(page.slug)} size="1" variant="soft">
                      Go to Page
                    </Button>
                  </Flex>
                </li>
              ))}
            </ul>
          ) : (
            <Text>You haven't created any pages yet.</Text>
          )}
        </Card>
      </Box>
    </Flex>

  )
}
