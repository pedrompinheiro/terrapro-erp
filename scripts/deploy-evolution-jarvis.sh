#!/bin/bash
# ============================================================
# Deploy Evolution API v2.3.6+ no JARVIS (Ubuntu Server)
# Execute: ssh pedro@192.168.1.120 'bash -s' < scripts/deploy-evolution-jarvis.sh
# Ou copie para o server e rode: bash deploy-evolution-jarvis.sh
# ============================================================

set -e

JARVIS_IP="192.168.1.120"
EVOLUTION_DIR="$HOME/evolution-api"

echo "🚀 Deploy Evolution API no JARVIS ($JARVIS_IP)"
echo "================================================"

# 1. Parar containers antigos
echo ""
echo "📦 Parando containers antigos..."
cd "$EVOLUTION_DIR" 2>/dev/null || mkdir -p "$EVOLUTION_DIR" && cd "$EVOLUTION_DIR"
docker compose down -v 2>/dev/null || true

# 2. Criar docker-compose.yml atualizado
echo "📝 Criando docker-compose.yml (v2.3.6 + Baileys v7)..."
cat > docker-compose.yml << 'EOF'
services:
  evolution_db:
    image: postgres:15-alpine
    container_name: evolution-db
    restart: always
    volumes:
      - evolution_pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: evolution
      POSTGRES_USER: evolution
      POSTGRES_PASSWORD: evolution_password
    ports:
      - '5433:5432'

  evolution_api:
    image: evoapicloud/evolution-api:v2.3.6
    container_name: evolution-api
    restart: always
    depends_on:
      - evolution_db
    network_mode: host
    environment:
      # Auth
      AUTHENTICATION_API_KEY: 'terrapro123'

      # Database
      DATABASE_PROVIDER: postgresql
      DATABASE_CONNECTION_URI: 'postgresql://evolution:evolution_password@localhost:5433/evolution'
      DATABASE_CLIENT_NAME: 'evolution_v2'

      # Server
      SERVER_PORT: 8081
      SERVER_URL: 'http://192.168.1.120:8081'

      # WhatsApp - versão atual do protocolo (auto-detect se vazio)
      # Atualizar em: https://wppconnect.io/whatsapp-versions/
      # CONFIG_SESSION_PHONE_VERSION: '2.3000.1035023383'

      # Features
      WEBSOCKET_ENABLED: 'false'
      WA_SESSION_DATA_PATH: '/evolution/store'
      CACHE_REDIS_ENABLED: 'false'
      S3_ENABLED: 'false'

      # Logs
      LOG_LEVEL: 'WARN'
      LOG_COLOR: 'true'
    volumes:
      - evolution_instances:/evolution/instances
      - evolution_store:/evolution/store

volumes:
  evolution_pgdata:
  evolution_instances:
  evolution_store:
EOF

# 3. Pull nova imagem
echo "⬇️  Baixando Evolution API v2.3.6 (evoapicloud)..."
docker compose pull

# 4. Subir containers
echo "🔄 Iniciando containers..."
docker compose up -d

# 5. Aguardar inicialização
echo "⏳ Aguardando API inicializar (30s)..."
sleep 30

# 6. Testar API
echo "🧪 Testando API..."
RESPONSE=$(curl -s http://localhost:8081/ 2>&1)
VERSION=$(echo "$RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('version','ERRO'))" 2>/dev/null || echo "ERRO")

if [ "$VERSION" = "ERRO" ]; then
  echo "❌ API não respondeu. Checando logs..."
  docker logs evolution-api --tail 20
  exit 1
fi

echo "✅ Evolution API $VERSION rodando em http://$JARVIS_IP:8081"

# 7. Criar instância e testar QR
echo ""
echo "📱 Criando instância terrapro_bot..."
curl -s -X DELETE -H "apikey: terrapro123" http://localhost:8081/instance/delete/terrapro_bot 2>/dev/null || true
sleep 2

CREATE_RESPONSE=$(curl -s -X POST -H "apikey: terrapro123" -H "Content-Type: application/json" \
  -d '{"instanceName":"terrapro_bot","qrcode":true,"integration":"WHATSAPP-BAILEYS"}' \
  http://localhost:8081/instance/create)

echo "Instância criada. Aguardando QR Code (15s)..."
sleep 15

QR_RESPONSE=$(curl -s -H "apikey: terrapro123" http://localhost:8081/instance/connect/terrapro_bot)
HAS_QR=$(echo "$QR_RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print('YES' if d.get('base64') else 'NO')" 2>/dev/null || echo "NO")

if [ "$HAS_QR" = "YES" ]; then
  echo "✅ QR Code gerado com sucesso!"
  echo "   Abra o TerraPro → Automação WhatsApp → Gerar QR Code"
else
  echo "⚠️  QR Code ainda não disponível. Pode demorar mais."
  echo "   Tente gerar pelo frontend em alguns minutos."
  echo "   Response: $(echo "$QR_RESPONSE" | head -c 200)"
fi

echo ""
echo "================================================"
echo "✅ Deploy concluído!"
echo "   API: http://$JARVIS_IP:8081"
echo "   Manager: http://$JARVIS_IP:8081/manager"
echo "   API Key: terrapro123"
echo "================================================"
