#!/usr/bin/env bash
set -u; U="${1:?uso: smoke.sh https://dominio}"; ok=0; falha=0
chk(){ if [ "$1" = "$2" ]; then echo "OK  $3"; ok=$((ok+1)); else echo "ERRO $3 (esperado $2, veio $1)"; falha=$((falha+1)); fi; }
chk "$(curl -s -m 20 -o /dev/null -w '%{http_code}' $U/api/health)" 200 "rota de saúde"
HEALTH_BODY="$(curl -s -m 20 $U/api/health)"
chk "$(echo "$HEALTH_BODY" | grep -c '"db":{"ok":true')" 1 "banco responde"
chk "$(echo "$HEALTH_BODY" | grep -c '"sessao":"configurada"')" 1 "SESSION_SECRET configurado"
MANIFEST_BODY="$(curl -s -m 20 $U/manifest.webmanifest)"
chk "$(curl -s -m 20 -o /dev/null -w '%{http_code}' $U/manifest.webmanifest)" 200 "manifesto PWA"
chk "$(echo "$MANIFEST_BODY" | grep -c '"display":"standalone"')" 1 "manifesto é instalável (standalone)"
ENTRAR_BODY="$(curl -s -m 20 $U/entrar)"
chk "$(curl -s -m 20 -o /dev/null -w '%{http_code}' $U/entrar)" 200 "página de entrar"
chk "$(echo "$ENTRAR_BODY" | grep -cE 'e-mail da sua compra|correo de tu compra|email from your purchase')" 1 "página de entrar pede e-mail da compra (pt/es/en)"
chk "$(curl -s -m 20 -o /dev/null -w '%{http_code}' $U/app)" 307 "app protegido redireciona"

# O script não sabe se OWNER_PIN está configurado no ambiente (não dá pra checar isso
# de fora), então não testamos o e-mail do dono aqui. Em vez disso, confirmamos que
# um e-mail qualquer (que nunca é o do dono) continua entrando SEM PIN — como sempre
# funcionou pra compradores comuns, com ou sem OWNER_PIN configurado.
E="smoke-$(date +%s)@teste.local"
BODY="{\"email\":\"$E\"}"
COOKIES="$(mktemp)"
LOGIN_BODY="$(curl -s -m 20 -c "$COOKIES" -X POST -H 'content-type: application/json' -d "$BODY" $U/api/auth/login)"
chk "$(echo "$LOGIN_BODY" | grep -c '"ok":true')" 1 "login sem PIN funciona pra e-mail comum"
chk "$(echo "$LOGIN_BODY" | grep -c '"onboardingPendente":true')" 1 "conta nova cai em onboarding"
echo "NOTA: teste do OWNER_PIN é manual — veja docs/COMO-FUNCIONA.md (login com o e-mail"
echo "      do dono sem PIN deve responder 401 com precisaPin:true quando OWNER_PIN estiver configurado)."

APP_STATUS="$(curl -s -m 20 -b "$COOKIES" -o /dev/null -w '%{http_code}' $U/app)"
if [ "$APP_STATUS" = "200" ] || [ "$APP_STATUS" = "307" ]; then
  echo "OK  /app com sessão responde ($APP_STATUS)"; ok=$((ok+1))
else
  echo "ERRO /app com sessão responde (esperado 200 ou 307, veio $APP_STATUS)"; falha=$((falha+1))
fi
rm -f "$COOKIES"

echo "== $ok ok, $falha erro(s)"; [ $falha -eq 0 ]
