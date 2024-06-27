import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { Flex, Box, Text, Heading, TextField, TextArea, Button, Card, Avatar, Link, Separator, Theme, Dialog, ScrollArea } from '@radix-ui/themes'
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'

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



  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!page) return <div>Page not found</div>
  return (
    <Flex justify="center" align="center" style={{ minHeight: '100vh', padding: '20px' }}>
      <Card style={{ maxWidth: '800px', width: '100%', height: '100%' }}>
        <Box p="4">
          <Heading size="8" mb="4">Edit Page</Heading>
          <Button onClick={() => navigate(`/${slug}`)} mb="4">Go Back</Button>

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4">
              <Box>
                <Text as="label" htmlFor="title" size="2" weight="bold">Title:</Text>
                <TextField.Root
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Box>
              <Box>
                <Text as="label" htmlFor="description" size="2" weight="bold">Description:</Text>
                <TextArea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Box>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Save Changes'}
              </Button>
            </Flex>
          </form>


          <Separator my="6" size="4" />

          <Flex justify="between" align="center" mb="4">
            <Heading size="6">Links</Heading>
            <Button onClick={() => setIsAddLinkModalOpen(true)}>
              <PlusIcon /> Add Link
            </Button>
          </Flex>

          <Flex direction="column" gap="3">
            {links.map(link => (
              <Card key={link.id}>
                <Flex align="center" justify="between">
                  <Flex align="center" gap="3">
                    <Avatar
                      src={link.image_url}
                      fallback={link.title[0]}
                      size="3"
                    />
                    <Link href={link.url} target="_blank" rel="noopener noreferrer">{link.title}</Link>
                  </Flex>
                  <Flex gap="2">
                    <Button onClick={() => handleEditLink(link)}>
                      <Pencil1Icon /> Edit
                    </Button>
                    <Button color="red" onClick={() => handleRemoveLink(link.id)}>Remove</Button>
                  </Flex>
                </Flex>
                {editingLinkId === link.id && (
                  <Box mt="2">
                    <form onSubmit={handleUpdateLink}>
                      <Flex direction="column" gap="2">
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
                        <Box>
                          <Button asChild>
                            <label htmlFor={`image-upload-${link.id}`}>Change Image</label>
                          </Button>
                          <input
                            id={`image-upload-${link.id}`}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpdate}
                            style={{ display: 'none' }}
                          />
                        </Box>
                        {editingLink.image_url && (
                          <Avatar
                            src={editingLink.image_url}
                            fallback={editingLink.title[0]}
                            size="5"
                          />
                        )}
                        <Button type="submit">Update Link</Button>
                      </Flex>
                    </form>
                  </Box>
                )}
              </Card>
            ))}
          </Flex>
        </Box>
        <Flex justify="center" mt="4" style={{ width: '100%' }}>
          <Button
            color="red"
            variant="soft"
            onClick={() => setIsDeleteDialogOpen(true)}
            style={{ width: '200px' }}
          >
            <TrashIcon /> Delete Page
          </Button>
        </Flex>

      </Card>


      <Dialog.Root open={isAddLinkModalOpen} onOpenChange={setIsAddLinkModalOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Add New Link</Dialog.Title>
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
              <Box>
                <Button asChild>
                  <label htmlFor="image-upload">Upload Image</label>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
              </Box>
              {newLink.image && (
                <Avatar
                  src={newLink.image}
                  fallback={newLink.title[0]}
                  size="5"
                />
              )}
              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button type="submit">Add Link</Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
      </Dialog.Root>


    </Flex>
  )

}