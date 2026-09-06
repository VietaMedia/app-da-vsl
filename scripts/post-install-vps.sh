#!/bin/bash
# Post-install da VPS do App da VSL.
#
# OPCIONAL. O caminho normal NAO precisa deste script.
# Quem compra a VPS no hPanel recebe a maquina ja instalada e em estado "running";
# nesse caso pule a instalacao inteira e va direto pro firewall e pro projeto "borda"
# (veja publicar-vps.md, parte 1). O Docker Manager da Hostinger (as ferramentas
# VPS_*Project*) instala o Docker sozinho se ele faltar.
#
# Use este script SO quando a VPS ainda esta em estado "initial" e voce mesmo vai
# rodar VPS_setupPurchasedVirtualMachineV1 - ai ele entra como post_install_script_id
# e faz tres otimizacoes: Docker (se faltar), swap e rotacao de log.
#
# Roda UMA VEZ, como root, no fim da instalacao do sistema. Log em /post_install.log.
# Maximo 48 KB. Idempotente de proposito: se rodar duas vezes, nao quebra nada.
#
# Ele NAO cria rede docker. A rede compartilhada e a "borda_default", criada
# automaticamente pelo Docker Compose quando o projeto "borda" sobe.
set -x
export DEBIAN_FRONTEND=noninteractive

# O template "Ubuntu 24.04 with Claude Code" ja costuma trazer Docker.
# Instalar so se faltar.
if ! command -v docker >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y ca-certificates curl
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
systemctl enable --now docker

# Swap de 2 GB: a KVM 1 tem 4 GB, o MySQL nao gosta de aperto e o "next build"
# dentro do container come memoria no primeiro up.
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Log rotativo: sem isso, log de container enche o disco de 50 GB em semanas.
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'JSON'
{ "log-driver": "json-file", "log-opts": { "max-size": "10m", "max-file": "3" } }
JSON
systemctl restart docker

echo "post-install do App da VSL terminou em $(date -Is)" > /root/app-da-vsl-pronto.txt
