---
paths:
  - "**/*.ets"
  - "**/*.ts"
  - "**/ohosTest/**"
---
# Testes no HarmonyOS / ArkTS

> This file extends [common/testing.md](../common/testing.md) with HarmonyOS-specific testing practices.

## Framework de Teste

O HarmonyOS usa o framework de teste integrado com os recursos do `@ohos.test`:

- **Testes unitários**: Localizados em `src/ohosTest/ets/test/`
- **Testes de UI**: Use `@ohos.UiTest` para testes de componentes
- **Testes instrumentados**: Executam no dispositivo/emulador

## Estrutura de Diretórios de Teste

```
module/
  |-- src/
  |   |-- main/ets/          # Código de produção
  |   |-- ohosTest/ets/      # Código de teste
  |       |-- test/
  |       |   |-- Ability.test.ets
  |       |   |-- List.test.ets
  |       |-- TestAbility.ets
  |       |-- TestRunner.ets
```

## Executando Testes

```bash
# Executar todos os testes de um módulo
hvigorw testHap -p product=default

# Executar testes em um dispositivo conectado
hdc shell aa test -b com.example.app -m entry_test -s unittest /ets/TestRunner/OpenHarmonyTestRunner
```

## Exemplo de Teste Unitário

```typescript
import { describe, it, expect } from '@ohos/hypium';

export default function UserViewModelTest() {
  describe('UserViewModel', () => {
    it('should_initialize_with_empty_state', 0, () => {
      const vm = new UserViewModel();
      expect(vm.userName).assertEqual('');
      expect(vm.isLoading).assertFalse();
    });

    it('should_update_user_name', 0, () => {
      const vm = new UserViewModel();
      vm.updateUserName('Alice');
      expect(vm.userName).assertEqual('Alice');
    });

    it('should_handle_empty_input', 0, () => {
      const vm = new UserViewModel();
      vm.updateUserName('');
      expect(vm.userName).assertEqual('');
      expect(vm.hasError).assertFalse();
    });
  });
}
```

## Exemplo de Teste de UI

```typescript
import { describe, it, expect } from '@ohos/hypium';
import { Driver, ON } from '@ohos.UiTest';

export default function HomePageUITest() {
  describe('HomePage_UI', () => {
    it('should_display_title', 0, async () => {
      const driver = Driver.create();
      await driver.delayMs(1000);

      const title = await driver.findComponent(ON.text('Home'));
      expect(title !== null).assertTrue();
    });

    it('should_navigate_to_detail_on_click', 0, async () => {
      const driver = Driver.create();
      const button = await driver.findComponent(ON.id('detailButton'));
      await button.click();
      await driver.delayMs(500);

      const detailTitle = await driver.findComponent(ON.text('Detail'));
      expect(detailTitle !== null).assertTrue();
    });
  });
}
```

## Fluxo de Trabalho TDD para HarmonyOS

Siga o ciclo TDD padrão adaptado para o HarmonyOS:

1. **RED**: Escreva um teste que falha em `ohosTest/ets/test/`
2. **GREEN**: Implemente o código mínimo em `main/ets/` para passar
3. **REFACTOR**: Limpe mantendo os testes verdes
4. **BUILD**: Execute `hvigorw assembleHap` para verificar a compilação
5. **VERIFY**: Execute os testes no dispositivo/emulador

## Requisitos de Cobertura de Testes

- Mínimo de 80% de cobertura para todo código crítico da aplicação (ViewModels, serviços, utilitários)
- **Testes unitários**: Todas as funções utilitárias, lógica de ViewModel, modelos de dados
- **Testes de integração**: Chamadas de API, operações de banco de dados, interações entre módulos
- **Testes E2E / de UI**: Fluxos de usuário críticos (login, navegação, envio de dados)
- Teste casos extremos: dados vazios, erros de rede, negações de permissão

## Melhores Práticas de Teste

- Mantenha os testes independentes - sem estado mutável compartilhado entre testes
- Use Mock em chamadas de rede e APIs do sistema nos testes unitários
- Use nomes de teste significativos: `should_[expected_behavior]_when_[condition]`
- Teste a reatividade do gerenciamento de estado V2: verifique se propriedades `@Trace` disparam atualizações de UI
- Teste fluxos de Navigation: verifique as operações push/pop/replace de `NavPathStack`
- Evite testar detalhes internos do framework - foque na lógica de negócio e no comportamento visível ao usuário
