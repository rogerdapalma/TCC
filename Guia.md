
# Guia para Rodar o Projeto

## ✅ Pré-requisitos

Confirme as versões (ideal usar exatamente estas):

```bash
python --version  # Python 3.13.9
node --version    # v20.18.1
npm --version     # 10.8.2
```
- caso não estiver na mesma versão
```bash
py -3.13.9 --version

node use 20.18.1

npm install -g npm@10.8.2
npm --version
```
---

## 🖥️ TERMINAL A — Backend (FastAPI)

No primeiro terminal:

```bash
cd tcc/server
```

### 1) Criar e ativar o ambiente virtual

* **macOS/Linux:**

  ```bash
  python -m venv .venv
  source .venv/bin/activate
  ```

* **Windows (PowerShell):**

  ```powershell
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  ```

### 2) Instalar dependências

No terminal com o venv ativado:

```bash
pip install --upgrade pip
python -m pip install --upgrade pip  # alternativa equivalente
pip install -r requirements.txt
```

### 3) Rodar a API (porta 8000)

```bash
uvicorn app.main:app --reload --port 8000
```

### 4) Testar a API

Em outro terminal ou no próprio:

```bash
curl http://127.0.0.1:8000/health
```

Também é possível abrir no navegador:

* Documentação automática (Swagger):
  `http://127.0.0.1:8000/docs`

---

## 📱 TERMINAL B — Frontend (Expo/React Native)

Abra **outro terminal**:

```bash
cd tcc/client
```

### 1) Instalar dependências do app

```bash
npm install
```

Se der conflito de dependências, tente:

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 2) Rodar o app

* **Modo Web (mais simples):**

  ```bash
  npx expo start --web
  ```

* **Opcional: em emulador/dispositivo**

  ```bash
  npx expo start --android
  # ou
  npx expo start --ios   # (apenas em macOS com Xcode)
  ```

---

## 🗄️ Caso o banco de dados não seja encontrado

Se ao rodar o backend o banco (`alimentos.sqlite`) não for encontrado, faça o seguinte.

### No terminal do servidor (backend)

```powershell
cd tcc\server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

$env:FOODS_DB = (Resolve-Path ..\data\alimentos.sqlite).Path
@"
FOODS_DB=$($env:FOODS_DB -replace '\\','/')
"@ | Set-Content -Encoding UTF8 .env

uvicorn app.main:app --reload --port 8000
```

### No terminal do cliente (frontend)

```powershell
cd tcc\client
npm install

$env:EXPO_PUBLIC_API = "http://127.0.0.1:8000"
@"
EXPO_PUBLIC_API=http://127.0.0.1:8000
"@ | Set-Content -Encoding UTF8 .env

npx expo start --web
```

Após dar **Enter** no comando do cliente (`npx expo start --web`), o app já deve abrir corretamente apontando para a API.

