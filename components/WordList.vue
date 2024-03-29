<template>
  <div>
    <ul :class="classes" data-collapse-target>
      <li
        :class="{
          'wordlist-item': true,
          matched:
            matchedWords &&
            matchedWords.map((word) => word.id).includes(word.id),
        }"
        v-for="(word, index) in words || wordFromIds || []"
        :key="`word-list-word-${index}-${word.id}`"
      >
        <Star
          v-if="word && star === true"
          :word="word"
          :removeSymbol="removeSymbol"
          :label="false"
          class="pr-2"
        ></Star>
        <Speak
          v-if="showSpeak"
          :text="word.kana || word.head"
          :l2="$l2"
          class="text-secondary"
        />
        <router-link
          v-if="compareWith"
          :to="`/${$l1.code}/${$l2.code}/compare/${$dictionaryName}/${compareWith.id},${word.id}`"
          :class="`btn btn-sm btn-no-bg mr-0`"
          style="margin-bottom: 0.4rem"
        >
          <i class="fas fa-adjust"></i>
        </router-link>
        <router-link
          v-if="word"
          :to="getUrl(word, index)"
          :title="word.definitions ? filterDefinitions(word).join(',') : ''"
        >
          <span
            :class="{ 'wordlist-item-word': true, transparent: hideWord }"
            :data-level="skin !== 'dark' ? getLevel(word) : undefined"
          >
            <span v-if="$l2.code === 'de' && word.gender">
              {{ { n: "das", m: "der", f: "die" }[word.gender] }}
            </span>
            {{ word.accented || word.head }}
          </span>

          <span :class="{ transparent: hidePhonetics }">
            <span v-if="word.pronunciation" class="wordlist-item-pinyin">
              <span
                v-if="$l2.code === 'vi'"
                v-html="
                  '[' +
                  word.pronunciation.replace(
                    /\[\[(.+?)#Vietnamese\|.+?]]/g,
                    '$1'
                  ) +
                  ']'
                "
              />
              <span v-else>[{{ word.pronunciation }}]</span>
            </span>
            <span v-if="word.kana" class="wordlist-item-pinyin">
              ( {{ word.kana }}
              <template v-if="word.romaji">, {{ word.romaji }}</template> )
            </span>
            <span
              v-if="
                ['ko', 'vi'].includes($l2.code) &&
                word.cjk &&
                word.cjk.canonical
              "
              class="wordlist-item-byeonggi"
            >
              {{ word.cjk.canonical }}
            </span>
          </span>
          <span
            v-if="word.definitions"
            :class="{ 'wordlist-item-l1': true, transparent: hideDefinitions }"
          >
            <span class="word-type" v-if="word.pos">
              {{
                word.gender
                  ? { m: "masculine", f: "feminine", n: "neuter" }[word.gender]
                  : ""
              }}
              {{ word.pos }}
              {{
                word.heads && word.heads[0] && word.heads[0][1]
                  ? word.heads[0][1]
                  : ""
              }}:
            </span>
            {{ wordDefinition(word) }}
          </span>
          <span
            :class="{ 'wordlist-item-l1': true, transparent: hideDefinitions }"
            v-if="word.counters"
          >
            :
            <span style="font-style: normal">
              {{
                word.counters
                  .map((counter) => "一" + counter.simplified)
                  .join(word.simplified + "、") + word.simplified
              }}。
            </span>
          </span>
        </router-link>
      </li>
      <li
        class="wordlist-item"
        v-for="(text, index) in texts"
        :key="`word-list-item-${index}`"
      >
        <Star v-if="text && star === true" :text="text" class="mr-1"></Star>
        <span class="wordlist-item-word ml-1" data-level="outside">
          {{ text }}
        </span>
      </li>
    </ul>
    <ShowMoreButton
      v-if="collapse > 0"
      :length="words.length"
      :min="collapse"
    />
  </div>
</template>
<script>
import Helper from "@/lib/helper";

export default {
  props: {
    words: {
      type: Array,
    },
    ids: {
      type: Array,
    },
    texts: {
      type: Array,
    },
    matchedWords: {
      default: undefined,
    },
    compareWith: {
      default: false,
    },
    traditional: {
      default: false,
    },
    highlight: {
      default: false,
    },
    collapse: {
      default: 0,
    },
    star: {
      default: true,
    },
    level: {
      default: false,
    },
    url: {
      type: Function,
    },
    skin: {
      default: null,
    },
    hideWord: {
      default: false,
    },
    hideDefinitions: {
      default: false,
    },
    hidePhonetics: {
      default: false,
    },
    maxDefinitions: undefined,
    removeSymbol: {
      default: false,
    },
    showSpeak: {
      default: true,
    },
  },
  computed: {
    classes() {
      let classes = {
        wordlist: true,
        "list-unstyled": true,
        collapsed: this.collapse > 0,
      };
      classes[`collapse-${this.collapse}`] = true;
      classes[`skin-${this.$skin}`] = true;
      return classes;
    },
  },
  asyncComputed: {
    async wordFromIds() {
      if (this.ids) {
        let dictionary = await this.$getDictionary();
        let words = await Promise.all(
          this.ids.map(async (id) => {
            let word = await dictionary.get(id);
            if (this.$l2.code === "ja")
              word.romaji = await dictionary.transliterate(text);
            return word;
          })
        );
        words = words ? words.filter((w) => w) : [];
        return words;
      }
    },
  },
  methods: {
    wordDefinition(word) {
      // word.definitions ? filterDefinitions(word).join(", ") : ""
      let definitions = this.filterDefinitions(word);
      if (definitions) {
        return definitions.join('; ');
      }
      return ""
    },
    filterDefinitions(word) {
      if (!word.definitions) return;
      let definitions = word.definitions;
      if (this.$l2.code === "zh")
        definitions = definitions.filter((def) => !def.startsWith("CL"));
      definitions = Helper.unique(definitions);
      if (this.maxDefinitions)
        definitions = definitions.slice(0, this.maxDefinitions);
      return definitions;
    },
    unique(list) {
      return Helper.unique(list);
    },
    getUrl(word, index) {
      if (!word) return;
      if (this.url) return this.url(word, index);
      else
        return `/${this.$l1.code}/${this.$l2.code}/dictionary/${this.$dictionaryName}/${word.id}`;
    },
    getLevel(word) {
      if (this.$l2.code === "zh" && word) {
        if (word.newHSK && word.newHSK === "7-9") {
          return "7-9";
        } else if (word.hsk !== "outside") {
          return word.hsk;
        } else if (word.hsk === "outside" && word.weight < 750) {
          return "outside";
        } else {
          return false;
        }
      } else {
        return word.level || "outside";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";
.word-type {
  opacity: 0.7;
}

.wordlist-item {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.wordlist.skin-light {
  .wordlist-item a {
    .wordlist-item-pinyin,
    .wordlist-item-pinyin * {
      color: #779bb5;
    }

    .wordlist-item-l1 {
      color: #666;
    }

    .wordlist-item-byeonggi {
      color: rgb(143, 158, 172);
    }
  }
}

.wordlist.skin-dark {
  .wordlist-item a {
    .wordlist-item-pinyin,
    .wordlist-item-pinyin * {
      color: rgba(255, 255, 255, 0.589);
    }
    .wordlist-item-l1 {
      color: rgba(255, 255, 255, 0.781);
    }
  }
}

.wordlist {
  margin-bottom: inherit;

  .wordlist-item {
    a {
      color: $primary-color;
    }

    a:hover {
      text-decoration: none;
    }

    .wordlist-item-word {
      font-weight: bold;
      font-size: 1.4em;
    }

    &.matched {
      opacity: 0.2;
    }
    .wordlist-item-pinyin,
    .wordlist-item-pinyin * {
      font-family: AndikaW, Andika, Arial, sans-serif;
    }
  }
}
</style>
