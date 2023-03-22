<template>
  <span
    :class="{
      'word-block': true,
      'with-popup': popup,
      'with-quick-gloss': saved && definition,
      sticky,
      common,
      seen,
      saved,
      obscure,
    }"
  >
    <template>
      <span
        class="word-block-definition"
        v-if="definition"
        v-html="definition"
      ></span>
      <span class="word-block-pinyin" v-if="phonetics">
        {{ phonetics }}
      </span>
      <span class="word-block-text-byeonggi-wrapper">
        <span :class="classes">
          {{ text }}
        </span>
        <span
          v-if="hanja"
          class="word-block-text-byeonggi d-inline-block"
          v-html="hanja"
        />
        <span v-if="saved && definition" class="word-block-text-quick-gloss">
          {{ definition }}
        </span>
      </span>
    </template>
  </span>
</template>

<script>
export default {
  props: {
    popup: {
      default: true,
    },
    sticky: {
      default: false, // whether or not to show each word's level color by default (without hovering)
    },
    common: {
      default: false,
    },
    seen: {
      default: false, // whether this word has already been annotated ('seen') before
    },
    saved: {
      default: false,
    },
    obscure: {
      default: false,
    },
    definition: {
      default: undefined,
    },
    text: {
      default: ""
    },
    hanja: {
      default: undefined
    },
    phonetics: {
      default: undefined
    }
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    classes() {
      let classes = {
        "word-block-text d-inline-block": true,
        klingon: this.$l2.code === "tlh",
        "word-block-hard": this.hard,
      };
      if (this.pos) classes[`pos-${pos}`] = pos
      return classes
    },
  },
};
</script>

<style lang="scss" scoped>
.main-dark {
  .word-block,
  .word-block-unknown {
    color: #ccc;
    &.animate {
      animation-name: shine;
      animation-iteration-count: 1;
      animation-duration: 2s;
      animation-timing-function: ease-in-out;
    }
    &.saved.animate {
      animation-name: shinesaved;
    }
  }
}

.word-block.obscure {
  opacity: 0;
}

@keyframes shine {
  0% {
    color: #ccc;
  }
  10% {
    color: #54ff7c;
  }
  100% {
    color: #ccc;
  }
}

@keyframes shinesaved {
  0% {
    color: #28a745;
  }
  10% {
    color: #54ff7c;
  }
  100% {
    color: #28a745;
  }
}

.word-block.with-popup {
  cursor: pointer;

  &.saved {
    font-weight: bold;
  }

  &:hover {
    background-color: rgba(250, 248, 195, 0.5);
    border-radius: 0.25rem;
  }
}

.widget-dark .word-block.with-popup:hover,
.main-dark .word-block.with-popup:hover {
  background-color: #00000066;
}

.word-block-text-quick-gloss {
  font-size: 0.8rem;
  opacity: 0.8;
  font-weight: normal;
}

.word-block-text-byeonggi-wrapper {
  font-size: 0.1em;

  .word-block-text {
    font-size: 10em;
  }

  .word-block-text-byeonggi {
    color: rgba(143, 158, 172, 0.8);
    font-size: 6em;
  }
}

.show-quick-gloss {
  [dir="ltr"] .word-block.saved.with-quick-gloss {
    text-align: left;
  }

  [dir="rtl"] .word-block.saved.with-quick-gloss {
    text-align: right;
  }
}

.add-pinyin {
  .word-block {
    display: inline-block;
    text-align: center;
    margin: 0;
    position: relative;
    text-indent: 0;

    .word-block-pinyin,
    .word-block-text-byeonggi-wrapper {
      display: block;
      line-height: 1.3;
      text-indent: 0;
    }

    /* Hide by default */
    .word-block-pinyin,
    .word-block-simplified,
    .word-block-traditional,
    .word-block-definition {
      display: none;
    }
  }
}

.word-block-text-byeonggi,
.word-block-text-quick-gloss {
  display: none;
}

/* Shown on demand */

.show-pinyin .word-block .word-block-pinyin,
.show-simplified .word-block .word-block-simplified,
.show-traditional .word-block .word-block-traditional,
.show-definition .word-block .word-block-definition {
  display: block;
}

.show-pinyin .word-block .word-block-hard {
  // text-decoration: underline;
  background-color: rgba(255, 226, 129, 0.137);
}

.show-byeonggi .word-block .word-block-text-byeonggi {
  display: inline;
}

.show-quick-gloss .word-block .word-block-text-quick-gloss {
  display: inline;
}

.show-definition .word-block {
  position: relative;
}

/* Line style */

.word-block-pinyin {
  font-size: 0.8rem;
  margin: 0 0.2rem;
  opacity: 0.7;
}

[dir="rtl"] .annotate-template {
  font-size: 1.33em;
  .word-block-pinyin {
    font-size: 0.7em;
  }
}

.word-block.saved {
  .word-block-pinyin {
    opacity: 1;
    font-weight: normal;
  }
}

.word-block-definition {
  display: none;
  color: #aaa;
  font-size: 0.7em;
  font-style: italic;
  margin-top: 0.5em;
  max-width: 6rem;
  margin: 0 0.5em 0.2em 0.5em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.word-block-simplified,
.word-block-traditional,
.word-block-text {
  &.pos-verb,
  &.pos-Verb,
  &.pos-動詞 {
    border-bottom: 1px solid rgba(204, 204, 204, 0.5);
  }
}

.show-pinyin-for-saved {
  .word-block:hover:not(.saved) {
    .word-block-pinyin {
      display: inherit;
      position: absolute;
      top: -1.25em;
      left: 50%;
      margin-left: -5em;
      width: 10em;
    }
  }

  .word-block.saved {
    margin-left: 0.1rem;
    margin-right: 0.1rem;

    .word-block-pinyin {
      display: block;
    }
  }
}
</style>