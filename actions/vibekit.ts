'use server';

import { Sandbox } from '@e2b/code-interpreter';

export async function getVsCodeServerUrl(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  const url = await sandbox.getHost(37863);

  const response = await fetch('https://' + url);
  if (response.status === 502) {
    const command =
      'nohup code-server /vibe0 --bind-addr 0.0.0.0:37863 --user-data-dir /home/user/.local/share/code-server --auth none >/tmp/cs.out 2>&1 &';
    const result = await sandbox.commands.run(command, {
      background: true,
      cwd: '/vibe0',
    });

    console.log('result', result);
  }

  return url;
}
