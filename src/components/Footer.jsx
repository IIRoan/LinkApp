import React from 'react';
import { Box, Flex, Text, Link } from '@radix-ui/themes';
import { GitHubLogoIcon } from '@radix-ui/react-icons';

const Footer = () => {
  return (
    <Box 
      as="footer" 
      py="4" 
      px="4" 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-background)',
        zIndex: 1000
      }}
    >
      <Flex justify="between" align="center">
        <Text size="2" color="gray">
          © {new Date().getFullYear()} IRoan. All rights reserved.
        </Text>
        <Flex gap="4">
          <Link href="https://github.com/IIRoan/linkapp" target="_blank" rel="noopener noreferrer">
            <GitHubLogoIcon width="20" height="20" />
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Footer;
