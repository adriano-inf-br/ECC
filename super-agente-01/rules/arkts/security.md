---
paths:
  - "**/*.ets"
  - "**/*.ts"
  - "**/module.json5"
---
# Segurança no HarmonyOS / ArkTS

> This file extends [common/security.md](../common/security.md) with HarmonyOS-specific security practices.

## Gerenciamento de Permissões

### Declarar Permissões em module.json5

Todas as chamadas de API do sistema que exigem permissões devem ser declaradas:

```json5
{
  "module": {
    "requestPermissions": [
      {
        "name": "ohos.permission.INTERNET",
        "reason": "$string:internet_permission_reason",
        "usedScene": {
          "abilities": ["EntryAbility"],
          "when": "always"
        }
      }
    ]
  }
}
```

### Checklist de Permissões

Antes de chamar APIs do sistema, verifique:

- [ ] Permissão declarada em `module.json5`
- [ ] String de motivo da permissão definida nos recursos (para permissões visíveis ao usuário)
- [ ] Requisição de permissão em tempo de execução implementada para permissões sensíveis (câmera, localização, etc.)
- [ ] Verificação de permissão antes da chamada de API com fallback gracioso em caso de negação

### Requisição de Permissão em Tempo de Execução

```typescript
import { abilityAccessCtrl, bundleManager, Permissions } from '@kit.AbilityKit';

async function checkAndRequestPermission(permission: Permissions): Promise<boolean> {
  const atManager = abilityAccessCtrl.createAtManager();
  const bundleInfo = await bundleManager.getBundleInfoForSelf(
    bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION
  );
  const tokenId = bundleInfo.appInfo.accessTokenId;
  const grantStatus = await atManager.checkAccessToken(tokenId, permission);

  if (grantStatus === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED) {
    return true;
  }

  const result = await atManager.requestPermissionsFromUser(getContext(), [permission]);
  return result.authResults[0] === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED;
}
```

## Gerenciamento de Segredos

- **NUNCA** hardcode chaves de API, tokens ou senhas em arquivos-fonte `.ets`/`.ts`
- Use a API Preferences do HarmonyOS para configuração não sensível
- Use o Keystore do HarmonyOS para credenciais sensíveis
- Configurações específicas de ambiente devem ser gerenciadas via build profiles

```typescript
// RUIM: segredo hardcoded
const API_KEY: string = 'sk-xxxxxxxxxxxx';

// BOM: a partir da configuração do build profile (não sensível)
import { BuildProfile } from 'BuildProfile';
const endpoint = BuildProfile.API_ENDPOINT;

// BOM: use HUKS para criptografar/descriptografar dados sem expor o material da chave
import { huks } from '@kit.UniversalKeystoreKit';
async function decryptWithKeystore(alias: string, nonce: Uint8Array, aad: Uint8Array, cipherData: Uint8Array): Promise<Uint8Array> {
  const options: huks.HuksOptions = {
    properties: [
      { tag: huks.HuksTag.HUKS_TAG_ALGORITHM, value: huks.HuksKeyAlg.HUKS_ALG_AES },
      { tag: huks.HuksTag.HUKS_TAG_PURPOSE, value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_DECRYPT },
      { tag: huks.HuksTag.HUKS_TAG_BLOCK_MODE, value: huks.HuksCipherMode.HUKS_MODE_GCM },
      { tag: huks.HuksTag.HUKS_TAG_PADDING, value: huks.HuksKeyPadding.HUKS_PADDING_NONE },
      { tag: huks.HuksTag.HUKS_TAG_NONCE, value: nonce },
      { tag: huks.HuksTag.HUKS_TAG_ASSOCIATED_DATA, value: aad }
    ],
    inData: cipherData
  };
  const handle = await huks.initSession(alias, options);
  const result = await huks.finishSession(handle.handle, options);
  return result.outData;
}
```

## Validação de Entrada

- Valide toda entrada do usuário antes de processar
- Sanitize os dados antes de exibi-los na UI para prevenir injeção
- Valide os parâmetros de deep link antes da navegação

```typescript
// Validar antes da navegação
function handleDeepLink(uri: string): void {
  const allowedPaths: string[] = ['detail', 'settings', 'profile'];
  const parsed = new URL(uri);
  const path = parsed.pathname.replace('/', '');

  if (!allowedPaths.includes(path)) {
    hilog.warn(0x0000, 'DeepLink', 'Invalid deep link path: %{public}s', path);
    return;
  }

  navPathStack.pushPath({ name: path });
}
```

## Segurança de Rede

- Sempre use HTTPS para requisições de rede
- Valide os certificados do servidor
- Implemente políticas de timeout e retentativa de requisições
- Nunca registre dados sensíveis (tokens, credenciais do usuário) nos logs de requisição/resposta de rede

## Segurança de Armazenamento de Dados

- Use preferences criptografadas para dados locais sensíveis
- Limpe os dados sensíveis da memória quando não forem mais necessários
- Implemente o gerenciamento adequado do ciclo de vida dos dados
- Considere a classificação dos dados (público, interno, confidencial) ao escolher os mecanismos de armazenamento

## Segurança de Dependências

- Use apenas dependências de fontes confiáveis (registro oficial ohpm)
- Verifique as versões das dependências em `oh-package.json5`
- Verifique regularmente vulnerabilidades conhecidas em bibliotecas de terceiros
- Fixe as versões das dependências para evitar atualizações inesperadas
