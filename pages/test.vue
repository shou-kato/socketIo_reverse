<template>
  <v-app id="inspire">
    <v-app-bar app color="indigo" dark>
      <v-toolbar-title>reverse</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col class="text-center">
            <v-card class="mx-auto" max-width="400" max-height="300" outlined>
              <v-card-text>待機ルームへ</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-footer color="indigo" app>
      <span class="white--text mx-auto"
        >&copy; {{ new Date().getFullYear() }} higeqq</span
      >
    </v-footer>
  </v-app>
</template>
