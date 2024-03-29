<template>
  <div>
    <div v-if="!openAIToken">
      <h5>{{ $t("ChatGPT Settings") }}</h5>
      <p>{{ $t("Enter your ChatGPT API token:") }}</p>
      <b-form-input type="password" v-model="openAIToken" :lazy="true"></b-form-input>
      <i18n path="Get your ChatGPT API token {0}." class="mt-1 small" tag="p">
        <a href="https://platform.openai.com/account/api-keys" target="_blank">
          {{ $t("here") }}
        </a>
      </i18n>
      <hr />
    </div>
    <div v-else>
      <div v-for="(message, index) in messages" :key="index" class="mt-4 mb-2">
        <div v-if="message.sender === 'user'">
          <div class="d-flex">
            <b style="flex: 0 0 1.5rem">{{ $t("Q:") }}</b>
            <b style="flex: 1">{{ message.text }}</b>
          </div>

          <div v-if="errorMessage" class="mt-3 alert alert-warning">
            {{ errorMessage }}
          </div>
        </div>
        <div v-if="message.sender === 'bot' && typeof message.text === 'string'" class="d-flex">
          <span style="flex: 0 0 1.5rem">{{ $t("A:") }}</span>
          <div style="flex: 1">
            <div v-for="(line, index) in message.text.split('\n')" :key="`gpt-respnose-${index}`" class="mb-2">
              <Annotate :buttons="true" :showTranslation="true" :showLoading="false">
                <span>{{ line }}</span>
              </Annotate>
            </div>
            <div class="text-right">
              <span @click="resendMessage(messages[index - 1])" class="btn btn-unstyled text-success mr-2">
                <i class="fa fa-sync mr-1"></i>
                {{ $t("Regenerate") }}
              </span>
              <router-link :to="{
                name: 'reader',
                params: {
                  method: 'md',
                  arg: message.text.replace('\n', '\n\n'),
                },
              }" class="text-success">
                <i class="fa fa-book-open mr-1"></i>
                {{ $t("Open in Reader") }}
                <i class="fa fa-chevron-right ml-1"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-3 text-center" v-if="thinking">
        <Loader :sticky="true" message="Getting response from ChatGPT..." />
      </div>
      <h6 v-if="!initialMessages[0]">{{ $t("Ask ChatGPT:") }}</h6>
      <input type="text" v-model="newMessage" @keydown.enter="sendMessage(newMessage)" v-if="!initialMessages[0]" />
    </div>
  </div>
</template>

<script>
import OpenAI from "openai-api";
import { timeout } from "@/lib/utils";
import Vue from "vue";

export default {
  props: {
    initialMessages: {
      default: [], // of Strings
    },
  },
  data() {
    return {
      messages: [],
      newMessage: "",
      openai: undefined,
      thinking: false,
      openAIToken: undefined,
      watcherActive: false,
      dictionary: undefined,
      errorMessage: undefined,
    };
  },
  async mounted() {
    if (typeof this.$store.state.settings !== "undefined") {
      this.openAIToken = this.$store.state.settings.openAIToken;
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_SETTINGS") {
        this.openAIToken = this.$store.state.settings.openAIToken;
      }
    });
    if (this.openAIToken) {
      this.openai = new OpenAI(this.openAIToken);
      for (let message of this.initialMessages) {
        await this.sendMessage(message);
      }
    }
    await timeout(2000);
    this.watcherActive = true;
  },
  watch: {
    async openAIToken() {
      if (this.watcherActive) {
        this.$store.dispatch("settings/setGeneralSettings", {
          openAIToken: this.openAIToken,
        });
        this.$toast.success("Token saved!", {
          duration: 2000,
        });
        this.openai = new OpenAI(this.openAIToken);
        for (let message of this.initialMessages) {
          await this.sendMessage(message);
        }
      }
    },
  },
  methods: {
    async getCompletion(prompt) {
      this.thinking = true;
      try {
        const response = await this.openai.complete({
          engine: "text-davinci-003",
          prompt,
          max_tokens: 800,
          n: 1,
          stop: undefined,
          temperature: 0.7,
        });
        this.thinking = false;
        return {
          text: response.data.choices[0].text.trim(),
          sender: "bot",
        };
      } catch (error) {
        this.thinking = false;
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          this.errorMessage = `Error from ChatGPT API: ${error.response.data.error.message}`;
          return { text: error.response.data.error, sender: "bot" };
        } else {
          this.errorMessage = `Error from ChatGPT API: ${error.message}`;
          return { text: error.message, sender: "bot" };
        }
      }
    },
    async getCompletionWithCache(prompt, useCache = true) {
      // Check if the response is already cached and useCache is true
      if (useCache && this.$store.state.chatGPTCache.cache[prompt]) {
        console.log("Using cached response");
        return this.$store.state.chatGPTCache.cache[prompt];
      }

      // If not, fetch the response from ChatGPT
      const response = await this.getCompletion(prompt); // Assuming getCompletion is the function that calls ChatGPT API

      // Save the response in the cache before returning it
      this.$store.dispatch("chatGPTCache/cacheChatGPTResponse", { prompt, response });
      return response;
    },
    async resendMessage(message) {
      if (!this.openai) return;

      let messageIndex = this.messages.findIndex(
        (m) => m.text === message.text
      );

      let botMessage = this.messages[messageIndex + 1];

      if (botMessage) {
        Vue.set(botMessage, "text", "");
        let newBotMessage = await this.getCompletionWithCache(message.text, false);
        Vue.set(this.messages, messageIndex + 1, newBotMessage);
      }
    },
    async sendMessage(text) {
      if (!this.openai) return;

      const message = {
        text: text || this.newMessage,
        sender: "user",
      };
      this.messages.push(message);
      this.newMessage = "";

      let botMessage = await this.getCompletionWithCache(message.text);
      this.messages.push(botMessage);
    },
  },
};
</script>
