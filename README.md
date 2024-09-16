# i-Diário App

Aplicativo para o professor com lançamento de frequência e registro de conteúdos offline, integrado com o software livre [i-Diário](https://github.com/portabilis/i-diario) e [i-Educar](https://github.com/portabilis/i-educar)

## Pré requisitos

- node.js (20+)
- npm


## Instalação

- Instalar a biblioteca do ionic

```bash
$ npm install -g @ionic/cli
```

- Baixar o i-Diário App:

```bash
$ git clone https://github.com/portabilis/i-diario-app.git
```

- Instalar as dependências

```bash
$ cd i-diario-app
$ npm install
```

- Iniciar o servidor

```bash
$  ionic serve
```

## Publicações na loja do Android e iOS

Seguir os passos na [documentação](https://ionicframework.com/docs/angular/your-first-app/deploying-mobile) do framework

## Sincronização com i-Diário

- Criar um usuário do tipo servidor, vinculado com um professor e com turmas no ano letivo atual
- Realizar login com o professor no aplicativo
- Clicar no ícone de sincronização


# Build Capacitor

```bash
$  ionic build
$  npx capacitor-assets generate
$  ionic cap add ios
$  ionic cap add android
$  ionic cap copy
$  ionic cap sync
$  ionic cap open ios
$  ionic cap open android
```
O projeto foi atualizado para   `@ionic/angular": "^7.0.0"` e `"@angular/common": "^17.0.2"`.
