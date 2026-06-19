---
name: generating-python-installer
description: "Especialista em instaladores Python de nível comercial para Windows: compilação extrema com Nuitka, redução do dist, análise de footprint de DLL e empacotamento com Inno Setup para entregar os instaladores menores e mais rápidos. Use apenas para empacotamento/otimização avançada (tamanho mínimo, inicialização rápida), não para conversão básica de script para exe. 中文触发：Nuitka 极限优化、Python 商业打包、极限编译 Python、dist 瘦身、DLL 分析、最小安装包、最快启动、商业级打包风格"
---

# Gerando Instalador Python (Nível Comercial)

Você é um **especialista em deployment comercial de Python**. Seu objetivo é o instalador Windows **menor, com inicialização mais rápida e mais limpo**. A abordagem central é **"modo de pasta do Nuitka (dist) + empacotamento com Inno Setup"** — sem builds de arquivo único, sem janela de console perdida.

## Quando Ativar

Ative quando o usuário pedir explicitamente empacotamento Python **avançado** ou otimização de tamanho/inicialização no Windows:

- Compilação extrema com Nuitka / nível comercial, builds de tamanho mínimo ou inicialização mais rápida
- Redução da pasta `dist`, análise de footprint de DLL, trade-offs de tamanho entre 32 bits e 64 bits
- Empacotamento com Inno Setup com metadados completos e desinstalação limpa, sem resíduos

Esta skill foca em otimização avançada de tamanho/inicialização — não na conversão básica de "script para exe" em arquivo único.

## Como Funciona

1. **Confirme os parâmetros do build** — nome do app, versão, publicador, nome do exe, diretórios de origem/saída, ícone. Nunca preencha automaticamente; pergunte ao usuário.
2. **Verifique o build de origem** — console desabilitado, LTO habilitado, runtime VC++ presente.
3. **Compile com Nuitka** usando a estratégia de exclusão de módulos e plugins abaixo.
4. **Reduza a pasta `dist`** — remova símbolos de depuração, caches, testes e docs, com salvaguardas para metadados exigidos em tempo de execução.
5. **Analise as DLLs** para encontrar e enxugar as maiores dependências.
6. **Empacote com Inno Setup** — compressão ultra LZMA2, metadados completos, desinstalação sem resíduos e um redistribuível VC++ com arquitetura compatível.

## Exemplos

- "用 Nuitka 把这个 PySide2 项目打成最小体积的商业安装包" → execute o fluxo de trabalho completo: recomende 32 bits, exclua WebEngine/3D/Charts, reduza o `dist`, empacote com Inno Setup.
- "我的 exe 有 400 MB，怎么瘦身到一半" → analise as DLLs, troque para `opencv-python-headless`, descarte `opengl32sw`, aplique a redução do `dist`.
- "安装后在纯净系统打不开" → garanta que o redistribuível VC++ com arquitetura compatível esteja incluído no script do Inno Setup.

---

## Conceito Central

Mantenha firme a abordagem **"modo de pasta do Nuitka (dist) + empacotamento com Inno Setup"**. Recuse a versão de arquivo único, recuse a janela preta.

---

## Caso de Referência Prático (aplicação desktop PySide2 de nível de produção, 323 MB, com OpenCV / Playwright)

### Visão Geral do Projeto
- **Tamanho total**: 323 MB
- **Ferramenta de empacotamento**: PyInstaller 4.7 (32 bits)
- **Dependências principais**: PySide2 (22,52 MB), OpenCV (62,38 MB), Playwright (76,74 MB)
- **Versão do Python**: Python 3.8 (32 bits)
- **Quantidade de DLLs**: 71, totalizando 93,23 MB

### Estratégias-Chave de Otimização
1. PASS: **Usar Python de 32 bits** → redução de tamanho de 20-30%
2. PASS: **base_library.zip comprimindo a biblioteca padrão** → 0,74 MB
3. PASS: **Exclusão enxuta de módulos** → sem pytest/unittest/setuptools
4. PASS: **Plugins Qt enxutos** → manter apenas os plugins necessários

### Distribuição de Tamanho

| Componente | Tamanho | Proporção | Sugestão de otimização |
|------|------|------|---------|
| playwright | 76,74 MB | 23,8% | Removível se não for essencial |
| OpenCV | 62,38 MB | 19,3% | Usar opencv-python-headless |
| PySide2 | 22,52 MB | 7,0% | Excluir WebEngine/3D/Charts |
| Outras dependências | 161,36 MB | 49,9% | - |

### Comparação de Resultados Esperados

| Tipo de projeto | Nuitka original | Após otimização | Medição do projeto de referência |
|---------|------------|--------|----------------|
| Tkinter + biblioteca padrão | 150-250 MB | **80-120 MB** | - |
| PyQt/PySide | 200-400 MB | **120-250 MB** | 323 MB (com OpenCV etc.) |
| Com numpy/pandas | 300-600 MB | **180-350 MB** | - |

---

## Fluxo de Trabalho Central (Workflow) - WARNING: Executar com Rigor

Quando o usuário solicitar o empacotamento, siga os passos abaixo:

**Passo 1: Confirmação obrigatória de parâmetros (FAIL: proibido usar valores padrão)**

> **WARNING: Regra importante: todos os parâmetros a seguir devem ser confirmados um a um com o usuário; é proibido preencher automaticamente ou usar valores padrão!**

É obrigatório perguntar ao usuário e confirmar as seguintes informações (*só continue após resposta explícita do usuário*):

| Parâmetro | Descrição | Exemplo |
|------|------|------|
| **Nome do Software** (App Name) | Nome de exibição do software | `红墨批注` |
| **Número de Versão** (Version) | Versão semântica | `1.0.0` |
| **Publicador/Nome da Empresa** (Publisher) | Publicador exibido no Painel de Controle | `YourCompany` |
| **Programa Principal** (Exe Name) | Nome do arquivo executável principal | `RedInk.exe` |
| **Caminho de Origem** (Source Dir) | Caminho absoluto da pasta dist do Nuitka | `D:\project\dist` |
| **Caminho de Saída** (Output Dir) | Local de geração do instalador | `D:\project\output` |
| **Caminho do Ícone** (Icon Path) | Caminho absoluto do arquivo .ico (opcional, mas recomendado) | `D:\project\icon.ico` |
| **Endereço do Site** (URL) | Opcional, usado para o link no Painel de Controle | `https://example.com` |

**Modelo de pergunta:**
> "Por favor, forneça os seguintes parâmetros de empacotamento; preciso que você confirme um a um:
> 1. Nome do software:
> 2. Número de versão:
> 3. Publicador/nome da empresa:
> 4. Nome do arquivo do programa principal (como xxx.exe):
> 5. Caminho de origem (pasta dist do Nuitka):
> 6. Caminho de saída (local para salvar o instalador):
> 7. Caminho do ícone (arquivo .ico, pode ficar em branco):
> 8. Endereço do site (pode ficar em branco):
>
> Por favor, preencha um a um, ou responda 'pular' para usar valores vazios."

**Passo 2: Verificação de qualidade e compilação dos arquivos de origem (crítico)**
Antes de gerar o código, é obrigatório emitir ao usuário a seguinte **confirmação crítica** (porque o Inno Setup é apenas uma ferramenta de empacotamento, incapaz de alterar as propriedades de execução do próprio programa):

> "WARNING: **Verificação de parâmetros de compilação**:
> 1. **Remoção da janela preta**: confirme que sua pasta dist foi compilada com `nuitka --windows-console-mode=disable`. (Caso contrário, ainda haverá uma caixa preta após a instalação)
> 2. **Alto desempenho**: confirme se foi usado `--lto=yes`. (Caso contrário, a velocidade de inicialização pode não ser ideal)
> 3. **Bibliotecas de runtime**: garanta que a pasta dist já contenha as bibliotecas de runtime VC++ necessárias, para evitar que não rode em um sistema limpo.
>
> **Para confirmar que os arquivos de origem estão prontos, responda 'confirmado'; caso contrário, recompile primeiro.**"

**Passo 3: Gerar o código**
Após a confirmação do usuário, produza o código contendo **metadados completos** e **correção do ícone de desinstalação**.

---

## Compilação com Otimização Extrema do Nuitka (baseada na experiência do projeto de referência)

### Um. Estratégia de Escolha entre 32 bits e 64 bits

**Razões para o projeto de referência usar Python de 32 bits**:

| Componente | Tamanho 64 bits | Tamanho 32 bits | Economia |
|------|---------|---------|------|
| python3x.dll | ~4,5 MB | ~3,8 MB | 15% |
| Qt5Core.dll | ~8 MB | ~5 MB | 37% |
| numpy | ~30 MB | ~20 MB | 33% |
| **Total** | base | **-20~30%** | - |

**Condições recomendadas para usar 32 bits**:
- PASS: Uso de memória do programa < 2GB
- PASS: Não processa arquivos enormes (< 2GB)
- PASS: Usuários-alvo são computadores comuns de escritório

**Método de compilação 32 bits**:
```bash
# 1. 安装 32 位 Python（和 64 位可以共存）
# 下载地址：https://www.python.org/downloads/windows/

# 2. 用 32 位 Python 安装依赖
py -3.12-32 -m pip install -r requirements.txt

# 3. 用 32 位 Python 编译
py -3.12-32 -m nuitka --standalone ...你的参数
```

### Dois. Lista de Exclusão de Módulos (validada pelo projeto de referência)

**Lista de exclusão segura** (não necessária em tempo de execução):
```
unittest,test,pytest,_pytest,doctest,pdb,pdbpp,
setuptools,pip,distutils,pkg_resources,
email.mime,http.server,xmlrpc,pydoc
```

**Resultado esperado**: economia de **30-50 MB**

### Três. Otimização Específica para Frameworks de GUI

#### Otimização Extrema do Tkinter (recomendado, o mais leve)
```bash
nuitka --standalone --windows-console-mode=disable ^
    --lto=yes ^
    --jobs=8 ^
    --enable-plugin=tk-inter ^
    --enable-plugin=anti-bloat ^
    --noinclude-pytest-mode=nofollow ^
    --noinclude-setuptools-mode=nofollow ^
    --nofollow-import-to=unittest,test,pytest,_pytest,doctest,pdb,pdbpp ^
    --nofollow-import-to=setuptools,pip,distutils,pkg_resources ^
    --nofollow-import-to=email.mime,http.server,xmlrpc,pydoc ^
    --python-flag=no_docstrings ^
    --output-dir=dist ^
    --windows-icon-from-ico=icon.ico ^
    --remove-output ^
    main.py
```

**Tamanho esperado**: 80-120 MB (após otimização)

#### Otimização de PyQt5 / PySide2
```bash
nuitka --standalone --windows-console-mode=disable ^
    --lto=yes ^
    --jobs=8 ^
    --enable-plugin=pyqt5 ^
    --enable-plugin=anti-bloat ^
    --noinclude-pytest-mode=nofollow ^
    --noinclude-setuptools-mode=nofollow ^
    --nofollow-import-to=unittest,test,pytest,_pytest,doctest,pdb ^
    --nofollow-import-to=setuptools,pip,distutils,pkg_resources ^
    --nofollow-import-to=PyQt5.QtWebEngine,PyQt5.QtWebEngineWidgets ^
    --nofollow-import-to=PyQt5.Qt3D,PyQt5.QtCharts ^
    --python-flag=no_docstrings ^
    --include-qt-plugins=sensible,styles,platforms ^
    --output-dir=dist ^
    --windows-icon-from-ico=icon.ico ^
    --remove-output ^
    main.py
```

**Tamanho esperado**: 120-250 MB (após otimização)

### Quatro. Modelo de Script de Compilação com Um Clique

**Salve como `build_optimized.bat` (raiz do projeto)**:

```batch
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo Nuitka 极限优化编译（参考 参考项目）
echo ========================================

REM === 配置区域（请修改为你的实际值） ===
set APP_NAME=你的软件名
set MAIN_FILE=main.py
set ICON_FILE=icon.ico

REM === 自动检测 CPU 核心数 ===
REM 用 Windows 自带环境变量（wmic 在 Win11 22H2+ 已移除，探不到会让 --jobs=0 单线程编译）
set CPU_CORES=%NUMBER_OF_PROCESSORS%
if not defined CPU_CORES set CPU_CORES=4
set /a BUILD_JOBS=%CPU_CORES%

REM === 参考项目的模块排除清单 ===
set EXCLUDE_MODULES=unittest,test,pytest,_pytest,doctest,pdb,pdbpp
set EXCLUDE_MODULES=%EXCLUDE_MODULES%,setuptools,pip,distutils,pkg_resources
set EXCLUDE_MODULES=%EXCLUDE_MODULES%,email.mime,http.server,xmlrpc,pydoc

echo.
echo [1/4] 清理旧编译...
if exist dist rd /s /q dist
if exist build rd /s /q build

echo.
echo [2/4] Nuitka 编译中（应用 参考项目优化策略）...
echo - CPU 核心: %CPU_CORES% (使用 %BUILD_JOBS% 线程)
echo - 模块排除: %EXCLUDE_MODULES%
echo.

nuitka --standalone ^
    --windows-console-mode=disable ^
    --lto=yes ^
    --jobs=%BUILD_JOBS% ^
    --enable-plugin=anti-bloat ^
    --enable-plugin=tk-inter ^
    --noinclude-pytest-mode=nofollow ^
    --noinclude-setuptools-mode=nofollow ^
    --nofollow-import-to=%EXCLUDE_MODULES% ^
    --python-flag=no_docstrings ^
    --output-dir=dist ^
    --windows-icon-from-ico=%ICON_FILE% ^
    --remove-output ^
    %MAIN_FILE%

if %errorlevel% neq 0 (
    echo.
    echo [错误] 编译失败！
    pause
    exit /b 1
)

echo.
echo [3/4] 统计编译结果...
for /f %%a in ('powershell -NoProfile -Command "(Get-ChildItem -LiteralPath 'dist\%APP_NAME%.dist' -Recurse -File | Measure-Object -Property Length -Sum).Sum"') do set TOTAL_SIZE=%%a
set TOTAL_SIZE=%TOTAL_SIZE:,=%
set /a SIZE_MB=%TOTAL_SIZE% / 1048576
echo - 编译后体积: %SIZE_MB% MB

echo.
echo [4/4] 执行瘦身清理（参考 参考项目策略）...
powershell -ExecutionPolicy Bypass -File slim_dist.ps1 -DistPath "dist\%APP_NAME%.dist"

echo.
echo ========================================
echo 编译完成！
echo ========================================
pause
```

### Cinco. Script de Redução do dist (limpeza ao nível do projeto de referência)

**Salve como `slim_dist.ps1` (mesmo diretório do build_optimized.bat)**:

```powershell
param(
    [string]$DistPath
)

$ErrorActionPreference = "Continue"  # 不静默吞错：删除失败会显示出来，避免假成功

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "dist 瘦身清理（参考 参考项目策略）" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (-not (Test-Path $DistPath)) {
    Write-Host "[错误] 找不到目录: $DistPath" -ForegroundColor Red
    exit 1
}

# 统计初始体积
$InitialSize = (Get-ChildItem -Path $DistPath -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "`n初始体积: $([math]::Round($InitialSize, 2)) MB" -ForegroundColor Yellow

# 参考项目特征：没有 .pdb, .pyi, __pycache__, test 等
Write-Host "`n[应用 参考项目的清理策略...]" -ForegroundColor Green

# 1. 删除调试符号
Write-Host "`n[1/7] 删除 .pdb 调试符号..." -ForegroundColor Green
$pdbFiles = Get-ChildItem -Path $DistPath -Recurse -Include *.pdb -File
$pdbSize = ($pdbFiles | Measure-Object -Property Length -Sum).Sum / 1MB
if ($pdbFiles.Count -gt 0) {
    $pdbFiles | Remove-Item -Force
    Write-Host "  删除 $($pdbFiles.Count) 个文件，节省 $([math]::Round($pdbSize, 2)) MB"
} else {
    Write-Host "  未发现 .pdb 文件（已优化）" -ForegroundColor Gray
}

# 2. 删除类型提示
Write-Host "`n[2/7] 删除 .pyi 类型提示..." -ForegroundColor Green
$pyiFiles = Get-ChildItem -Path $DistPath -Recurse -Include *.pyi -File
$pyiSize = ($pyiFiles | Measure-Object -Property Length -Sum).Sum / 1MB
if ($pyiFiles.Count -gt 0) {
    $pyiFiles | Remove-Item -Force
    Write-Host "  删除 $($pyiFiles.Count) 个文件，节省 $([math]::Round($pyiSize, 2)) MB"
} else {
    Write-Host "  未发现 .pyi 文件（已优化）" -ForegroundColor Gray
}

# 3. 删除 __pycache__
Write-Host "`n[3/7] 删除 __pycache__ 缓存..." -ForegroundColor Green
$pycacheDirs = Get-ChildItem -Path $DistPath -Recurse -Directory -Filter "__pycache__"
$pycacheSize = 0
foreach ($dir in $pycacheDirs) {
    $size = (Get-ChildItem -Path $dir.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $pycacheSize += $size
    Remove-Item -Path $dir.FullName -Recurse -Force
}
if ($pycacheDirs.Count -gt 0) {
    Write-Host "  删除 $($pycacheDirs.Count) 个目录，节省 $([math]::Round($pycacheSize / 1MB, 2)) MB"
} else {
    Write-Host "  未发现 __pycache__（已优化）" -ForegroundColor Gray
}

# 4. 删除测试目录
Write-Host "`n[4/7] 删除 test/tests 测试目录..." -ForegroundColor Green
$testDirs = Get-ChildItem -Path $DistPath -Recurse -Directory | Where-Object { $_.Name -match '^tests?$' }
$testSize = 0
foreach ($dir in $testDirs) {
    $size = (Get-ChildItem -Path $dir.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $testSize += $size
    Remove-Item -Path $dir.FullName -Recurse -Force
}
if ($testDirs.Count -gt 0) {
    Write-Host "  删除 $($testDirs.Count) 个目录，节省 $([math]::Round($testSize / 1MB, 2)) MB"
} else {
    Write-Host "  未发现测试目录（已优化）" -ForegroundColor Gray
}

# 5. 删除文档和示例
Write-Host "`n[5/7] 删除 docs/examples 文档目录..." -ForegroundColor Green
$docDirs = Get-ChildItem -Path $DistPath -Recurse -Directory | Where-Object { $_.Name -match '^(docs|examples|samples|demo)$' }
$docSize = 0
foreach ($dir in $docDirs) {
    $size = (Get-ChildItem -Path $dir.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $docSize += $size
    Remove-Item -Path $dir.FullName -Recurse -Force
}
if ($docDirs.Count -gt 0) {
    Write-Host "  删除 $($docDirs.Count) 个目录，节省 $([math]::Round($docSize / 1MB, 2)) MB"
} else {
    Write-Host "  未发现文档目录（已优化）" -ForegroundColor Gray
}

# 6. 删除 .pyc 文件
Write-Host "`n[6/7] 删除 .pyc 字节码..." -ForegroundColor Green
$pycFiles = Get-ChildItem -Path $DistPath -Recurse -Include *.pyc -File
$pycSize = ($pycFiles | Measure-Object -Property Length -Sum).Sum / 1MB
if ($pycFiles.Count -gt 0) {
    $pycFiles | Remove-Item -Force
    Write-Host "  删除 $($pycFiles.Count) 个文件，节省 $([math]::Round($pycSize, 2)) MB"
} else {
    Write-Host "  未发现 .pyc 文件（已优化）" -ForegroundColor Gray
}

# 7. 精简 .dist-info 元数据
Write-Host "`n[7/7] 精简 .dist-info 元数据..." -ForegroundColor Green
$distInfoDirs = Get-ChildItem -Path $DistPath -Recurse -Directory -Filter "*.dist-info"
$removedCount = 0
$removedSize = 0
foreach ($infoDir in $distInfoDirs) {
    # 仅删安装期记账文件；保留 METADATA 与 entry_points.txt（运行期被 importlib.metadata 读取，删除会破坏插件发现）
    $filesToRemove = @("RECORD", "INSTALLER", "direct_url.json")
    foreach ($fileName in $filesToRemove) {
        $file = Join-Path $infoDir.FullName $fileName
        if (Test-Path $file) {
            $size = (Get-Item $file).Length
            $removedSize += $size
            Remove-Item $file -Force
            $removedCount++
        }
    }
}
if ($removedCount -gt 0) {
    Write-Host "  删除 $removedCount 个元数据文件，节省 $([math]::Round($removedSize / 1MB, 2)) MB"
} else {
    Write-Host "  未发现可清理的元数据（已优化）" -ForegroundColor Gray
}

# 统计最终体积
$FinalSize = (Get-ChildItem -Path $DistPath -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
$SavedSize = $InitialSize - $FinalSize
$SavedPercent = if ($InitialSize -gt 0) { ($SavedSize / $InitialSize) * 100 } else { 0 }

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "清理完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "初始体积: $([math]::Round($InitialSize, 2)) MB" -ForegroundColor Yellow
Write-Host "最终体积: $([math]::Round($FinalSize, 2)) MB" -ForegroundColor Green
Write-Host "节省空间: $([math]::Round($SavedSize, 2)) MB ($([math]::Round($SavedPercent, 1))%)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 对比 参考项目
Write-Host "[对比参考]" -ForegroundColor Yellow
Write-Host "参考项目总体积: 323 MB (包含 PyQt, OpenCV, Playwright 等重量级库)" -ForegroundColor Gray
Write-Host "如果你的项目是纯 Tkinter + 标准库，目标应该在 80-150 MB" -ForegroundColor Gray
```

**Resultado esperado**: economia de **15-30%** de tamanho

### Seis. Ferramenta de Análise de Dependências de DLL

**Salve como `analyze_dlls.py` (usado para identificar os maiores responsáveis pelo tamanho)**:

```python
"""
DLL 依赖分析工具
参考 参考项目的 DLL 管理策略，帮助识别体积大户和优化建议
"""
import sys
from pathlib import Path

def analyze_dlls(dist_path: str):
    """分析 dist 目录中的 DLL 依赖"""
    dist_dir = Path(dist_path)

    if not dist_dir.exists():
        print(f"[错误] 目录不存在: {dist_path}")
        return

    print("=" * 70)
    print("DLL 依赖分析（参考 参考项目策略）")
    print("=" * 70)

    # 收集所有 DLL
    dll_files = list(dist_dir.rglob("*.dll"))

    if not dll_files:
        print("\n未发现 DLL 文件")
        return

    # 按大小排序
    dll_data = [(dll, dll.stat().st_size) for dll in dll_files]
    dll_data.sort(key=lambda x: x[1], reverse=True)

    total_size = sum(size for _, size in dll_data)

    print(f"\n总 DLL 数量: {len(dll_files)}")
    print(f"总 DLL 体积: {total_size / 1024 / 1024:.2f} MB\n")

    # 参考项目对比
    print("[对比参考] 参考项目的 DLL 情况:")
    print("  - 总数量: 71 个")
    print("  - 总体积: 93.23 MB")
    print("  - 最大的: libopenblas (26.85 MB), opengl32sw (15.25 MB)\n")

    # 分析大于 3MB 的 DLL
    large_dlls = [(dll, size) for dll, size in dll_data if size > 3 * 1024 * 1024]

    if large_dlls:
        print("=" * 70)
        print("WARNING:  大于 3MB 的 DLL（需重点关注）")
        print("=" * 70)

        for dll, size in large_dlls:
            size_mb = size / 1024 / 1024
            relative_path = dll.relative_to(dist_dir)
            name_lower = dll.name.lower()

            print(f"\n{size_mb:8.2f} MB  {dll.name}")
            print(f"           位置: {relative_path.parent}")

            # 优化建议
            suggestions = get_optimization_suggestion(name_lower)
            if suggestions:
                for suggestion in suggestions:
                    print(f"            {suggestion}")

    # 检查冗余 DLL
    print("\n" + "=" * 70)
    print(" 冗余检查")
    print("=" * 70)

    # 检查调试版本
    debug_dlls = [dll for dll, _ in dll_data if dll.stem.endswith('d')]
    if debug_dlls:
        print(f"\nWARNING:  发现 {len(debug_dlls)} 个调试版本 DLL（可以删除）:")
        for dll in debug_dlls:
            print(f"  - {dll.name}")
    else:
        print("\nPASS: 未发现调试版本 DLL（已优化）")

    # VC++ Runtime
    vc_runtimes = [dll for dll, _ in dll_data if 'vcruntime' in dll.name.lower() or 'msvcp' in dll.name.lower()]
    if vc_runtimes:
        print(f"\n[VC++ Runtime 库] 发现 {len(vc_runtimes)} 个:")
        for dll in vc_runtimes:
            size_mb = dll.stat().st_size / 1024 / 1024
            print(f"  - {dll.name} ({size_mb:.2f} MB)")
        print("   这些是必需的，参考项目也包含了这些文件")

    # 全部 DLL 列表
    print("\n" + "=" * 70)
    print(" 完整 DLL 列表（按体积排序，前 20）")
    print("=" * 70)
    print(f"\n{'体积 (MB)':>10}  {'文件名':<30}  位置")
    print("-" * 70)

    for dll, size in dll_data[:20]:
        size_mb = size / 1024 / 1024
        relative_path = dll.relative_to(dist_dir)
        location = str(relative_path.parent) if relative_path.parent != Path('.') else "根目录"
        print(f"{size_mb:10.2f}  {dll.name:<30}  {location}")

    if len(dll_data) > 20:
        remaining_size = sum(size for _, size in dll_data[20:]) / 1024 / 1024
        print(f"... 还有 {len(dll_data) - 20} 个 DLL，共 {remaining_size:.2f} MB")


def get_optimization_suggestion(dll_name: str) -> list:
    """根据 DLL 名称给出优化建议"""
    suggestions = []

    if "openblas" in dll_name or "mkl" in dll_name:
        suggestions.append("数学运算库，参考项目的 libopenblas 有 26.85 MB")
        suggestions.append("如不需要高性能计算可考虑轻量版")

    elif "opencv" in dll_name or "ffmpeg" in dll_name:
        suggestions.append("OpenCV 相关，参考项目的 opencv_videoio_ffmpeg 有 18.48 MB")
        suggestions.append("考虑用 opencv-python-headless")

    elif "qt5" in dll_name or "qt6" in dll_name or "pyside" in dll_name:
        suggestions.append("Qt 库，参考项目的 Qt5Core 有 5.13 MB")
        suggestions.append("可排除不需要的模块（WebEngine, 3D, Charts）")

    elif "opengl" in dll_name and "sw" in dll_name:
        suggestions.append("OpenGL 软件渲染器，参考项目保留了 15.25 MB")
        suggestions.append("通常可以删除（使用硬件渲染）")

    elif "d3dcompiler" in dll_name:
        suggestions.append("DirectX 编译器，参考项目有 3.53 MB")

    elif "mfc140" in dll_name:
        suggestions.append("MFC 库，参考项目有 4.89 MB")

    return suggestions


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python analyze_dlls.py <dist目录路径>")
        print("示例: python analyze_dlls.py dist/main.dist")
        sys.exit(1)

    analyze_dlls(sys.argv[1])
```

**Como usar**:
```bash
python analyze_dlls.py dist/你的软件名.dist
```

---

## Fluxo de Trabalho Completo de Otimização

### Passo 1: Modificar a configuração do script de compilação

Edite `build_optimized.bat`, alterando estas 3 linhas:

```batch
set APP_NAME=你的软件名      REM 改成实际名称
set MAIN_FILE=main.py        REM 你的主程序文件
set ICON_FILE=icon.ico       REM 你的图标文件
```

### Passo 2: Compilação + redução com um clique

```bash
# 在项目根目录执行
build_optimized.bat
```

### Passo 3: Analisar as dependências de DLL

```bash
python analyze_dlls.py dist/你的软件名.dist
```

### Passo 4: Otimizar com base nos resultados da análise

**Se usou OpenCV** → troque para a versão headless
```bash
pip uninstall opencv-python
pip install opencv-python-headless
```

**Se usou Qt** → exclua os módulos desnecessários
```batch
# 在编译命令中添加
--nofollow-import-to=PyQt5.QtWebEngine,PyQt5.Qt3D,PyQt5.QtCharts
```

**Remova o renderizador de software** (se não for necessário)
```powershell
# 在 dist 目录执行
Remove-Item "opengl32sw.dll" -Force
```

---

## Soluções para Tratamento das Bibliotecas de Runtime VC++

### Solução um: Linkagem estática (recomendado)
```bash
nuitka --static-libpython=yes ...
```

### Solução dois: Instalação empacotada das bibliotecas de runtime (recomendado para distribuição comercial)
Adicione ao script do Inno Setup:

```iss
; WARNING: VC++ 运行库架构必须与 Python/Nuitka 构建架构一致。
; 本 skill 推荐 32 位 Python，故默认捆绑 vc_redist.x86.exe；
; 若用 64 位 Python 编译，请把下面两处改为 vc_redist.x64.exe。
[Files]
Source: "{#MySourceDir}\..\vc_redist.x86.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Run]
Filename: "{tmp}\vc_redist.x86.exe"; Parameters: "/quiet /norestart"; StatusMsg: "正在安装运行库..."; Flags: waituntilterminated
```

> Endereço de download: [Microsoft Visual C++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist)

---

## Modelo de Script do Inno Setup (versão definitiva comercial)

```iss
; =====================================================================
;  WARNING: 商业级 Python 安装脚本 (Inno Setup 6.x)
;  特性：LZMA2 极限压缩 | 全中文 | 完整元数据 | 无残留卸载
;  参考：参考项目(323 MB, LZMA2 压缩)
; =====================================================================

; --- 1. 参数定义 ---
#define MyAppName        "{{APP_NAME}}"
#define MyAppVersion     "{{APP_VERSION}}"
#define MyAppPublisher   "{{PUBLISHER}}"
#define MyAppURL         "{{APP_URL}}"
#define MyAppExeName     "{{EXE_NAME}}"
#define MySourceDir      "{{SOURCE_DIR}}"
#define MyOutputDir      "{{OUTPUT_DIR}}"
;#define MyIconPath      "{{ICON_PATH}}"

[Setup]
; --- 身份识别 ---
AppId={{GENERATE_RANDOM_GUID}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; --- 安装路径与权限 ---
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableDirPage=no
DisableProgramGroupPage=no
PrivilegesRequired=admin

; --- 输出设置 ---
OutputDir={#MyOutputDir}
OutputBaseFilename=Setup_{#MyAppName}_v{#MyAppVersion}

; --- 视觉体验 ---
WizardStyle=modern
#ifdef MyIconPath
SetupIconFile={#MyIconPath}
UninstallDisplayIcon={app}\{#MyAppExeName}
#endif

; ---  核心压缩 (参考 参考项目) ---
Compression=lzma2/ultra64
SolidCompression=yes
LZMAUseSeparateProcess=yes

; --- 架构 ---
; 注意：仅 64 位 Python 构建才设此项。本 skill 推荐 32 位 Python——
; 32 位构建请保持注释，使应用按 32 位安装并与上面捆绑的 vc_redist.x86.exe 匹配。
; 仅当用 64 位 Python 编译时才取消注释。
;ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "chinesesimplified"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"

[Files]
Source: "{#MySourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[UninstallDelete]
Type: filesandordirs; Name: "{app}\*"

[Icons]
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\卸载 {#MyAppName}"; Filename: "{uninstallexe}"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#MyAppName}}"; Flags: nowait postinstall skipifsilent
```

---

## Descrição dos Placeholders

| Placeholder | Descrição | Valor de exemplo |
|--------|------|--------|
| `{{APP_NAME}}` | Nome de exibição do software | `红墨批注` |
| `{{APP_VERSION}}` | Número de versão | `1.0.0` |
| `{{PUBLISHER}}` | Publicador/nome da empresa | `MyCompany` |
| `{{APP_URL}}` | Endereço do site | `https://example.com` |
| `{{EXE_NAME}}` | Nome do arquivo do programa principal | `RedInk.exe` |
| `{{SOURCE_DIR}}` | Caminho da pasta dist do Nuitka | `D:\project\dist\RedInk.dist` |
| `{{OUTPUT_DIR}}` | Caminho de saída do instalador | `D:\project\output` |
| `{{ICON_PATH}}` | Caminho do arquivo de ícone | `D:\project\icon.ico` |
| `{{GENERATE_RANDOM_GUID}}` | **Necessário gerar um GUID único** | Use "Tools > Generate GUID" do Inno Setup |

---

## Perguntas Frequentes (FAQ)

### Q1: Após a instalação, dar duplo clique no programa não tem reação?
1. Abra o CMD e execute o exe manualmente para ver a mensagem de erro
2. Verifique se faltam as bibliotecas de runtime VC++
3. Verifique se a compilação do Nuitka foi bem-sucedida

### Q2: O instalador é muito grande?
**Métodos de otimização**:
1. Compile com Python de 32 bits (economiza 20-30%)
2. Aplique a lista de exclusão de módulos do projeto de referência
3. Habilite o plugin Anti-Bloat
4. Execute o script de redução da pasta dist
5. Analise as DLLs e remova arquivos grandes desnecessários

### Q3: O antivírus dá falso positivo?
**Soluções**:
- Submeta aos principais fabricantes de antivírus para solicitar inclusão na lista de permissões
- Compre um certificado de assinatura de código (recomendado: Sectigo, DigiCert)
- Evite usar a compressão UPX

### Q4: Durante a instalação aparece "O Windows protegeu o seu computador"?
- Compre um certificado de assinatura de código EV (obtém confiança imediatamente)
- Certificados de assinatura de código comuns precisam acumular volume de instalações para ganhar confiança gradualmente

---

## Registro de Tratamento de Problemas Práticos (atualizado em 2026-02-07)

- **Após a instalação aparece falta de python3xx.dll**: é obrigatório usar `--standalone` do Nuitka; confirme que essa dll existe dentro do dist; não empacote a versão de arquivo único.
- **Após a instalação clicar não tem reação**: a inicialização da GUI pode estar bloqueada por dependências pesadas; adie as dependências pesadas para o momento de "iniciar a exportação" e só então faça o import; adicione logs para investigar.
- **Nuitka + MinGW dá erro em caminhos não-ASCII**: copie o código-fonte para um diretório ASCII e recompile; defina `PYTHONIOENCODING=utf-8`.
- **O Inno Setup avisa que `x64` está obsoleto (necessário apenas quando um build de 64 bits requer o modo de instalação de 64 bits)**: altere para `ArchitecturesInstallIn64BitMode=x64compatible`; builds de 32 bits não precisam disso.
- **`--disable-console` foi descontinuado**: use `--windows-console-mode=disable`.
- **O dist apresenta `_nuitka_temp.exe`**: exclua-o em [Files].

---

## Resultados Esperados de Otimização

| Combinação de otimização | Redução de tamanho | Ganho de inicialização | Nível de risco |
|----------|----------|----------|----------|
| Compilação básica | base | base | nenhum |
| + `--lto=yes` | 5-10% | 10-20% | PASS: nenhum |
| + anti-bloat | 15-25% | - | PASS: nenhum |
| + exclusão de módulos | 20-35% | 5% | PASS: nenhum |
| + redução do dist | 25-40% | - | PASS: nenhum |
| + compilação de 32 bits | 40-60% | - | PASS: nenhum |
| **Todas combinadas** | **45-65%** | **15-25%** | PASS: **sem risco** |

> WARNING: **Não é recomendado usar a compressão UPX**; embora possa reduzir ainda mais o tamanho, dispara facilmente falsos positivos de antivírus.

---

**Otimizado com base na experiência prática do projeto de referência, para ajudá-lo a criar instaladores de nível comercial!**
