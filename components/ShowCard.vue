<template>
  <div style="padding-bottom: 2rem">
    <div class="deck3"></div>
    <div class="deck2"></div>
    <div class="deck1"></div>
    <div :class="{
      'tv-show-card media': true,
      'tv-show-card-hidden': show.hidden,
      [`skin-${$skin}`]: true,
    }">
      <router-link class="youtube-thumbnail-wrapper aspect-wrapper d-block" :to="$adminMode ? {
          name: 'show',
          params: { type: slug, id: show.id }
        } : {
          name: 'video-view',
          params: { type: 'youtube', youtube_id: show.youtube_id },
        }">
        <img :src="`https://img.youtube.com/vi/${show.youtube_id}/hqdefault.jpg`" class="youtube-thumbnail aspect" />
      </router-link>
      <div class="tv-show-card-title">
        <router-link :to="{
            name: 'video-view',
            params: { type: 'youtube', youtube_id: show.youtube_id },
          }" class="link-unstyled">
          <h6 class="mb-0">
            {{ show.title }}
            <span v-if="show.level" :data-bg-level="levels[show.level].level" class="level-tag">
              {{ levels[show.level].name }}
            </span>
          </h6>
        </router-link>
        <div class="statistics">
          <span v-if="show.avg_views">
            <i class="fa-solid fa-eye"></i>
            {{ formatK(show.avg_views) }}
          </span>
          <span v-if="show.locale">
            <img v-if="country" :alt="`Flag of ${country.name}`"
              :title="`Flag of ${country.name} (${country.alpha2Code})`"
              :src="`/vendor/flag-svgs/${country.alpha2Code}.svg`" class="flag-icon mr-1"
              style="width: 1rem; position: relative; bottom: 0.1rem" />
            {{ localeDescription }}
          </span>
          <span v-if="show.category">
            {{ $t(categories[show.category]) }}
          </span>
        </div>
        <div v-if="$adminMode">
          <b-button v-if="$adminMode" size="sm" class="admin-hide-button" @click.stop.prevent="toggle(show, 'hidden')">
            <i class="far fa-eye" v-if="show.hidden"></i>
            <i class="far fa-eye-slash" v-else></i>
          </b-button>
          <b-button v-if="$adminMode" size="sm" class="admin-audiobook-button"
            @click.stop.prevent="toggle(show, 'audiobook')">
            <i class="fa fa-microphone" v-if="show.audiobook"></i>
            <i class="fa fa-microphone-slash" v-else></i>
          </b-button>
          <b-button v-if="$adminMode" size="sm" class="admin-remove-button" @click.stop.prevent="remove(show)">
            <i class="fa fa-trash"></i>
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { languageLevels, formatK } from "@/lib/utils";
import { mapState } from "vuex";
import Vue from "vue";
export default {
  data() {
    return {
      field: this.type === "tvShows" ? "tv_show" : "talk",
      slug: this.type === "tvShows" ? "tv-show" : "talk",
      localeDescription: undefined,
      country: undefined,
      language: undefined,
    };
  },
  props: {
    show: {
      type: Object,
    },
    type: {
      type: String, // 'tvShows' or 'talks'
    },
  },
  computed: {
    ...mapState("shows", ["categories"]),
    levels() {
      return languageLevels(this.$l2);
    },
  },
  async mounted() {
    if (this.show?.locale) {
      let { country, language, description } = await this.getLocaleDescription(
        this.show.locale
      );
      if (description) this.localeDescription = description;
      if (country) this.country = country;
      if (language) this.language = language;
    }
  },
  methods: {
    formatK(number) {
      return formatK(number, 2, this.$l1.code);
    },
    async getLocaleDescription(locale) {
      let language, country;
      let [langCode, countryCode] = locale.split("-");
      language = await this.$languages.getSmart(langCode);
      if (countryCode) {
        country = await this.$languages.countryFromCode(countryCode);
      }
      let description = `${language ? this.$t(language.name) : ""}`;
      if (country) description += ` (${this.$t(country.name)})`;
      return { country, language, description };
    },
    async remove(show) {
      if (
        confirm(
          `Are you sure you want to remove the show "${show.title} (${show.id})?"`
        )
      ) {
        this.$store.dispatch("shows/remove", {
          l2: this.$l2,
          type: this.type,
          show,
        });
      }
    },
    async toggle(show, property) {
      let toggled = !show[property]; // If true, make it false, and vice versa
      let path = `items/${this.field}s/${show.id}`;
      let payload = {};
      payload[property] = toggled;
      let response = await this.$directus.patch(path, payload, {
        contentType: "application/json",
      });
      if (response && response.data.data) {
        Vue.set(show, property, toggled);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/variables.scss";

.deck1,
.deck2,
.deck3 {
  height: 4rem;
  position: absolute;
  left: 1rem;
  width: calc(100% - 2rem);
  border-radius: 0.25rem;
}

.skin-dark {

  .deck1,
  .deck2,
  .deck3 {
    background-color: #767676;
    box-shadow: 1px -3px 4px #00000070;
    border: 1px solid rgb(138, 138, 138);
  }
}


.skin-light {

  .deck1,
  .deck2,
  .deck3 {
    background-color: #ffffff;
    box-shadow: 1px -3px 4px #00000019;
    border: 1px solid rgb(217, 217, 217);
  }
}

.col-compact {

  .deck1,
  .deck2,
  .deck3 {
    left: 0.5rem;
    width: calc(100% - 1rem);
  }

  .deck1 {
    top: 0;
  }

  .deck2 {
    top: -0.5rem;
  }

  .deck3 {
    top: -1rem;
  }
}

.deck1 {
  top: -0.5rem;
  transform: scale(0.95);
}

.deck2 {
  top: -1rem;
  transform: scale(0.9);
  opacity: 0.66;
}

.deck3 {
  top: -1.4rem;
  transform: scale(0.85);
  opacity: 0.33;
}

.col-compact {
  padding: 0.5rem;

  :deep(.media-body) {
    font-size: 0.9em;
  }
}

.show-tag {
  font-size: 0.8em;
  color: #888;
}

.show-tags {
  line-height: 1;
}

.tv-show-card {
  position: relative;
  height: 100%;

  &.tv-show-card-hidden {
    opacity: 0.3;
  }

  .youtube-thumbnail {
    border-radius: 0.25rem;
  }

  .tv-show-card-title {
    padding-top: 0.5rem;

    a {
      z-index: 1;
      width: 100%;
    }
  }
}

.level-tag {
  font-size: 0.7em;
  border-radius: 0.25rem;
  display: inline-block;
  padding: 0.1rem 0.5rem;
  position: relative;
  bottom: 0.1rem;
}

.statistics {
  font-size: 0.8em;
  margin-top: 0.25rem;
}

.tv-show-card.skin-dark {
  .statistics {
    color: darken($text-color-on-dark, 33%);
  }
}

.tv-show-card.skin-light {
  .statistics {
    color: lighten($text-color-on-light, 33%);
  }
}

.statistics span+span::before {
  content: " · ";
  margin: 0 0.25rem;
}
</style>
