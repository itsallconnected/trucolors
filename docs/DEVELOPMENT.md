# Development

## Overview

Before starting local development, read the [CONTRIBUTING] guide to understand
what changes are desirable and what general processes to use.

## Environments

### Vagrant

A **Vagrant** configuration is included for development purposes. To use it,
complete the following steps:

- Install Vagrant and Virtualbox
- Install the `vagrant-hostsupdater` plugin:
  `vagrant plugin install vagrant-hostsupdater`
- Run `vagrant up`
- Run `vagrant ssh -c "cd /vagrant && bin/dev"`
- Open `http://truecolors.local` in your browser

### macOS

To set up **macOS** for native development, complete the following steps:

- Install [Homebrew] and run:
  `brew install postgresql@14 redis imagemagick libidn nvm`
  to install the required project dependencies
- Use a Ruby version manager to activate the ruby in `.ruby-version` and run
  `nvm use` to activate the node version from `.nvmrc`
- Run the `bin/setup` script, which will install the required ruby gems and node
  packages and prepare the database for local development
- Finally, run the `bin/dev` script which will launch services via `overmind`
  (if installed) or `foreman`

### Docker

For production hosting and deployment with **Docker**, use the `Dockerfile` and
`docker-compose.yml` in the project root directory.

For local development, install and launch [Docker], and run:

```shell
docker compose -f .devcontainer/compose.yaml up -d
docker compose -f .devcontainer/compose.yaml exec app bin/setup
docker compose -f .devcontainer/compose.yaml exec app bin/dev
```

### Dev Containers

Within IDEs that support the [Development Containers] specification, start the
"Truecolors on local machine" container from the editor. The necessary `docker
compose` commands to build and setup the container should run automatically. For
**Visual Studio Code** this requires installing the [Dev Container extension].

### GitHub Codespaces

[GitHub Codespaces] provides a web-based version of VS Code and a cloud hosted
development environment configured with the software needed for this project.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)][codespace]

- Click the button to create a new codespace, and confirm the options
- Wait for the environment to build (takes a few minutes)
- When the editor is ready, run `bin/dev` in the terminal
- Wait for an _Open in Browser_ prompt. This will open Truecolors
- On the _Ports_ tab "stream" setting change _Port visibility_ → _Public_

[codespace]: https://codespaces.new/truecolors/truecolors?quickstart=1&devcontainer_path=.devcontainer%2Fcodespaces%2Fdevcontainer.json
[CONTRIBUTING]: ../CONTRIBUTING.md
[Dev Container extension]: https://containers.dev/supporting#dev-containers
[Development Containers]: https://containers.dev/supporting
[Docker]: https://docs.docker.com
[GitHub Codespaces]: https://docs.github.com/en/codespaces
[Homebrew]: https://brew.sh

## Setting up the systemd service

1. Copy the service file:

   ```bash
   cp deployment/crewai-xmpp-bot.service /etc/systemd/system/
   ```

2. Edit the file to replace placeholders:

   - %CREWAI_BOT_JID% - The JID from running `rails crewai:init_bot`
   - %CREWAI_BOT_PASSWORD% - The password from running `rails crewai:init_bot`
   - %DATABASE_URL% - Your database URL

3. Enable and start the service:
   ```bash
   systemctl daemon-reload
   systemctl enable crewai-xmpp-bot
   systemctl start crewai-xmpp-bot
   ```

## Setting up CrewAI with Ollama

1. Install Python dependencies:

   ```bash
   pip install slixmpp==1.8.4 crewai==0.108.0 langchain==0.1.5 langchain-ollama==0.0.2 cryptography==41.0.5 psycopg2-binary==2.9.9 pyyaml==6.0.1
   ```

2. Install Ollama:

   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

3. Pull the required model:

   ```bash
   ollama pull mixtral
   ```

4. Initialize the CrewAI bot user:

   ```bash
   rails crew_bot:start
   ```

5. Load agent configurations:
   ```bash
   rails crew_bot:load_config
   ```
