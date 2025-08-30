FROM e2bdev/code-interpreter:latest 

# Ensure git over HTTPS works (remote helper + certs) and common tooling is present
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      curl \
      git \
      git-lfs \
      openssh-client \
      ripgrep \
      ca-certificates \
      libcurl4 && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js 24.x
RUN curl -sL https://deb.nodesource.com/setup_24.x | bash - && apt-get install -y nodejs

# Confirm installations
RUN node -v && npm -v && git --version && git --exec-path && which git-remote-https || true

# Install Claude Code globalliy
RUN npm install -g @anthropic-ai/claude-code@latest
RUN npm install -g opencode-ai@latest
RUN npm install -g @openai/codex@latest
RUN npm install -g @google/gemini-cli
RUN npm install -g @vibe-kit/grok-cli@latest
RUN npm i -g @vibe-kit/sdk @vibe-kit/e2b

WORKDIR /shipvibes
RUN npm init -y && npm pkg set type=module && npm install @vibe-kit/sdk @vibe-kit/e2b
