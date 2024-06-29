import React from 'react';
import { Link } from 'react-router-dom';
import { Flex, Heading, Text, Button } from '@radix-ui/themes';
import { HomeIcon } from '@radix-ui/react-icons';

function NotFound() {
  return (
    <Flex direction="column" align="center" justify="center" style={{ minHeight: '80vh' }}>
      <Heading size="9" mb="4">404</Heading>
      <Heading size="6" mb="2">Page Not Found</Heading>
      <Text size="3" mb="6">The page you're looking for doesn't exist or has been moved.</Text>
      <Button asChild>
        <Link to="/">
          <Flex align="center" gap="2">
            <HomeIcon />
            Go to Home
          </Flex>
        </Link>
      </Button>
    </Flex>
  );
}

export default NotFound;
