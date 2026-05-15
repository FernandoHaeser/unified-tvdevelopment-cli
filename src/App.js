import React, { useState } from 'react';
import { Box, useInput, useApp } from 'ink';
import Header        from './components/Header.js';
import Sidebar       from './components/Sidebar.js';
import StatusBar     from './components/StatusBar.js';
import PlatformPicker from './components/PlatformPicker.js';
import Dashboard     from './screens/Dashboard.js';
import Devices       from './screens/Devices.js';
import Generate      from './screens/Generate.js';
import Deploy        from './screens/Deploy.js';
import Apps          from './screens/Apps.js';
import Logs          from './screens/Logs.js';
import Transfer      from './screens/Transfer.js';
import Shell         from './screens/Shell.js';
import Inspector     from './screens/Inspector.js';
import Build         from './screens/Build.js';
import Emulator      from './screens/Emulator.js';
import InputSim      from './screens/InputSim.js';
import { NAV_ITEMS } from './theme.js';

const SCREENS = {
  dashboard: Dashboard,
  devices:   Devices,
  generate:  Generate,
  deploy:    Deploy,
  apps:      Apps,
  logs:      Logs,
  transfer:  Transfer,
  shell:     Shell,
  inspector: Inspector,
  build:     Build,
  emulator:  Emulator,
  input:     InputSim,
};

export default function App() {
  const { exit } = useApp();
  const [platform,       setPlatform]       = useState(null);
  const [menuIndex,      setMenuIndex]      = useState(0);
  const [currentScreen,  setCurrentScreen]  = useState('dashboard');
  const [sidebarFocused, setSidebarFocused] = useState(true);
  const [currentDevice,  setCurrentDevice]  = useState(null);

  const navItems = platform ? NAV_ITEMS[platform] : [];

  useInput((input, key) => {
    if (!platform) return;

    if (key.ctrl && input === 'c') { exit(); return; }
    if (input === 'q' && sidebarFocused) { exit(); return; }

    if (sidebarFocused) {
      if (key.upArrow)   setMenuIndex(i => Math.max(0, i - 1));
      if (key.downArrow) setMenuIndex(i => Math.min(navItems.length - 1, i + 1));
      if (key.return) {
        setCurrentScreen(navItems[menuIndex].id);
        setSidebarFocused(false);
      }
      if (input === 'p') {
        setPlatform(null);
        setCurrentDevice(null);
        setMenuIndex(0);
        setCurrentScreen('dashboard');
        setSidebarFocused(true);
        return;
      }
    } else {
      if (key.escape) setSidebarFocused(true);
      if (input === 'q') { exit(); return; }
    }
  });

  if (!platform) {
    return (
      <PlatformPicker
        onSelect={(p) => {
          setPlatform(p);
          setCurrentScreen('dashboard');
          setMenuIndex(0);
          setCurrentDevice(null);
        }}
      />
    );
  }

  const ScreenComponent = SCREENS[currentScreen] || Dashboard;
  const cols = process.stdout.columns || 80;

  return (
    <Box flexDirection="column" width={cols}>
      <Header currentDevice={currentDevice} platform={platform} onChangePlatform={() => {
        setPlatform(null);
        setCurrentDevice(null);
        setMenuIndex(0);
        setCurrentScreen('dashboard');
        setSidebarFocused(true);
      }} />

      <Box>
        <Sidebar
          menuIndex={menuIndex}
          currentScreen={currentScreen}
          focused={sidebarFocused}
          platform={platform}
        />
        <Box flexGrow={1} flexDirection="column">
          <ScreenComponent
            focused={!sidebarFocused}
            currentDevice={currentDevice}
            platform={platform}
            onDeviceChange={setCurrentDevice}
            onNavigate={(screen) => {
              const idx = navItems.findIndex(m => m.id === screen);
              if (idx >= 0) setMenuIndex(idx);
              setCurrentScreen(screen);
              setSidebarFocused(false);
            }}
          />
        </Box>
      </Box>

      <StatusBar sidebarFocused={sidebarFocused} platform={platform} />
    </Box>
  );
}
