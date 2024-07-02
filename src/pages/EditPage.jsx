import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { Flex, Box, Text, Heading, TextField, TextArea, Button, Card, Avatar, Link, Separator, Theme, Dialog, ScrollArea, IconButton } from '@radix-ui/themes'
import { PlusIcon, Pencil1Icon, TrashIcon, Cross2Icon, ImageIcon } from '@radix-ui/react-icons'
import LoadingSpinner from '../components/LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'
import { containerVariants, itemVariants, buttonVariants } from '../utils/animationVariants'

const MotionCard = motion(Card)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)
const MotionDialogContent = motion(Dialog.Content)
const MotionDialogOverlay = motion(Dialog.Overlay)

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
}


export default function EditPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [links, setLinks] = useState([])
  const [newLink, setNewLink] = useState({ title: '', url: '', image: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false)
  const [editingLinkId, setEditingLinkId] = useState(null)
  const [editingLink, setEditingLink] = useState({ title: '', url: '' })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchPageAndUser() {
      setLoading(true)
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        setUser(user)

        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .single()

        if (pageError) throw pageError

        setPage(pageData)
        setTitle(pageData.title)
        setDescription(pageData.description)

        if (user.id !== pageData.user_id) {
          navigate(`/${slug}`)
          return
        }

        const { data: linksData, error: linksError } = await supabase
          .from('links')
          .select('*')
          .eq('page_id', pageData.id)
          .order('created_at', { ascending: true })

        if (linksError) throw linksError

        setLinks(linksData)
      } catch (error) {
        console.error('Error fetching page:', error)
        setError('Failed to load page. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchPageAndUser()
  }, [slug, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to edit this page')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: pageError } = await supabase
        .from('pages')
        .update({ title, description })
        .eq('id', page.id)
        .eq('user_id', user.id)

      if (pageError) throw pageError

      navigate(`/${slug}`)
    } catch (error) {
      console.error('Error updating page:', error)
      setError('Failed to update page. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      try {
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)

        if (urlError) throw urlError

        setNewLink({ ...newLink, image: publicUrl })
      } catch (error) {
        console.error('Error uploading image:', error)
        setError('Failed to upload image. Please try again.')
      }
    }
  }

  async function handleAddLink(e) {
    e.preventDefault()
    if (!newLink.title || !newLink.url) {
      setError('Both title and URL are required for a link')
      return
    }

    try {
      const { data, error } = await supabase
        .from('links')
        .insert({
          title: newLink.title,
          url: newLink.url,
          page_id: page.id,
          image_url: newLink.image,
        })
        .select()

      if (error) throw error

      setLinks([...links, data[0]])
      setNewLink({ title: '', url: '', image: null })
      setIsAddLinkModalOpen(false)
    } catch (error) {
      console.error('Error adding link:', error)
      setError('Failed to add link. Please try again.')
    }
  }

  async function handleRemoveLink(linkId) {
    try {
      const linkToRemove = links.find(link => link.id === linkId)

      if (!linkToRemove) {
        throw new Error('Link not found')
      }

      // Delete the image from storage if it exists
      if (linkToRemove.image_url) {
        const imagePath = linkToRemove.image_url.split('/').pop()
        const { error: deleteError } = await supabase.storage
          .from('images')
          .remove([imagePath])

        if (deleteError) {
          console.error('Error deleting image from storage:', deleteError)
        }
      }

      // Delete the link
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId)
        .eq('page_id', page.id)

      if (error) {
        throw error
      }

      setLinks(links.filter(link => link.id !== linkId))
      setError(null)
    } catch (error) {
      console.error('Error removing link:', error)
      setError(`Failed to remove link: ${error.message || 'Unknown error'}`)
    }
  }
  async function handleDeletePage() {
    setLoading(true)
    setError(null)

    try {
      // Delete all links associated with the page
      const { error: linksError } = await supabase
        .from('links')
        .delete()
        .eq('page_id', page.id)

      if (linksError) throw linksError

      // Delete the page
      const { error: pageError } = await supabase
        .from('pages')
        .delete()
        .eq('id', page.id)
        .eq('user_id', user.id)

      if (pageError) throw pageError

      navigate('/profile')
    } catch (error) {
      console.error('Error deleting page:', error)
      setError('Failed to delete page. Please try again.')
    } finally {
      setLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  async function handleEditLink(link) {
    setEditingLinkId(link.id)
    setEditingLink({ title: link.title, url: link.url, image_url: link.image_url })
  }

  async function handleUpdateLink(e) {
    e.preventDefault()
    if (!editingLink.title || !editingLink.url) {
      setError('Both title and URL are required for a link')
      return
    }

    try {
      const { data, error } = await supabase
        .from('links')
        .update({
          title: editingLink.title,
          url: editingLink.url,
          image_url: editingLink.image_url
        })
        .eq('id', editingLinkId)
        .select()

      if (error) throw error

      setLinks(links.map(link =>
        link.id === editingLinkId ? { ...link, ...data[0] } : link
      ))
      setEditingLinkId(null)
      setEditingLink({ title: '', url: '', image_url: '' })
    } catch (error) {
      console.error('Error updating link:', error)
      setError('Failed to update link. Please try again.')
    }
  }

  async function handleImageUpdate(e) {
    const file = e.target.files[0]
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      try {
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)

        if (urlError) throw urlError

        setEditingLink({ ...editingLink, image_url: publicUrl })
      } catch (error) {
        console.error('Error uploading image:', error)
        setError('Failed to upload image. Please try again.')
      }
    }
  }



  if (loading) return <LoadingSpinner message="Loading..." />
  if (error) return <div>Error: {error}</div>
  if (!page) return <div>Page not found</div>

return (
  <Flex justify="center" align="center" style={{ minHeight: '80vh', padding: '20px' }}>
    <MotionCard
      style={{ maxWidth: '600px', width: '100%' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box p="6">
        <MotionFlex justify="between" align="center" mb="4" variants={itemVariants}>
          <Heading size="8">Edit Page</Heading>
          <MotionButton
            onClick={() => navigate(`/${slug}`)}
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            Go Back
          </MotionButton>
        </MotionFlex>

        <motion.form onSubmit={handleSubmit} variants={itemVariants}>
          <Flex direction="column" gap="4">
            <motion.div variants={itemVariants}>
              <Text as="label" size="2" weight="bold" mb="1">
                Title
              </Text>
              <TextField.Root
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter page title"
                required
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Text as="label" size="2" weight="bold" mb="1">
                Description
              </Text>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter page description"
                required
              />
            </motion.div>
            <MotionButton
              type="submit"
              disabled={loading}
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </MotionButton>
          </Flex>
        </motion.form>

        <Separator my="6" size="4" />

        <MotionFlex justify="between" align="center" mb="4" variants={itemVariants}>
          <Heading size="6">Links</Heading>
          <MotionButton
            onClick={() => setIsAddLinkModalOpen(true)}
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            <PlusIcon /> Add Link
          </MotionButton>
        </MotionFlex>

        <AnimatePresence>
          {links.map(link => (
            <MotionCard key={link.id} variants={itemVariants} layout>
              <Flex align="center" justify="between" p="3">
                <Flex align="center" gap="3">
                  <Avatar
                    src={link.image_url}
                    fallback={link.title[0]}
                    size="3"
                  />
                  <Link href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.title}
                  </Link>
                </Flex>
                <Flex gap="2">
                  <MotionButton
                    variant="soft"
                    onClick={() => handleEditLink(link)}
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                  >
                    <Pencil1Icon /> Edit
                  </MotionButton>
                  <MotionButton
                    variant="soft"
                    color="red"
                    onClick={() => handleRemoveLink(link.id)}
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                  >
                    Remove
                  </MotionButton>
                </Flex>
              </Flex>
              <AnimatePresence>
                {editingLinkId === link.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Box mt="3" p="3">
                      <form onSubmit={handleUpdateLink}>
                        <Flex direction="column" gap="3">
                          <TextField.Root
                            placeholder="Link Title"
                            value={editingLink.title}
                            onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                            required
                          />
                          <TextField.Root
                            placeholder="Link URL"
                            type="url"
                            value={editingLink.url}
                            onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                            required
                          />
                          <Flex align="center" gap="3">
                            <Button asChild variant="soft">
                              <label htmlFor={`image-upload-${link.id}`}>Change Image</label>
                            </Button>
                            <input
                              id={`image-upload-${link.id}`}
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpdate}
                              style={{ display: 'none' }}
                            />
                            {editingLink.image_url && (
                              <Avatar
                                src={editingLink.image_url}
                                fallback={editingLink.title[0]}
                                size="3"
                              />
                            )}
                          </Flex>
                          <MotionButton
                            type="submit"
                            whileHover="hover"
                            whileTap="tap"
                            variants={buttonVariants}
                          >
                            Update Link
                          </MotionButton>
                        </Flex>
                      </form>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </MotionCard>
          ))}
        </AnimatePresence>
      </Box>
      <Flex justify="center" mt="4" mb="4">
        <MotionButton
          color="red"
          variant="soft"
          onClick={() => setIsDeleteDialogOpen(true)}
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
        >
          <TrashIcon /> Delete Page
        </MotionButton>
      </Flex>
    </MotionCard>

      <Dialog.Root open={isAddLinkModalOpen} onOpenChange={setIsAddLinkModalOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Add New Link</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Fill in the details to add a new link to your page.
          </Dialog.Description>
          <form onSubmit={handleAddLink}>
            <Flex direction="column" gap="4">
              <TextField.Root
                placeholder="Link Title"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                required
              />
              <TextField.Root
                placeholder="Link URL"
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                required
              />
              <Flex align="center" gap="3">
                <Button asChild variant="soft">
                  <label htmlFor="image-upload">
                    <Flex align="center" gap="2">
                      <ImageIcon />
                      Upload Image
                    </Flex>
                  </label>
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                {newLink.image && (
                  <Flex align="center" gap="2">
                    <Avatar
                      src={newLink.image}
                      fallback={newLink.title[0]}
                      size="3"
                    />
                    <IconButton
                      size="1"
                      variant="ghost"
                      color="gray"
                      onClick={() => setNewLink({ ...newLink, image: null })}
                    >
                      <Cross2Icon />
                    </IconButton>
                  </Flex>
                )}
              </Flex>
            </Flex>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit">Add Link</Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AnimatePresence>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Confirm Page Deletion</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to delete this page? This action cannot be undone.
          </Dialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button color="red" onClick={handleDeletePage}>
              Delete Page
            </Button>
          </Flex>
        </Dialog.Content>
        </AnimatePresence>
      </Dialog.Root>
    </Flex>
  );
}