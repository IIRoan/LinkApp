import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { Box, Flex, Heading, Text, TextField, TextArea, Button, Card, Container, Separator } from '@radix-ui/themes'
import { PlusIcon } from '@radix-ui/react-icons'

export default function CreatePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [slugError, setSlugError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  function slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  async function checkSlugExists(slug) {
    const { data, error } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', slug)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return !!data
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to create a page')
      return
    }
    setLoading(true)
    setError(null)
    setSlugError(null)
    try {
      const slug = slugify(title)
      const slugExists = await checkSlugExists(slug)

      if (slugExists) {
        setSlugError(`A page with the name "${slug}" already exists. Please choose a different title.`)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('pages')
        .insert({ 
          title, 
          description, 
          user_id: user.id,
          slug
        })
        .select()
      if (error) throw error
      setTitle('')
      setDescription('')
      navigate(`/${slug}`)  // Redirect to the new page
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Container size="2">
      <Flex justify="center" align="center" style={{ height: '80vh' }}>
        <Text size="3">Loading...</Text>
      </Flex>
    </Container>
  )

  if (!user) return (
    <Container size="2">
      <Flex justify="center" align="center" style={{ height: '80vh' }}>
        <Text size="3">Please log in to create a page</Text>
      </Flex>
    </Container>
  )

  return (
    <Flex 
      justify="center" 
      align="center" 
      style={{ 
        minHeight: '70vh', 
     }}
    >
      <Container size="1">
        <Card>
          <Flex direction="column" gap="4" p="4">
            <Heading size="6" align="center">Create Page</Heading>
            <Separator size="4" />
            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="4">
                <Box>
                  <Text as="label" size="2" mb="1" weight="bold">Title</Text>
                  <TextField.Root
                    placeholder="Enter page title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Box>
                <Box>
                  <Text as="label" size="2" mb="1" weight="bold">Description</Text>
                  <TextArea
                    placeholder="Enter page description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Box>
                {error && <Text color="red" size="2">{error}</Text>}
                {slugError && <Text color="red" size="2">{slugError}</Text>}
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : (
                    <Flex align="center" gap="2">
                      <PlusIcon />
                      Create Page
                    </Flex>
                  )}
                </Button>
              </Flex>
            </form>
          </Flex>
        </Card>
      </Container>
    </Flex>
  )
}