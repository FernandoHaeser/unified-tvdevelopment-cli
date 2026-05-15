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

const STEPS = { INPUT: 0, PACKAGING: 1, CONFIRM_INSTALL: 2, INSTALLING: 3, CONFIRM_LAUNCH: 4, DONE: 5 };

function getPkgLabel(platform) {
  if (platform === 'webos')  return 'App Source Directory';
  if (platform === 'tizen')  return 'Project Directory';
  return 'APK File Path';
}

function getInstallLabel(platform) {
  if (platform === 'webos' || platform === 'tizen') return 'Package & Install';
  return 'Install APK';
}

const NEEDS_PACKAGING = ['webos', 'tizen'];

export default function Deploy({ focused, currentDevice, platform }) {
  const meta   = PLATFORM_META[platform];
  const utils  = UTILS[platform];
  const device = currentDevice?.name ?? currentDevice?.serial;

  const [step,    setStep]    = useState(STEPS.INPUT);
  const [srcPath, setSrcPath] = useState('');
  const [outDir,  setOutDir]  = useState('./dist');
  const [pkgFile, setPkgFile] = useState('');
  const [output,  setOutput]  = useState([]);
  const [error,   setError]   = useState(null);
  const [inputField, setInputField] = useState(0);

  const needsPkg = NEEDS_PACKAGING.includes(platform);
  const addOutput = (msg, ok = true) => setOutput(o => [...o, { msg, ok }]);

  const runDeploy = async () => {
    setStep(STEPS.PACKAGING);
    setError(null);
    try {
      if (needsPkg) {
        const { output: out, pkgFile: pf } = await utils.packageApp({ appDir: srcPath, projectDir: srcPath, outDir });
        addOutput(out || `Packaged to ${outDir}`);
        setPkgFile(pf || `${outDir}/app.${platform === 'tizen' ? 'wgt' : 'ipk'}`);
      } else {
        setPkgFile(srcPath);
      }
      setStep(STEPS.CONFIRM_INSTALL);
    } catch (e) {
      setError(e.message);
      setStep(STEPS.INPUT);
    }
  };

  const runInstall = async () => {
    setStep(STEPS.INSTALLING);
    try {
      let out;
      if (platform === 'webos') {
        out = await utils.installApp({ ipkPath: pkgFile, device });
      } else if (platform === 'tizen') {
        out = await utils.installApp({ wgtPath: pkgFile, serial: device });
      } else {
        out = await utils.installApp({ apkPath: pkgFile, serial: device });
      }
      addOutput(out || 'Installed successfully');
      setStep(STEPS.CONFIRM_LAUNCH);
    } catch (e) {
      setError(e.message);
      setStep(STEPS.CONFIRM_INSTALL);
    }
  };

  const runLaunch = async () => {
    try {
      const idGuess = pkgFile.replace(/.*\//, '').replace(/[_\.].*/, '');
      let out;
      if (platform === 'webos') {
        out = await utils.launchApp({ appId: idGuess, device });
      } else if (platform === 'tizen') {
        out = await utils.launchApp({ appId: idGuess, serial: device });
      } else {
        out = await utils.launchApp({ packageName: idGuess, activity: '.MainActivity', serial: device });
      }
      addOutput(out || `Launched ${idGuess}`);
    } catch (e) {
      addOutput(e.message, false);
    }
    setStep(STEPS.DONE);
  };

  useInput(async (input, key) => {
    if (!focused) return;

    if (step === STEPS.INPUT) {
      if (key.return) {
        if (needsPkg && inputField === 0) { setInputField(1); return; }
        await runDeploy();
      }
      if (key.escape) setInputField(0);
    }
    if (step === STEPS.CONFIRM_INSTALL) {
      if (input === 'y' || key.return) await runInstall();
      if (input === 'n') setStep(STEPS.DONE);
    }
    if (step === STEPS.CONFIRM_LAUNCH) {
      if (input === 'y' || key.return) await runLaunch();
      if (input === 'n') setStep(STEPS.DONE);
    }
    if (step === STEPS.DONE) {
      if (input === 'r' || key.return) {
        setStep(STEPS.INPUT);
        setOutput([]);
        setError(null);
        setPkgFile('');
        setInputField(0);
      }
    }
  }, { isActive: focused });

  const isLoading = step === STEPS.PACKAGING || step === STEPS.INSTALLING;

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Text bold color={meta.color}>{ICONS.package}  {getInstallLabel(platform)}</Text>
      {device && <Text color="gray">Device: <Text color="green">{device}</Text></Text>}
      {!device && <Text color="yellow">{ICONS.warn}  No device selected — go to Devices screen first</Text>}

      {error && (
        <Box borderStyle="round" borderColor="red" paddingX={1}>
          <Text color="red">{ICONS.cross}  {error}</Text>
        </Box>
      )}

      {isLoading && (
        <Loader
          label={step === STEPS.PACKAGING ? 'Packaging...' : 'Installing...'}
          color={meta.color}
        />
      )}

      {step === STEPS.INPUT && (
        <Box flexDirection="column" borderStyle="round" borderColor={meta.color} paddingX={2} paddingY={1} gap={1}>
          <Box>
            <Text color={inputField === 0 ? meta.color : 'gray'}>{getPkgLabel(platform)}: </Text>
            {inputField === 0 ? (
              <TextInput
                value={srcPath}
                onChange={setSrcPath}
                placeholder={needsPkg ? './myapp' : './app.apk'}
              />
            ) : (
              <Text color="white">{srcPath}</Text>
            )}
          </Box>
          {needsPkg && (
            <Box>
              <Text color={inputField === 1 ? meta.color : 'gray'}>Output Directory:     </Text>
              {inputField === 1 ? (
                <TextInput
                  value={outDir}
                  onChange={setOutDir}
                  placeholder="./dist"
                />
              ) : (
                <Text color="white">{outDir}</Text>
              )}
            </Box>
          )}
          <Text dimColor>⏎ to {needsPkg ? 'continue' : 'install'}</Text>
        </Box>
      )}

      {step === STEPS.CONFIRM_INSTALL && (
        <Box flexDirection="column" borderStyle="round" borderColor="yellow" paddingX={2} paddingY={1} gap={1}>
          <Text bold color="yellow">Install package?</Text>
          <Text color="gray">File: <Text color="white">{pkgFile}</Text></Text>
          <Text color="gray">Device: <Text color={device ? 'green' : 'red'}>{device || 'none'}</Text></Text>
          <Text color="yellow">[y] Install  [n] Skip</Text>
        </Box>
      )}

      {step === STEPS.CONFIRM_LAUNCH && (
        <Box flexDirection="column" borderStyle="round" borderColor={meta.color} paddingX={2} paddingY={1} gap={1}>
          <Text bold color={meta.color}>Launch app?</Text>
          <Text color="yellow">[y] Launch  [n] Skip</Text>
        </Box>
      )}

      {output.length > 0 && (
        <Box flexDirection="column" borderStyle="round" borderColor="gray" paddingX={1}>
          <Text bold color="gray">Output</Text>
          {output.map((o, i) => (
            <Text key={i} color={o.ok ? 'green' : 'red'}>
              {o.ok ? ICONS.check : ICONS.cross}  {o.msg}
            </Text>
          ))}
        </Box>
      )}

      {step === STEPS.DONE && (
        <Box>
          <Text bold color="green">{ICONS.check}  Done!  </Text>
          <Text dimColor>⏎ or [r] restart</Text>
        </Box>
      )}
    </Box>
  );
}
