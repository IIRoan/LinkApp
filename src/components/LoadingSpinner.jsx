// src/components/LoadingSpinner.jsx

import React from 'react';
import { Box, Flex, Text } from '@radix-ui/themes';
import { ReloadIcon } from '@radix-ui/react-icons';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      style={{
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: 'var(--color-background)',
        zIndex: 9999,
      }}
    >
      <Box
        style={{
          animation: 'spin 1s linear infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ReloadIcon width="40" height="40" style={{ color: 'var(--accent-9)' }} />
      </Box>
      <Text size="3" weight="bold" mt="4">
        {message}
      </Text>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Flex>
  );
}
