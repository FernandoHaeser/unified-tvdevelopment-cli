import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Loader from '../components/Loader.js';
import { ICONS, PLATFORM_META } from '../theme.js';
import * as webos   from '../utils/webos.js';
import * as tizen   from '../utils/tizen.js';
import * as amazon  from '../utils/amazon.js';
import * as android from '../utils/android.js';

const UTILS = { webos, tizen, amazon, android };
const DIR  = { PUSH: 'push', PULL: 'pull' };
const STEP = { SELECT_DIR: 0, SRC: 1, DEST: 2, DONE: 3 };

export default function Transfer({ focused, currentDevice, platform }) {
  const [direction, setDirection] = useState(DIR.PUSH);
  const [step,      setStep]      = useState(STEP.SELECT_DIR);
  const [src,       setSrc]       = useState('');
  const [dest,      setDest]      = useState('');
  const [working,   setWorking]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState(null);

  const meta   = PLATFORM_META[platform];
  const utils  = UTILS[platform];
  const device = currentDevice?.name ?? currentDevice?.serial;

  async function runTransfer() {
    setWorking(true);
    setError(null);
    try {
      let out;
      const isPush = direction === DIR.PUSH;
      const pushOpts = platform === 'webos'
        ? { localPath: src, remotePath: dest, device }
        : { localPath: src, remotePath: dest, serial: device };
      const pullOpts = platform === 'webos'
        ? { remotePath: src, localPath: dest, device }
        : { remotePath: src, localPath: dest, serial: device };

      out = isPush
        ? await utils.pushFiles(pushOpts)
        : await utils.pullFiles(pullOpts);

      setResult(out || 'Transfer complete');
      setStep(STEP.DONE);
    } catch (e) {
      setError(e.message);
    }
    setWorking(false);
  }

  function reset() {
    setStep(STEP.SELECT_DIR);
    setSrc('');
    setDest('');
    setResult(null);
    setError(null);
  }

  useInput((input, key) => {
    if (!focused) return;
    if (step === STEP.SELECT_DIR) {
      if (input === 'p') { setDirection(DIR.PUSH); setStep(STEP.SRC); }
      if (input === 'l') { setDirection(DIR.PULL); setStep(STEP.SRC); }
    }
    if (step === STEP.SRC  && key.return) setStep(STEP.DEST);
    if (step === STEP.DEST && key.return) runTransfer();
    if (step === STEP.DONE && (key.return || input === 'r')) reset();
    if (key.escape && step !== STEP.SELECT_DIR) setStep(s => Math.max(0, s - 1));
  }, { isActive: focused });

  if (!device) {
    return (
      <Box flexDirection="column" padding={2}>
        <Text color="yellow">{ICONS.warn}  No device selected.</Text>
      </Box>
    );
  }

  const isPush    = direction === DIR.PUSH;
  const srcLabel  = isPush ? 'Local path (host)'    : 'Remote path (device)';
  const destLabel = isPush ? 'Remote path (device)' : 'Local path (host)';

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Text bold color={meta.color}>{ICONS.transfer}  File Transfer  <Text color="gray">[{device}]</Text></Text>

      {error && (
        <Box borderStyle="round" borderColor="red" paddingX={1}>
          <Text color="red">{ICONS.cross}  {error}</Text>
        </Box>
      )}
      {working && <Loader label={`${isPush ? 'Pushing' : 'Pulling'} files...`} color={meta.color} />}

      {step === STEP.SELECT_DIR && (
        <Box flexDirection="column" borderStyle="round" borderColor={meta.color} paddingX={2} paddingY={1} gap={1}>
          <Text bold>Transfer Direction</Text>
          <Box><Text color={meta.color}>▶  </Text><Text bold>[p] Push  </Text><Text color="gray">Host → Device</Text></Box>
          <Box><Text color="magenta">◀  </Text><Text bold>[l] Pull  </Text><Text color="gray">Device → Host</Text></Box>
        </Box>
      )}

      {step === STEP.SRC && !working && (
        <Box flexDirection="column" borderStyle="round" borderColor={meta.color} paddingX={2} paddingY={1} gap={1}>
          <Text bold color={isPush ? meta.color : 'magenta'}>{isPush ? '▶ Push' : '◀ Pull'}</Text>
          <Box>
            <Text color={meta.color}>{srcLabel}: </Text>
            <TextInput
              value={src}
              onChange={setSrc}
              placeholder={isPush ? './local/file.txt' : '/data/file.txt'}
            />
          </Box>
          <Text dimColor>⏎ next  Esc back</Text>
        </Box>
      )}

      {step === STEP.DEST && !working && (
        <Box flexDirection="column" borderStyle="round" borderColor={meta.color} paddingX={2} paddingY={1} gap={1}>
          <Text bold>{srcLabel}: <Text color="white">{src}</Text></Text>
          <Box>
            <Text color={meta.color}>{destLabel}: </Text>
            <TextInput
              value={dest}
              onChange={setDest}
              placeholder={isPush ? '/data/file.txt' : './local/file.txt'}
            />
          </Box>
          <Text dimColor>⏎ transfer  Esc back</Text>
        </Box>
      )}

      {step === STEP.DONE && (
        <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={2} paddingY={1} gap={1}>
          <Text bold color="green">{ICONS.check}  Transfer Complete!</Text>
          <Text color="gray">{result}</Text>
          <Text dimColor>⏎ or [r] again</Text>
        </Box>
      )}
    </Box>
  );
}
