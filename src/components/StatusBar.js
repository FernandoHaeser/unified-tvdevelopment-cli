import React from 'react';
import { Box, Text } from 'ink';
import { PLATFORM_META } from '../theme.js';

const SIDEBAR_HINTS = '↑↓ Navigate  ⏎ Select  p Platform  q Quit';
const SCREEN_HINTS  = 'Esc Back  q Quit';

export default function StatusBar({ sidebarFocused, platform }) {
  const meta  = platform ? PLATFORM_META[platform] : null;
  const width = (process.stdout.columns || 80) - 4;
  const hints = sidebarFocused ? SIDEBAR_HINTS : SCREEN_HINTS;

  return (
    <Box
      borderStyle="round"
      borderColor="gray"
      paddingX={1}
      width={process.stdout.columns || 80}
      justifyContent="space-between"
    >
      <Text dimColor>{hints}</Text>
      {meta && (
        <Text color={meta.color} dimColor>
          {meta.hint}
        </Text>
      )}
    </Box>
  );
}
