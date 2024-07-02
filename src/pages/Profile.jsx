import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../utils/supabaseClient'
import { Box, Flex, Heading, Text, Button, Card, Avatar, Separator, TextField, AlertDialog, Tooltip } from '@radix-ui/themes'
import { PersonIcon, EnvelopeClosedIcon, ExitIcon, UpdateIcon, PlusIcon, Link2Icon } from '@radix-ui/react-icons'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'
import { containerVariants, itemVariants } from '../utils/animationVariants';

const MotionCard = motion(Card)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)

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
      setError(null)

      let emailUpdated = false;

      // Only update email if it has changed
      if (email !== user.email) {
        const { error: updateError } = await supabase.auth.updateUser({
          email: email
        })

        if (updateError) throw updateError
        emailUpdated = true;
      }

      // Update avatar if changed
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

      // Set email sent message only if email was updated
      if (emailUpdated) {
        setEmailSent(true)
      } else {
        setError("Profile updated successfully!")
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



  if (loading) return <LoadingSpinner message="Loading..." />

  return (
    <Flex align="center" justify="center" style={{ minHeight: '75vh' }}>
      <Box p="4" style={{ width: '100%', maxWidth: '400px' }}>
        <MotionCard variants={containerVariants} initial="hidden" animate="visible">
          <form onSubmit={updateProfile}>
            <MotionFlex direction="column" gap="2" variants={itemVariants}>
              <MotionFlex justify="center" mb="4" variants={itemVariants}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAvatarClick}
                  style={{ cursor: 'pointer' }}
                >
                  <Avatar
                    size="8"
                    src={avatar_url || user.user_metadata?.avatar_url || undefined}
                    fallback={<PersonIcon width="32" height="32" />}
                    radius="full"
                    style={{ border: '2px solid var(--accent-9)' }}
                  />
                </motion.div>
              </MotionFlex>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
  
              <Separator size="4" />
  
              <motion.div variants={itemVariants}>
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
              </motion.div>
  
              <AnimatePresence>
                {emailSent && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Text color="green" size="2" weight="bold">
                      An email has been sent to your new address
                    </Text>
                  </motion.div>
                )}
  
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Text color="red" size="2" weight="bold">
                      {error}
                    </Text>
                  </motion.div>
                )}
              </AnimatePresence>
  
              <MotionFlex justify="between" mt="4" variants={itemVariants}>
                <MotionButton
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? <UpdateIcon /> : 'Save changes'}
                </MotionButton>
                <AlertDialog.Root>
                  <AlertDialog.Trigger>
                    <MotionButton
                      color="red"
                      variant="soft"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ExitIcon />
                      Sign Out
                    </MotionButton>
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
              </MotionFlex>
            </MotionFlex>
          </form>
        </MotionCard>
        <Separator size="4" my="4" />
  
        <MotionCard variants={containerVariants} initial="hidden" animate="visible">
          <MotionFlex justify="between" align="center" mb="2" variants={itemVariants}>
            <Heading size="6">Your Pages</Heading>
            <MotionButton
              onClick={handleCreatePage}
              size="1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusIcon />
              Create Page
            </MotionButton>
          </MotionFlex>
          {userPages.length > 0 ? (
            <motion.ul style={{ listStyle: 'none', padding: 0 }}>
              {userPages.map((page, index) => (
                <motion.li
                  key={index}
                  style={{ marginBottom: '8px' }}
                  variants={itemVariants}
                >
                  <Flex align="center" justify="between">
                    <Flex align="center">
                      <Link2Icon style={{ marginRight: '8px' }} />
                      <Text>{page.slug}</Text>
                    </Flex>
                    <MotionButton
                      onClick={() => handleGoToPage(page.slug)}
                      size="1"
                      variant="soft"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Go to Page
                    </MotionButton>
                  </Flex>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <Text>You haven't created any pages yet.</Text>
          )}
        </MotionCard>
      </Box>
    </Flex>
  )
}